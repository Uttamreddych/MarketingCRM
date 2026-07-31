package com.flowcrm.backend.dto;

import java.util.List;
import java.util.Map;

public class DashboardStats {
    private long totalLeads;
    private long activeDeals;
    private double pipelineValue;
    private double winRate;
    
    private List<Map<String, Object>> funnelData;
    private List<Map<String, Object>> sourceData;
    private List<Map<String, Object>> chartData;
    
    // Getters and Setters
    public long getTotalLeads() { return totalLeads; }
    public void setTotalLeads(long totalLeads) { this.totalLeads = totalLeads; }
    
    public long getActiveDeals() { return activeDeals; }
    public void setActiveDeals(long activeDeals) { this.activeDeals = activeDeals; }
    
    public double getPipelineValue() { return pipelineValue; }
    public void setPipelineValue(double pipelineValue) { this.pipelineValue = pipelineValue; }
    
    public double getWinRate() { return winRate; }
    public void setWinRate(double winRate) { this.winRate = winRate; }
    
    public List<Map<String, Object>> getFunnelData() { return funnelData; }
    public void setFunnelData(List<Map<String, Object>> funnelData) { this.funnelData = funnelData; }
    
    public List<Map<String, Object>> getSourceData() { return sourceData; }
    public void setSourceData(List<Map<String, Object>> sourceData) { this.sourceData = sourceData; }
    
    public List<Map<String, Object>> getChartData() { return chartData; }
    public void setChartData(List<Map<String, Object>> chartData) { this.chartData = chartData; }
}
