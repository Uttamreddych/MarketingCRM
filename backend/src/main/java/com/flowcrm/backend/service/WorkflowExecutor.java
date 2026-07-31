package com.flowcrm.backend.service;

import com.flowcrm.backend.model.*;
import com.flowcrm.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class WorkflowExecutor {

    @Autowired
    private WorkflowRepository workflowRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private WhatsAppChatRepository chatRepository;

    @Autowired
    private WhatsAppMessageRepository messageRepository;

    public void triggerWorkflow(Long companyId, String triggerType, Lead lead) {
        List<Workflow> workflows = workflowRepository.findByCompanyIdAndTriggerTypeAndActive(companyId, triggerType, true);
        
        for (Workflow workflow : workflows) {
            boolean shouldRun = checkConditions(workflow.getTriggerConditions(), lead);
            if (shouldRun) {
                runActions(workflow.getActions(), lead, companyId);
            }
        }
    }

    private boolean checkConditions(String conditionsJson, Lead lead) {
        if (conditionsJson == null || conditionsJson.trim().isEmpty() || "{}".equals(conditionsJson.trim())) {
            return true;
        }

        // Basic parsing for status matches, e.g., "Interested"
        if (conditionsJson.contains("\"status\"")) {
            String statusValue = extractJsonValue(conditionsJson, "status");
            return lead.getStatus() != null && lead.getStatus().equalsIgnoreCase(statusValue);
        }
        
        if (conditionsJson.contains("\"source\"")) {
            String sourceValue = extractJsonValue(conditionsJson, "source");
            return lead.getSource() != null && lead.getSource().equalsIgnoreCase(sourceValue);
        }

        return true;
    }

    private void runActions(String actionsJson, Lead lead, Long companyId) {
        if (actionsJson == null || actionsJson.trim().isEmpty()) {
            return;
        }

        // Simple action simulation
        // Actions can contain: SEND_WHATSAPP, CREATE_TASK, NOTIFY
        if (actionsJson.contains("SEND_WHATSAPP")) {
            String messageText = "Hi " + lead.getName() + "! We saw you are interested in our offerings. Our team will contact you soon.";
            if (actionsJson.contains("\"text\"")) {
                messageText = extractJsonValue(actionsJson, "text").replace("{name}", lead.getName());
            }
            sendAutomatedWhatsApp(companyId, lead, messageText);
        }

        if (actionsJson.contains("CREATE_TASK")) {
            String taskTitle = "Automated Follow-up: " + lead.getName();
            if (actionsJson.contains("\"title\"")) {
                taskTitle = extractJsonValue(actionsJson, "title");
            }
            Task task = Task.builder()
                    .companyId(companyId)
                    .leadId(lead.getId())
                    .title(taskTitle)
                    .description("Auto-created task via workflow automation.")
                    .dueDate(LocalDateTime.now().plusDays(1))
                    .priority("High")
                    .completed(false)
                    .type("FOLLOW_UP")
                    .assignedTo(lead.getAssignedTo())
                    .assignedToUserId(lead.getAssignedToUserId())
                    .build();
            taskRepository.save(task);

            Activity act = new Activity(null, lead.getId(), "Status Change", "Created Task: \"" + taskTitle + "\" via automation.", LocalDateTime.now());
            activityRepository.save(act);
        }
    }

    private void sendAutomatedWhatsApp(Long companyId, Lead lead, String text) {
        if (lead.getPhone() == null || lead.getPhone().trim().isEmpty()) {
            return;
        }

        // Find or create Chat
        WhatsAppChat chat = chatRepository.findByCompanyIdAndCustomerPhone(companyId, lead.getPhone())
                .orElseGet(() -> {
                    WhatsAppChat newChat = WhatsAppChat.builder()
                            .companyId(companyId)
                            .customerPhone(lead.getPhone())
                            .customerName(lead.getName())
                            .status("OPEN")
                            .unreadCount(0)
                            .leadId(lead.getId())
                            .assignedTo(lead.getAssignedTo())
                            .assignedToUserId(lead.getAssignedToUserId())
                            .build();
                    return chatRepository.save(newChat);
                });

        WhatsAppMessage message = WhatsAppMessage.builder()
                .companyId(companyId)
                .chatId(chat.getId())
                .direction("OUTBOUND")
                .senderPhone("FLOWCRM-AI")
                .receiverPhone(lead.getPhone())
                .text(text)
                .type("TEXT")
                .status("SENT")
                .agentName("FlowCRM Automator")
                .build();
        messageRepository.save(message);

        chat.setLastMessageText(text);
        chat.setLastMessageTime(LocalDateTime.now());
        chatRepository.save(chat);

        Activity act = new Activity(null, lead.getId(), "Outreach", "Sent automated WhatsApp message: \"" + text + "\"", LocalDateTime.now());
        activityRepository.save(act);
    }

    private String extractJsonValue(String json, String key) {
        try {
            int keyIndex = json.indexOf("\"" + key + "\"");
            if (keyIndex == -1) return "";
            int colonIndex = json.indexOf(":", keyIndex);
            int startQuote = json.indexOf("\"", colonIndex);
            int endQuote = json.indexOf("\"", startQuote + 1);
            return json.substring(startQuote + 1, endQuote);
        } catch (Exception e) {
            return "";
        }
    }
}
