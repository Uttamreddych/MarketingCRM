package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.WhatsAppChat;
import com.flowcrm.backend.model.WhatsAppMessage;
import com.flowcrm.backend.model.Lead;
import com.flowcrm.backend.model.Activity;
import com.flowcrm.backend.repository.WhatsAppChatRepository;
import com.flowcrm.backend.repository.WhatsAppMessageRepository;
import com.flowcrm.backend.repository.LeadRepository;
import com.flowcrm.backend.repository.ActivityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/whatsapp")
@CrossOrigin(origins = "*")
public class WhatsAppController {

    @Autowired
    private WhatsAppChatRepository chatRepository;

    @Autowired
    private WhatsAppMessageRepository messageRepository;

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @GetMapping("/chats")
    public List<WhatsAppChat> getChats(@RequestAttribute("companyId") Long companyId) {
        return chatRepository.findByCompanyId(companyId);
    }

    @GetMapping("/chats/{chatId}/messages")
    public List<WhatsAppMessage> getMessages(@PathVariable Long chatId, @RequestAttribute("companyId") Long companyId) {
        // Mark all messages as read when opening chat
        chatRepository.findByIdAndCompanyId(chatId, companyId).ifPresent(chat -> {
            if (chat.getUnreadCount() > 0) {
                chat.setUnreadCount(0);
                chatRepository.save(chat);
            }
        });
        return messageRepository.findByCompanyIdAndChatIdOrderByTimestampAsc(companyId, chatId);
    }

    @PostMapping("/chats/{chatId}/send")
    public ResponseEntity<WhatsAppMessage> sendMessage(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> payload,
            @RequestAttribute("companyId") Long companyId
    ) {
        String text = payload.get("text");
        String agentName = payload.getOrDefault("agentName", "Agent");
        Long agentId = payload.containsKey("agentId") ? Long.parseLong(payload.get("agentId")) : null;

        return chatRepository.findByIdAndCompanyId(chatId, companyId)
                .map(chat -> {
                    WhatsAppMessage outbound = WhatsAppMessage.builder()
                            .companyId(companyId)
                            .chatId(chat.getId())
                            .direction("OUTBOUND")
                            .senderPhone("FLOWCRM-AI")
                            .receiverPhone(chat.getCustomerPhone())
                            .text(text)
                            .type("TEXT")
                            .status("SENT")
                            .internalNote(false)
                            .agentId(agentId)
                            .agentName(agentName)
                            .build();

                    WhatsAppMessage saved = messageRepository.save(outbound);

                    // Update last message status in Chat thread
                    chat.setLastMessageText(text);
                    chat.setLastMessageTime(LocalDateTime.now());
                    chatRepository.save(chat);

                    // If lead exists, log activity
                    if (chat.getLeadId() != null) {
                        Activity act = new Activity(null, chat.getLeadId(), "Outreach", "Sent WhatsApp message: \"" + text + "\"", LocalDateTime.now());
                        activityRepository.save(act);
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/chats/{chatId}/note")
    public ResponseEntity<WhatsAppMessage> createInternalNote(
            @PathVariable Long chatId,
            @RequestBody Map<String, String> payload,
            @RequestAttribute("companyId") Long companyId
    ) {
        String text = payload.get("text");
        String agentName = payload.getOrDefault("agentName", "Agent");
        Long agentId = payload.containsKey("agentId") ? Long.parseLong(payload.get("agentId")) : null;

        return chatRepository.findByIdAndCompanyId(chatId, companyId)
                .map(chat -> {
                    WhatsAppMessage note = WhatsAppMessage.builder()
                            .companyId(companyId)
                            .chatId(chat.getId())
                            .direction("OUTBOUND")
                            .senderPhone("SYSTEM")
                            .receiverPhone("SYSTEM")
                            .text(text)
                            .type("TEXT")
                            .status("READ")
                            .internalNote(true)
                            .agentId(agentId)
                            .agentName(agentName)
                            .build();

                    WhatsAppMessage saved = messageRepository.save(note);

                    // If lead exists, log internal activity note
                    if (chat.getLeadId() != null) {
                        Activity act = new Activity(null, chat.getLeadId(), "Internal Note", "Internal Agent Note: \"" + text + "\"", LocalDateTime.now());
                        activityRepository.save(act);
                    }

                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/chats/{chatId}/assign")
    public ResponseEntity<WhatsAppChat> reassignChat(
            @PathVariable Long chatId,
            @RequestBody Map<String, Object> payload,
            @RequestAttribute("companyId") Long companyId
    ) {
        Long userId = payload.containsKey("userId") ? ((Number) payload.get("userId")).longValue() : null;
        String userName = (String) payload.get("userName");

        return chatRepository.findByIdAndCompanyId(chatId, companyId)
                .map(chat -> {
                    chat.setAssignedToUserId(userId);
                    chat.setAssignedTo(userName);
                    WhatsAppChat saved = chatRepository.save(chat);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // --- WHATSAPP SIMULATOR WEBHOOK ENDPOINT ---
    // Simulates an incoming message from a customer
    @PostMapping("/simulate-inbound")
    public ResponseEntity<WhatsAppMessage> simulateInbound(
            @RequestBody Map<String, String> payload,
            @RequestAttribute("companyId") Long companyId
    ) {
        String customerPhone = payload.get("phone");
        String customerName = payload.getOrDefault("name", "WhatsApp Customer");
        String text = payload.get("text");

        // 1. Find or create WhatsAppChat
        WhatsAppChat chat = chatRepository.findByCompanyIdAndCustomerPhone(companyId, customerPhone)
                .orElseGet(() -> {
                    // Trigger lead capture if customer doesn't exist
                    String norm = customerPhone.replaceAll("[^0-9]", "");
                    List<Lead> duplicates = leadRepository.findByCompanyIdAndNormalizedPhone(companyId, norm);
                    Long leadId = null;
                    
                    if (duplicates.isEmpty()) {
                        // Capture new lead from WhatsApp
                        Lead newLead = Lead.builder()
                                .companyId(companyId)
                                .name(customerName)
                                .phone(customerPhone)
                                .source("WhatsApp")
                                .status("New Lead")
                                .priority("Medium")
                                .notes("Captured automatically from inbound WhatsApp query.")
                                .conversionProbability(45)
                                .nextBestAction("Reply to WhatsApp message")
                                .sentiment("Neutral")
                                .build();
                        Lead savedLead = leadRepository.save(newLead);
                        leadId = savedLead.getId();
                        
                        Activity act = new Activity(null, savedLead.getId(), "Status Change", "Lead automatically created via Inbound WhatsApp Chat.", LocalDateTime.now());
                        activityRepository.save(act);
                    } else {
                        leadId = duplicates.get(0).getId();
                    }

                    WhatsAppChat newChat = WhatsAppChat.builder()
                            .companyId(companyId)
                            .customerPhone(customerPhone)
                            .customerName(customerName)
                            .status("OPEN")
                            .unreadCount(0)
                            .leadId(leadId)
                            .build();
                    return chatRepository.save(newChat);
                });

        // Update Chat thread statistics
        chat.setLastMessageText(text);
        chat.setLastMessageTime(LocalDateTime.now());
        chat.setUnreadCount(chat.getUnreadCount() + 1);
        chatRepository.save(chat);

        // 2. Save incoming message
        WhatsAppMessage message = WhatsAppMessage.builder()
                .companyId(companyId)
                .chatId(chat.getId())
                .direction("INBOUND")
                .senderPhone(customerPhone)
                .receiverPhone("FLOWCRM-AI")
                .text(text)
                .type("TEXT")
                .status("DELIVERED")
                .internalNote(false)
                .build();

        WhatsAppMessage savedMessage = messageRepository.save(message);

        // Log inbound activity on lead timeline
        if (chat.getLeadId() != null) {
            Activity act = new Activity(null, chat.getLeadId(), "Client Reply", "Inbound WhatsApp from customer: \"" + text + "\"", LocalDateTime.now());
            activityRepository.save(act);
        }

        // 3. Automated Auto-Replies Simulator
        if (text.toLowerCase().contains("hello") || text.toLowerCase().contains("hi") || text.toLowerCase().contains("interested")) {
            WhatsAppMessage autoReply = WhatsAppMessage.builder()
                    .companyId(companyId)
                    .chatId(chat.getId())
                    .direction("OUTBOUND")
                    .senderPhone("FLOWCRM-AI")
                    .receiverPhone(customerPhone)
                    .text("Thank you for contacting us! An agent will be with you shortly. How can we help you today?")
                    .type("TEXT")
                    .status("SENT")
                    .internalNote(false)
                    .agentName("FlowCRM Bot")
                    .build();
            messageRepository.save(autoReply);
            
            chat.setLastMessageText(autoReply.getText());
            chat.setLastMessageTime(LocalDateTime.now());
            chatRepository.save(chat);
        }

        return ResponseEntity.ok(savedMessage);
    }
}
