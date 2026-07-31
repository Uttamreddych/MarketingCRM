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
@Table(name = "whatsapp_messages")
public class WhatsAppMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long companyId; // Multi-tenant isolation
    private Long chatId;

    private String direction; // "INBOUND", "OUTBOUND"
    private String senderPhone;
    private String receiverPhone;

    @Column(columnDefinition = "TEXT")
    private String text;

    private String type; // "TEXT", "IMAGE", "TEMPLATE"
    private String status; // "SENT", "DELIVERED", "READ", "FAILED"

    private Boolean internalNote = false; // Is it an agent internal note?

    private Long agentId; // Who logged/sent this
    private String agentName;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
