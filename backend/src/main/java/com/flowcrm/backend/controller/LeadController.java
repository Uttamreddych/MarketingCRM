package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Lead;
import com.flowcrm.backend.model.Activity;
import com.flowcrm.backend.model.User;
import com.flowcrm.backend.repository.LeadRepository;
import com.flowcrm.backend.repository.ActivityRepository;
import com.flowcrm.backend.repository.UserRepository;
import com.flowcrm.backend.service.WorkflowExecutor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/api/leads")
@CrossOrigin(origins = "*")
public class LeadController {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkflowExecutor workflowExecutor;

    @GetMapping
    public List<Lead> getAllLeads(@RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByCompanyId(companyId);
    }

    @PostMapping
    public ResponseEntity<?> createLead(@RequestBody Lead lead, @RequestAttribute("companyId") Long companyId) {
        lead.setCompanyId(companyId);
        
        // 1. Duplicate Detection
        if (lead.getPhone() != null && !lead.getPhone().trim().isEmpty()) {
            String norm = lead.getPhone().replaceAll("[^0-9]", "");
            List<Lead> duplicates = leadRepository.findByCompanyIdAndNormalizedPhone(companyId, norm);
            if (!duplicates.isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                        "message", "A lead with this phone number already exists in your workspace.",
                        "existingLead", duplicates.get(0)
                ));
            }
        }

        // 2. Smart Round-Robin / Random Assignment
        if (lead.getAssignedToUserId() == null || lead.getAssignedTo() == null || lead.getAssignedTo().trim().isEmpty()) {
            List<User> companyUsers = userRepository.findByCompanyId(companyId);
            if (!companyUsers.isEmpty()) {
                User targetUser = companyUsers.get(new Random().nextInt(companyUsers.size()));
                lead.setAssignedToUserId(targetUser.getId());
                lead.setAssignedTo(targetUser.getUsername());
            } else {
                lead.setAssignedTo("Unassigned");
            }
        }

        Lead savedLead = leadRepository.save(lead);
        
        // Log automated creation activity
        Activity act = new Activity(null, savedLead.getId(), "Status Change", "Lead created and assigned to " + lead.getAssignedTo() + ".", LocalDateTime.now());
        activityRepository.save(act);

        // 3. Trigger Workflows
        try {
            workflowExecutor.triggerWorkflow(companyId, "NEW_LEAD", savedLead);
        } catch (Exception e) {
            // Log error but don't fail lead creation
            System.err.println("Failed to trigger workflow: " + e.getMessage());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLead);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Lead> getLeadById(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByIdAndCompanyId(id, companyId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLead(@PathVariable Long id, @RequestBody Lead leadDetails, @RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByIdAndCompanyId(id, companyId)
                .map(lead -> {
                    String oldStatus = lead.getStatus();
                    
                    lead.setName(leadDetails.getName());
                    lead.setEmail(leadDetails.getEmail());
                    lead.setPhone(leadDetails.getPhone());
                    lead.setSource(leadDetails.getSource());
                    lead.setStatus(leadDetails.getStatus());
                    lead.setPriority(leadDetails.getPriority());
                    lead.setNotes(leadDetails.getNotes());
                    lead.setAiSummary(leadDetails.getAiSummary());
                    lead.setConversionProbability(leadDetails.getConversionProbability());
                    lead.setNextBestAction(leadDetails.getNextBestAction());
                    lead.setSentiment(leadDetails.getSentiment());
                    
                    if (leadDetails.getAssignedToUserId() != null) {
                        lead.setAssignedToUserId(leadDetails.getAssignedToUserId());
                        userRepository.findById(leadDetails.getAssignedToUserId()).ifPresent(u -> lead.setAssignedTo(u.getUsername()));
                    } else if (leadDetails.getAssignedTo() != null) {
                        lead.setAssignedTo(leadDetails.getAssignedTo());
                    }
                    
                    Lead updatedLead = leadRepository.save(lead);
                    
                    // If status has changed, log it automatically and fire workflows
                    if (oldStatus != null && !oldStatus.equalsIgnoreCase(leadDetails.getStatus())) {
                        Activity act = new Activity(
                            null, 
                            updatedLead.getId(), 
                            "Status Change", 
                            "Moved lead stage from '" + oldStatus + "' to '" + leadDetails.getStatus() + "'.", 
                            LocalDateTime.now()
                        );
                        activityRepository.save(act);

                        try {
                            workflowExecutor.triggerWorkflow(companyId, "STAGE_CHANGE", updatedLead);
                        } catch (Exception e) {
                            System.err.println("Failed to trigger workflow: " + e.getMessage());
                        }
                    }
                    
                    return ResponseEntity.ok(updatedLead);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLead(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByIdAndCompanyId(id, companyId)
                .map(lead -> {
                    leadRepository.delete(lead);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- ACTIVITY LOG ENDPOINTS ---

    @GetMapping("/{id}/activities")
    public ResponseEntity<?> getLeadActivities(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByIdAndCompanyId(id, companyId)
                .map(lead -> ResponseEntity.ok(activityRepository.findByLeadIdOrderByCreatedAtDesc(lead.getId())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/activities")
    public ResponseEntity<Activity> logLeadActivity(@PathVariable Long id, @RequestBody Activity activity, @RequestAttribute("companyId") Long companyId) {
        return leadRepository.findByIdAndCompanyId(id, companyId)
                .map(lead -> {
                    activity.setLeadId(lead.getId());
                    if (activity.getCreatedAt() == null) {
                        activity.setCreatedAt(LocalDateTime.now());
                    }
                    Activity savedAct = activityRepository.save(activity);
                    return ResponseEntity.ok(savedAct);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
