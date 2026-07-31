package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Lead;
import com.flowcrm.backend.model.Activity;
import com.flowcrm.backend.repository.LeadRepository;
import com.flowcrm.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
public class CRMHealthController {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ActivityRepository activityRepository;

    // 1. Missed Opportunity Detector
    // Detects leads without follow-ups for more than 5 days
    @GetMapping("/missed-opportunities")
    public ResponseEntity<?> getMissedOpportunities(@RequestAttribute("companyId") Long companyId) {
        List<Lead> leads = leadRepository.findByCompanyId(companyId);
        List<Lead> neglectedLeads = new ArrayList<>();
        LocalDateTime cutoff = LocalDateTime.now().minusDays(5);

        for (Lead lead : leads) {
            if ("Won".equalsIgnoreCase(lead.getStatus()) || "Lost".equalsIgnoreCase(lead.getStatus())) {
                continue;
            }
            List<Activity> activities = activityRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId());
            if (activities.isEmpty()) {
                if (lead.getCreatedAt() != null && lead.getCreatedAt().isBefore(cutoff)) {
                    neglectedLeads.add(lead);
                }
            } else {
                Activity lastActivity = activities.get(0);
                if (lastActivity.getCreatedAt().isBefore(cutoff)) {
                    neglectedLeads.add(lead);
                }
            }
        }

        return ResponseEntity.ok(neglectedLeads.stream()
                .map(l -> Map.of(
                        "id", l.getId(),
                        "name", l.getName(),
                        "status", l.getStatus(),
                        "phone", l.getPhone() != null ? l.getPhone() : "",
                        "assignedTo", l.getAssignedTo() != null ? l.getAssignedTo() : "Unassigned",
                        "priority", l.getPriority()
                ))
                .collect(Collectors.toList()));
    }

    // 2. CRM Health Analyzer
    // Scans completeness of data fields and response ratios
    @GetMapping("/analyze")
    public ResponseEntity<?> analyzeCRMHealth(@RequestAttribute("companyId") Long companyId) {
        List<Lead> leads = leadRepository.findByCompanyId(companyId);
        if (leads.isEmpty()) {
            return ResponseEntity.ok(Map.of(
                    "score", 100,
                    "totalLeads", 0,
                    "warnings", List.of("No leads registered in workspace yet.")
            ));
        }

        int totalLeads = leads.size();
        int missingEmail = 0;
        int missingPhone = 0;
        int missingSource = 0;
        int lowProbability = 0;

        for (Lead lead : leads) {
            if (lead.getEmail() == null || lead.getEmail().trim().isEmpty()) missingEmail++;
            if (lead.getPhone() == null || lead.getPhone().trim().isEmpty()) missingPhone++;
            if (lead.getSource() == null || lead.getSource().trim().isEmpty()) missingSource++;
            if (lead.getConversionProbability() != null && lead.getConversionProbability() < 30) lowProbability++;
        }

        // Calculate completeness score
        double completeness = 100.0 - (((double) (missingEmail + missingPhone + missingSource) / (totalLeads * 3.0)) * 100.0);
        int finalScore = Math.max(0, (int) Math.round(completeness));

        List<String> warnings = new ArrayList<>();
        if (missingEmail > 0) warnings.add(missingEmail + " leads are missing email addresses.");
        if (missingPhone > 0) warnings.add(missingPhone + " leads are missing phone numbers.");
        if (missingSource > 0) warnings.add(missingSource + " leads are missing a referral source.");
        if (lowProbability > 0) warnings.add(lowProbability + " leads have high risk of churning (<30% probability).");

        return ResponseEntity.ok(Map.of(
                "score", finalScore,
                "totalLeads", totalLeads,
                "missingEmailCount", missingEmail,
                "missingPhoneCount", missingPhone,
                "missingSourceCount", missingSource,
                "warnings", warnings
        ));
    }

    // 3. Auto CRM Cleanup & Deduplication
    @PostMapping("/cleanup")
    public ResponseEntity<?> runAutoCleanup(@RequestAttribute("companyId") Long companyId) {
        List<Lead> leads = leadRepository.findByCompanyId(companyId);
        int mergedDuplicatesCount = 0;
        int archivedColdLeadsCount = 0;

        // Deduplication by normalized phone numbers
        Map<String, List<Lead>> groupedByPhone = leads.stream()
                .filter(l -> l.getNormalizedPhone() != null && !l.getNormalizedPhone().isEmpty())
                .collect(Collectors.groupingBy(Lead::getNormalizedPhone));

        for (Map.Entry<String, List<Lead>> entry : groupedByPhone.entrySet()) {
            List<Lead> group = entry.getValue();
            if (group.size() > 1) {
                // Keep the oldest lead, merge notes from others, delete duplicates
                group.sort(Comparator.comparing(Lead::getCreatedAt));
                Lead primary = group.get(0);
                StringBuilder mergedNotes = new StringBuilder(primary.getNotes() != null ? primary.getNotes() : "");

                for (int i = 1; i < group.size(); i++) {
                    Lead duplicate = group.get(i);
                    if (duplicate.getNotes() != null && !duplicate.getNotes().isEmpty()) {
                        mergedNotes.append("\n[Merged Note from duplicate]: ").append(duplicate.getNotes());
                    }
                    // Re-link activities of duplicate to primary lead
                    List<Activity> acts = activityRepository.findByLeadIdOrderByCreatedAtDesc(duplicate.getId());
                    for (Activity act : acts) {
                        act.setLeadId(primary.getId());
                        activityRepository.save(act);
                    }
                    leadRepository.delete(duplicate);
                    mergedDuplicatesCount++;
                }

                primary.setNotes(mergedNotes.toString());
                leadRepository.save(primary);
            }
        }

        // Archive cold leads: Move leads with <20% probability neglected for >30 days to status "Lost"
        LocalDateTime cutoff = LocalDateTime.now().minusDays(30);
        for (Lead lead : leads) {
            if ("Won".equalsIgnoreCase(lead.getStatus()) || "Lost".equalsIgnoreCase(lead.getStatus())) {
                continue;
            }
            if (lead.getConversionProbability() != null && lead.getConversionProbability() <= 20) {
                List<Activity> activities = activityRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId());
                boolean neglected = false;
                if (activities.isEmpty()) {
                    neglected = lead.getCreatedAt() != null && lead.getCreatedAt().isBefore(cutoff);
                } else {
                    neglected = activities.get(0).getCreatedAt().isBefore(cutoff);
                }

                if (neglected) {
                    lead.setStatus("Lost");
                    lead.setNotes((lead.getNotes() != null ? lead.getNotes() : "") + "\n[Auto Archived]: Moved to Lost due to inactivity.");
                    leadRepository.save(lead);
                    
                    Activity act = new Activity(null, lead.getId(), "Status Change", "Auto-archived lead to 'Lost' due to long inactivity.", LocalDateTime.now());
                    activityRepository.save(act);
                    
                    archivedColdLeadsCount++;
                }
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Auto CRM Cleanup completed successfully!",
                "mergedDuplicatesCount", mergedDuplicatesCount,
                "archivedColdLeadsCount", archivedColdLeadsCount
        ));
    }
}
