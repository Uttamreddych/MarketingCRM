package com.flowcrm.backend.controller;

import org.springframework.ai.chat.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.ChatResponse;
import com.flowcrm.backend.model.*;
import com.flowcrm.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class AiController {

    @Autowired
    private LeadRepository leadRepository;

    @Autowired
    private CampaignRepository campaignRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ChatClient chatClient;

    @GetMapping("/chat")
    public ResponseEntity<String> chat(
        @RequestParam(value="prompt") String prompt){
          String response =  this.chatClient.call(prompt);
          return ResponseEntity.ok(response);  
        }
        







    // 1. AI Lead Scoring & Classification (Hot, Warm, Cold)
    @PostMapping("/score-lead")
    public ResponseEntity<?> scoreLead(@RequestBody Map<String, Object> payload, @RequestAttribute("companyId") Long companyId) {
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> leadData = (Map<String, Object>) payload.get("leadData");
            if (leadData == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "leadData is required"));
            }

            int score = 40;
            String source = (String) leadData.getOrDefault("source", "other");
            
            // Source-based weighting
            Map<String, Integer> sourceScores = Map.of(
                "referral", 25,
                "whatsapp", 20,
                "website", 15,
                "social", 10,
                "email", 12,
                "phone", 18,
                "other", 5
            );
            score += sourceScores.getOrDefault(source.toLowerCase(), 5);

            // Profile completeness
            if (leadData.get("phone") != null && !((String) leadData.get("phone")).isEmpty()) score += 15;
            if (leadData.get("email") != null && !((String) leadData.get("email")).isEmpty()) score += 15;

            // Priority based weight
            String priority = (String) leadData.getOrDefault("priority", "Medium");
            if ("High".equalsIgnoreCase(priority)) score += 20;
            else if ("Medium".equalsIgnoreCase(priority)) score += 10;

            // Cap at 100
            score = Math.min(score, 100);

            // Classification
            String classification = "Cold";
            if (score >= 75) {
                classification = "Hot";
            } else if (score >= 50) {
                classification = "Warm";
            }

            return ResponseEntity.ok(Map.of(
                "score", score,
                "classification", classification,
                "factors", Map.of(
                    "source", source,
                    "hasEmail", leadData.get("email") != null,
                    "hasPhone", leadData.get("phone") != null,
                    "priority", priority
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Server error", "error", e.getMessage()));
        }
    }

    // 2. AI Follow-up Draft Generator (emails, WhatsApp)
    @PostMapping("/generate-draft")
    public ResponseEntity<?> generateDraft(@RequestBody Map<String, String> payload) {
        String leadName = payload.getOrDefault("leadName", "Client");
        String channel = payload.getOrDefault("channel", "WhatsApp"); // WhatsApp or Email
        String intent = payload.getOrDefault("intent", "follow-up"); // follow-up, welcome, promo
        String sentiment = payload.getOrDefault("sentiment", "Neutral");

        String draft = "";
        if ("WhatsApp".equalsIgnoreCase(channel)) {
            if ("welcome".equalsIgnoreCase(intent)) {
                draft = "Hi " + leadName + "! 👋 Thanks for connecting with us on WhatsApp. How can we help you scale your business today?";
            } else if ("promo".equalsIgnoreCase(intent)) {
                draft = "Hey " + leadName + "! 🎉 We have an exclusive 20% discount on cloud setups this week for our WhatsApp partners. Let me know if you want the link!";
            } else {
                draft = "Hi " + leadName + ", hope you are having a great day! Just following up on our previous conversation. Let me know when you have 5 mins for a quick call. Phone: +91 99999 88888.";
            }
        } else {
            // Email Draft
            if ("welcome".equalsIgnoreCase(intent)) {
                draft = "Subject: Welcome to FlowCRM!\n\nDear " + leadName + ",\n\nThank you for signing up. Our team is excited to help you automate your outreach.\n\nBest regards,\nFlowCRM Team";
            } else {
                draft = "Subject: Quick Follow-up - FlowCRM\n\nDear " + leadName + ",\n\nI hope this email finds you well. I wanted to follow up on our discussion regarding your marketing needs. Do you have some time for a quick 10-minute touch base this week?\n\nSincerely,\nAccount Executive";
            }
        }

        return ResponseEntity.ok(Map.of("draft", draft));
    }

    // 3. AI Business Advisor (Indian/SMB-specific contextual tips)
    @GetMapping("/advisor-insights")
    public ResponseEntity<?> getAdvisorInsights(@RequestAttribute("companyId") Long companyId) {
        List<Lead> leads = leadRepository.findByCompanyId(companyId);
        List<Map<String, String>> insights = new ArrayList<>();

        long whatsappCount = leads.stream().filter(l -> "WhatsApp".equalsIgnoreCase(l.getSource())).count();
        long totalLeads = leads.size();
        double whatsappRatio = totalLeads > 0 ? (double) whatsappCount / totalLeads : 0;

        if (whatsappRatio > 0.3) {
            insights.add(Map.of(
                    "title", "WhatsApp Outperforms Other Channels",
                    "description", "Over " + Math.round(whatsappRatio * 100) + "% of your leads originate from WhatsApp. Consider allocating more budget to WhatsApp campaigns than traditional emails.",
                    "impact", "High"
            ));
        } else {
            insights.add(Map.of(
                    "title", "Leverage WhatsApp Marketing",
                    "description", "Less than 30% of your leads come from WhatsApp. In India, businesses using automated WhatsApp outreach see a 3x higher response rate compared to emails.",
                    "impact", "Medium"
            ));
        }

        long highPriorityNotWon = leads.stream().filter(l -> "High".equalsIgnoreCase(l.getPriority()) && !"Won".equalsIgnoreCase(l.getStatus())).count();
        if (highPriorityNotWon > 2) {
            insights.add(Map.of(
                    "title", "Neglected High-Value Opportunities",
                    "description", "You have " + highPriorityNotWon + " high-priority deals waiting in the pipeline. Prioritize contacting them before the weekend to increase close rates by 18%.",
                    "impact", "Critical"
            ));
        }

        insights.add(Map.of(
                "title", "Optimize Response Times",
                "description", "Leads engaged within 15 minutes of inbound queries show a 40% higher conversion probability. Setup automated WhatsApp reply flows for non-business hours.",
                "impact", "High"
        ));

        return ResponseEntity.ok(insights);
    }

    // 4. AI Campaign Suggestions
    @GetMapping("/campaign-suggestions")
    public ResponseEntity<?> getCampaignSuggestions(@RequestAttribute("companyId") Long companyId) {
        List<Map<String, String>> suggestions = new ArrayList<>();

        suggestions.add(Map.of(
                "template", "Festival Greetings & Promotional Discount (Diwali/EID Special)",
                "channel", "WhatsApp",
                "bestTime", "Wednesday 11:00 AM - 1:30 PM",
                "targetGroup", "Inactive Leads in Negotiation Stage"
        ));

        suggestions.add(Map.of(
                "template", "Product Demo Invitation Video",
                "channel", "WhatsApp",
                "bestTime", "Friday 3:00 PM - 5:00 PM",
                "targetGroup", "New leads captured from Website/Social Media"
        ));

        return ResponseEntity.ok(suggestions);
    }

    // 5. AI Meeting Summarizer
    @PostMapping("/summarize-meeting")
    public ResponseEntity<?> summarizeMeeting(@RequestBody Map<String, String> payload, @RequestAttribute("companyId") Long companyId) {
        String notes = payload.getOrDefault("notes", "");
        
        List<String> keyPoints = new ArrayList<>();
        List<String> nextActions = new ArrayList<>();

        if (notes.toLowerCase().contains("price") || notes.toLowerCase().contains("cost") || notes.toLowerCase().contains("budget")) {
            keyPoints.add("Client is price sensitive and wants to negotiate a discount.");
            nextActions.add("Prepare custom quotation with standard 10% volume discount.");
        }
        if (notes.toLowerCase().contains("demo") || notes.toLowerCase().contains("show")) {
            keyPoints.add("Requested a live product dashboard demonstration.");
            nextActions.add("Schedule a screen share demonstration next Tuesday.");
        }
        if (notes.toLowerCase().contains("whatsapp")) {
            keyPoints.add("Wants to receive automated notifications on WhatsApp.");
            nextActions.add("Set up WhatsApp notification integration for their profile.");
        }

        if (keyPoints.isEmpty()) {
            keyPoints.add("Client expressed general interest and requested follow-up.");
            nextActions.add("Follow up via WhatsApp or email in 3 days.");
        }

        return ResponseEntity.ok(Map.of(
                "summary", "The client is evaluating marketing platforms. They requested details on features and next steps.",
                "keyPoints", keyPoints,
                "nextActions", nextActions
        ));
    }

    // 6. Voice-Based CRM Input (Natural Language Parser)
    @PostMapping("/voice-input")
    public ResponseEntity<?> parseVoiceInput(@RequestBody Map<String, String> payload, @RequestAttribute("companyId") Long companyId) {
        String text = payload.get("text");
        if (text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Input text is required"));
        }

        // Simulating parsing of voice/text transcript:
        // E.g. "Add lead Ravi from Hyderabad interested in cloud services, phone is 9988776655"
        String name = "New Lead";
        String city = "";
        String notes = "Captured via voice command: \"" + text + "\"";
        String phone = "";

        // Regex for name extraction e.g. "lead [Name]" or capitalized word
        Pattern namePattern = Pattern.compile("lead\\s+([A-Z][a-z]+|[a-zA-Z]+)", Pattern.CASE_INSENSITIVE);
        Matcher nameMatcher = namePattern.matcher(text);
        if (nameMatcher.find()) {
            name = nameMatcher.group(1);
        }

        // Regex for location e.g. "from [Location]"
        Pattern locPattern = Pattern.compile("from\\s+([A-Z][a-z]+|[a-zA-Z]+)", Pattern.CASE_INSENSITIVE);
        Matcher locMatcher = locPattern.matcher(text);
        if (locMatcher.find()) {
            city = locMatcher.group(1);
            notes += " Location: " + city;
        }

        // Regex for phone number
        Pattern phonePattern = Pattern.compile("(\\d{10}|\\+91\\s*\\d{10})");
        Matcher phoneMatcher = phonePattern.matcher(text);
        if (phoneMatcher.find()) {
            phone = phoneMatcher.group(1);
        }

        // Auto-save lead
        Lead newLead = Lead.builder()
                .companyId(companyId)
                .name(name)
                .phone(phone)
                .source("Voice Input")
                .status("New Lead")
                .priority("Medium")
                .notes(notes)
                .conversionProbability(50)
                .nextBestAction("Call and qualify lead details")
                .sentiment("Neutral")
                .build();

        Lead saved = leadRepository.save(newLead);
        
        // Log activity
        Activity act = new Activity(null, saved.getId(), "Status Change", "Lead created via voice input parser.", LocalDateTime.now());
        activityRepository.save(act);

        return ResponseEntity.ok(Map.of(
                "message", "Lead automatically parsed and saved successfully!",
                "lead", saved
        ));
    }

    // 7. AI Chat Assistant
    @PostMapping("/chat")
    public ResponseEntity<?> getChatResponse(@RequestBody Map<String, Object> payload) {
        try {
            String message = (String) payload.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("response", "Please provide a valid message."));
            }

            String lowerMessage = message.toLowerCase();
            List<Lead> leads = leadRepository.findAll();
            List<Campaign> campaigns = campaignRepository.findAll();

            String response;

            if (lowerMessage.contains("total sales") || lowerMessage.contains("revenue") || lowerMessage.contains("sales count")) {
                long wonCount = leads.stream().filter(l -> "Won".equalsIgnoreCase(l.getStatus())).count();
                double wonTotal = leads.stream()
                    .filter(l -> "Won".equalsIgnoreCase(l.getStatus()))
                    .mapToDouble(l -> l.getConversionProbability() != null ? l.getConversionProbability() * 100.0 : 10000.0)
                    .sum();
                response = "You have closed **" + wonCount + " successful deals**, totaling a closed-won revenue of **$" + String.format("%,.2f", wonTotal) + "**!";
            } 
            else if (lowerMessage.contains("total leads") || lowerMessage.contains("leads count") || lowerMessage.contains("how many leads")) {
                response = "You currently have **" + leads.size() + " leads** registered in your FlowCRM system. " +
                           "Of these, " + leads.stream().filter(l -> "New Lead".equalsIgnoreCase(l.getStatus())).count() + " are brand new, and " +
                           leads.stream().filter(l -> "Interested".equalsIgnoreCase(l.getStatus())).count() + " show active interest!";
            } 
            else if (lowerMessage.contains("conversion rate") || lowerMessage.contains("win rate") || lowerMessage.contains("performance")) {
                long total = leads.size();
                long won = leads.stream().filter(l -> "Won".equalsIgnoreCase(l.getStatus())).count();
                double winRate = total > 0 ? ((double) won / total) * 100 : 0.0;
                response = "Your CRM **lead conversion rate is currently " + String.format("%.1f", winRate) + "%**! This is calculated based on " + won + " won leads out of " + total + " total records.";
            } 
            else if (lowerMessage.contains("campaigns") || lowerMessage.contains("marketing") || lowerMessage.contains("active campaigns")) {
                long active = campaigns.stream().filter(c -> "Active".equalsIgnoreCase(c.getStatus())).count();
                response = "You have **" + campaigns.size() + " marketing campaigns** in total, with **" + active + " currently active and running**.";
            } 
            else if (lowerMessage.contains("unassigned")) {
                long unassigned = leads.stream().filter(l -> l.getAssignedTo() == null || l.getAssignedTo().isEmpty()).count();
                response = "There are currently **" + unassigned + " unassigned leads** in the database. I recommend assigning them in the Leads panel to prevent follow-up delays.";
            }
            else if (lowerMessage.contains("help") || lowerMessage.contains("what can you do") || lowerMessage.contains("capabilities")) {
                response = "I am your **Flow AI Assistant**! Here is what I can fetch for you in real-time:\n\n" +
                           "• **Sales & Revenue**: Try asking *'What is our total revenue?'*\n" +
                           "• **Lead Statistics**: Try asking *'How many leads do we have?'*\n" +
                           "• **Conversion Rates**: Try asking *'What is our lead conversion rate?'*\n" +
                           "• **Campaign Performance**: Try asking *'Show active campaigns'* \n" +
                           "• **Assigned Work**: Try asking *'Show unassigned leads'*";
            } 
            else {
                try {
                    long wonCount = leads.stream().filter(l -> "Won".equalsIgnoreCase(l.getStatus())).count();
                    long totalLeads = leads.size();
                    double winRate = totalLeads > 0 ? ((double) wonCount / totalLeads) * 100 : 0.0;
                    long activeCampaigns = campaigns.stream().filter(c -> "Active".equalsIgnoreCase(c.getStatus())).count();
                    long unassignedLeads = leads.stream().filter(l -> l.getAssignedTo() == null || l.getAssignedTo().isEmpty()).count();

                    String systemContext = "You are Flow AI, an intelligent CRM Assistant. Here is the current CRM status: "
                            + "Total Leads: " + totalLeads + ", "
                            + "Closed Won Deals: " + wonCount + ", "
                            + "Lead Conversion Rate: " + String.format("%.1f", winRate) + "%, "
                            + "Active Campaigns: " + activeCampaigns + ", "
                            + "Unassigned Leads: " + unassignedLeads + ". "
                            + "Answer the user's query professionally and concisely, using this context if relevant.";

                    List<Message> messages = new ArrayList<>();
                    messages.add(new SystemMessage(systemContext));

                    Object historyObj = payload.get("history");
                    if (historyObj instanceof List) {
                        List<?> historyList = (List<?>) historyObj;
                        for (Object item : historyList) {
                            if (item instanceof Map) {
                                Map<?, ?> map = (Map<?, ?>) item;
                                String role = (String) map.get("role");
                                String content = (String) map.get("content");
                                if (role != null && content != null) {
                                    if ("user".equalsIgnoreCase(role)) {
                                        messages.add(new UserMessage(content));
                                    } else if ("assistant".equalsIgnoreCase(role)) {
                                        messages.add(new AssistantMessage(content));
                                    }
                                }
                            }
                        }
                    }

                    messages.add(new UserMessage(message));

                    Prompt prompt = new Prompt(messages);
                    ChatResponse chatResponse = this.chatClient.call(prompt);
                    response = chatResponse.getResult().getOutput().getContent();
                } catch (Exception ex) {
                    response = "I scanned the CRM and noticed you are asking about \"" + message + "\". \n\n" +
                                "To give you an instant response: we have **" + leads.size() + " leads** and our current closed win-rate is **" + 
                                String.format("%.1f", (leads.stream().filter(l -> "Won".equalsIgnoreCase(l.getStatus())).count() / (double)Math.max(1, leads.size())) * 100) + "%**. \n\n" +
                                "(Ollama query failed: " + ex.getMessage() + ")";
                }
            }

            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("response", "Failed to process chat request.", "error", e.getMessage()));
        }
    }
}
