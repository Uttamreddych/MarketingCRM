package com.flowcrm.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId; // Multi-tenant Isolation ID

    private String name;
    private String type; // e.g., Email, Social, Ad, WhatsApp
    private String status; // Active, Paused, Completed
    
    private Integer sentCount = 0;
    private Integer openCount = 0;
    private Integer clickCount = 0;
    
    private Double budget = 0.0;
    private Double spent = 0.0;
    
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Campaign() {
    }

    public Campaign(String name, String type, String status, Integer sentCount, Integer openCount, Integer clickCount, Double budget, Double spent, Long companyId) {
        this.name = name;
        this.type = type;
        this.status = status;
        this.sentCount = sentCount;
        this.openCount = openCount;
        this.clickCount = clickCount;
        this.budget = budget;
        this.spent = spent;
        this.companyId = companyId;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public Integer getSentCount() { return sentCount; }
    public void setSentCount(Integer sentCount) { this.sentCount = sentCount; }
    
    public Integer getOpenCount() { return openCount; }
    public void setOpenCount(Integer openCount) { this.openCount = openCount; }
    
    public Integer getClickCount() { return clickCount; }
    public void setClickCount(Integer clickCount) { this.clickCount = clickCount; }
    
    public Double getBudget() { return budget; }
    public void setBudget(Double budget) { this.budget = budget; }
    
    public Double getSpent() { return spent; }
    public void setSpent(Double spent) { this.spent = spent; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
