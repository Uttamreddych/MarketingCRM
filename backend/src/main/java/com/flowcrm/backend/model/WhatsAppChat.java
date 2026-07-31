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
@Table(name = "whatsapp_chats")
public class WhatsAppChat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId; // Multi-tenant isolation

    @Column(nullable = false)
    private String customerPhone;
    
    private String customerName;
    private String status; // "OPEN", "RESOLVED"
    
    private Long assignedToUserId;
    private String assignedTo;

    private String lastMessageText;
    private LocalDateTime lastMessageTime;

    private Integer unreadCount = 0;

    private Long leadId; // Associated CRM Lead (if captured)

    @PrePersist
    protected void onCreate() {
        lastMessageTime = LocalDateTime.now();
    }
}
