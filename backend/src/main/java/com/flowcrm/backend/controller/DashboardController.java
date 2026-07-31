package com.flowcrm.backend.controller;

import com.flowcrm.backend.dto.DashboardStats;
import com.flowcrm.backend.model.Lead;
import com.flowcrm.backend.repository.LeadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private LeadRepository leadRepository;

    @GetMapping("/stats")
    public DashboardStats getDashboardStats(@RequestAttribute("companyId") Long companyId) {
        List<Lead> leads = leadRepository.findByCompanyId(companyId);
        DashboardStats stats = new DashboardStats();
        
        stats.setTotalLeads(leads.size());
        
        long activeDeals = leads.stream().filter(l -> !"Won".equals(l.getStatus())).count();
        stats.setActiveDeals(activeDeals);
        
        double pipelineValue = leads.stream()
            .filter(l -> !"Won".equals(l.getStatus()) && l.getConversionProbability() != null)
            .mapToDouble(l -> l.getConversionProbability() * 100.0) // Mock value calculation
            .sum();
        stats.setPipelineValue(pipelineValue);
        
        long wonDeals = leads.stream().filter(l -> "Won".equals(l.getStatus())).count();
        double winRate = leads.isEmpty() ? 0 : ((double) wonDeals / leads.size()) * 100.0;
        stats.setWinRate(winRate);
        
        // Funnel Data (Performance Chart)
        Map<String, Long> statusCounts = leads.stream()
            .collect(Collectors.groupingBy(Lead::getStatus, Collectors.counting()));
        
        List<Map<String, Object>> funnel = new ArrayList<>();
        String[] statuses = {"New Lead", "Contacted", "Interested", "Negotiation", "Won"};
        for (String status : statuses) {
            Map<String, Object> map = new HashMap<>();
            map.put("name", status);
            map.put("value", statusCounts.getOrDefault(status, 0L));
            funnel.add(map);
        }
        stats.setFunnelData(funnel);
        
        // Source Data
        Map<String, Long> sourceCounts = leads.stream()
            .filter(l -> l.getSource() != null && !l.getSource().isEmpty())
            .collect(Collectors.groupingBy(Lead::getSource, Collectors.counting()));
            
        List<Map<String, Object>> sources = new ArrayList<>();
        sourceCounts.forEach((source, count) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", source);
            map.put("value", count);
            sources.add(map);
        });
        
        // Sort sources by count descending
        sources.sort((a, b) -> Long.compare((Long) b.get("value"), (Long) a.get("value")));
        stats.setSourceData(sources);

        // Chart Data (Last 7 Days)
        List<Map<String, Object>> chartDataList = new ArrayList<>();
        String[] days = {"Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"};
        java.time.LocalDate today = java.time.LocalDate.now();
        
        Map<String, long[]> dayStats = new LinkedHashMap<>();
        for (int i = 6; i >= 0; i--) {
            dayStats.put(days[today.minusDays(i).getDayOfWeek().getValue() % 7], new long[]{0, 0});
        }
        
        leads.forEach(lead -> {
            if (lead.getCreatedAt() != null) {
                java.time.LocalDate leadDate = lead.getCreatedAt().toLocalDate();
                if (leadDate.isAfter(today.minusDays(7)) && !leadDate.isAfter(today)) {
                    String dayName = days[leadDate.getDayOfWeek().getValue() % 7];
                    if (dayStats.containsKey(dayName)) {
                        dayStats.get(dayName)[0]++; // leads count
                        if ("Won".equals(lead.getStatus())) {
                            dayStats.get(dayName)[1] += (lead.getConversionProbability() != null ? lead.getConversionProbability() * 100 : 0);
                        }
                    }
                }
            }
        });
        
        dayStats.forEach((day, vals) -> {
            Map<String, Object> map = new HashMap<>();
            map.put("name", day);
            map.put("leads", vals[0]);
            map.put("conv", vals[1]);
            chartDataList.add(map);
        });
        stats.setChartData(chartDataList);

        return stats;
    }
}
