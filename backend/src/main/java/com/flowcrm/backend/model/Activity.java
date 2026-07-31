package com.flowcrm.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "activities")
public class Activity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long leadId;
    
    private String type; // "Call", "Email", "Meeting", "Status Change"
    
    @Column(columnDefinition = "TEXT")
    private String summary;
    
    private LocalDateTime createdAt = LocalDateTime.now();
}
