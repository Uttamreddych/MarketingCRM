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
@Table(name = "workflows")
public class Workflow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId; // Multi-tenant isolation

    private String name;
    
    private String triggerType; // STAGE_CHANGE, NEW_LEAD, INBOUND_WHATSAPP

    @Column(columnDefinition = "TEXT")
    private String triggerConditions; // JSON format conditions e.g. {"status": "Interested"}

    @Column(columnDefinition = "TEXT")
    private String actions; // JSON format actions list e.g. [{"type": "SEND_WHATSAPP", "text": "Hi {name}!"}]

    private Boolean active = true;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
