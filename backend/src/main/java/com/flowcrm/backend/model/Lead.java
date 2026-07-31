package com.flowcrm.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "leads")
public class Lead {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long companyId; // Multi-tenant Isolation ID
    
    private String name;
    private String email;
    private String phone;
    private String normalizedPhone; // Used for duplicate detection
    private String source;
    private String status;
    private String priority;
    private String assignedTo;
    private Long assignedToUserId; // Reference to internal User ID
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(columnDefinition = "TEXT")
    private String aiSummary;
    
    private Integer conversionProbability;
    private String nextBestAction;
    private String sentiment;
    
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        normalizePhoneNumber();
    }

    @PreUpdate
    protected void onUpdate() {
        normalizePhoneNumber();
    }

    private void normalizePhoneNumber() {
        if (phone != null) {
            // Keep only digits
            this.normalizedPhone = phone.replaceAll("[^0-9]", "");
        }
    }
}
