package com.flowcrm.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tasks")
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId; // Multi-tenant isolation
    private Long leadId; // Optional link to Lead

    private String title;
    
    @Column(columnDefinition = "TEXT")
    private String description;

    private LocalDateTime dueDate;
    
    private String priority; // Low, Medium, High
    private Boolean completed = false;
    
    private Long assignedToUserId;
    private String assignedTo;

    private String type; // CALL, MEETING, EMAIL, FOLLOW_UP
    private String recurrence; // NONE, DAILY, WEEKLY, MONTHLY

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
