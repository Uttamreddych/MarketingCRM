package com.flowcrm.backend.config;

import com.flowcrm.backend.model.Campaign;
import com.flowcrm.backend.model.Company;
import com.flowcrm.backend.model.Lead;
import com.flowcrm.backend.model.Activity;
import com.flowcrm.backend.model.User;
import com.flowcrm.backend.repository.CampaignRepository;
import com.flowcrm.backend.repository.CompanyRepository;
import com.flowcrm.backend.repository.LeadRepository;
import com.flowcrm.backend.repository.ActivityRepository;
import com.flowcrm.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(LeadRepository leadRepository, 
                                   CampaignRepository campaignRepository, 
                                   CompanyRepository companyRepository,
                                   ActivityRepository activityRepository,
                                   UserRepository userRepository,
                                   PasswordEncoder passwordEncoder,
                                   org.springframework.jdbc.core.JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check");
                System.out.println("Successfully dropped users_role_check constraint if it existed.");
            } catch (Exception e) {
                System.err.println("Could not drop users_role_check constraint: " + e.getMessage());
            }
            // Seed companies first so they exist
            if (companyRepository.count() == 0) {
                Company co1 = new Company("Acme Corp", "Retail", "https://api.dicebear.com/7.x/initials/svg?seed=Acme&backgroundColor=6366f1", "#6366f1", "https://acme.com", "admin@acme.com", "Growth", "acme");
                Company co2 = new Company("Nova Tech", "SaaS", "https://api.dicebear.com/7.x/initials/svg?seed=Nova&backgroundColor=ec4899", "#ec4899", "https://novatech.io", "hello@novatech.io", "Enterprise", "novatech");
                Company co3 = new Company("GreenLeaf Health", "Healthcare", "https://api.dicebear.com/7.x/initials/svg?seed=Green&backgroundColor=10b981", "#10b981", "https://greenleaf.health", "info@greenleaf.health", "Starter", "greenleaf");
                Company co4 = new Company("Pinnacle Finance", "Finance", "https://api.dicebear.com/7.x/initials/svg?seed=Pinnacle&backgroundColor=f59e0b", "#f59e0b", "https://pinnacle.finance", "crm@pinnacle.finance", "Enterprise", "pinnacle");
                Company co5 = new Company("Urban Eats", "F&B", "https://api.dicebear.com/7.x/initials/svg?seed=Urban&backgroundColor=ef4444", "#ef4444", "https://urbaneats.co", "ops@urbaneats.co", "Growth", "urbaneats");

                companyRepository.saveAll(List.of(co1, co2, co3, co4, co5));
                System.out.println("Database seeded with initial companies.");
            }

            // Resolve first company ID for seeding leads
            Long seededCompanyId = 1L;
            List<Company> currentCompanies = companyRepository.findAll();
            if (!currentCompanies.isEmpty()) {
                seededCompanyId = currentCompanies.get(0).getId();
            }

            // Seed default users
            if (userRepository.count() == 0) {
                User defaultUser = User.builder()
                        .username("alex")
                        .email("alex@flowcrm.ai")
                        .password(passwordEncoder.encode("password123"))
                        .role(User.Role.ADMIN)
                        .companyId(seededCompanyId)
                        .active(true)
                        .build();
                
                User salesManager = User.builder()
                        .username("sales_mike")
                        .email("mike@flowcrm.ai")
                        .password(passwordEncoder.encode("password123"))
                        .role(User.Role.SALES_MANAGER)
                        .companyId(seededCompanyId)
                        .active(true)
                        .build();

                User marketingManager = User.builder()
                        .username("market_mary")
                        .email("mary@flowcrm.ai")
                        .password(passwordEncoder.encode("password123"))
                        .role(User.Role.MARKETING_MANAGER)
                        .companyId(seededCompanyId)
                        .active(true)
                        .build();

                userRepository.saveAll(List.of(defaultUser, salesManager, marketingManager));
                System.out.println("Default admin, sales manager, and marketing manager users seeded.");
            }

            // Seed leads & activities on startup if they don't exist yet
            if (leadRepository.count() == 0) {
                Lead lead1 = Lead.builder()
                        .companyId(seededCompanyId)
                        .name("Sarah Connor")
                        .email("sarah@cyberdyne.com")
                        .phone("+1 234-567-8901")
                        .source("Facebook")
                        .status("Interested")
                        .priority("High")
                        .assignedTo("Alex Rivera")
                        .notes("Highly interested in SEO services.")
                        .conversionProbability(85)
                        .nextBestAction("Schedule follow-up call tomorrow")
                        .sentiment("Positive")
                        .createdAt(LocalDateTime.now())
                        .build();

                Lead lead2 = Lead.builder()
                        .companyId(seededCompanyId)
                        .name("John Doe")
                        .email("john@example.com")
                        .phone("+1 987-654-3210")
                        .source("Google")
                        .status("Contacted")
                        .priority("Medium")
                        .assignedTo("Alex Rivera")
                        .notes("Requested a demo.")
                        .conversionProbability(45)
                        .nextBestAction("Send product demo video")
                        .sentiment("Neutral")
                        .createdAt(LocalDateTime.now())
                        .build();

                Lead lead3 = Lead.builder()
                        .companyId(seededCompanyId)
                        .name("Ellen Ripley")
                        .email("ripley@weyland.com")
                        .phone("+44 20 7946 0958")
                        .source("Direct")
                        .status("New Lead")
                        .priority("High")
                        .assignedTo("Alex Rivera")
                        .notes("Needs follow-up on pricing.")
                        .conversionProbability(60)
                        .nextBestAction("Send customized pricing proposal")
                        .sentiment("Neutral")
                        .createdAt(LocalDateTime.now())
                        .build();

                Lead lead4 = Lead.builder()
                        .companyId(seededCompanyId)
                        .name("Thomas Anderson")
                        .email("neo@matrix.io")
                        .phone("+1 555-0199")
                        .source("Referral")
                        .status("Negotiation")
                        .priority("Low")
                        .assignedTo("Alex Rivera")
                        .notes("Discussing contract terms.")
                        .conversionProbability(95)
                        .nextBestAction("Prepare final contract for signature")
                        .sentiment("Positive")
                        .createdAt(LocalDateTime.now())
                        .build();

                Lead lead5 = Lead.builder()
                        .companyId(seededCompanyId)
                        .name("Bruce Wayne")
                        .email("bruce@waynecorp.com")
                        .phone("+1 800-BATMAN")
                        .source("Google Ads")
                        .status("Won")
                        .priority("High")
                        .assignedTo("Alex Rivera")
                        .notes("Annual contract signed.")
                        .conversionProbability(100)
                        .nextBestAction("Initiate onboarding process")
                        .sentiment("Positive")
                        .createdAt(LocalDateTime.now())
                        .build();

                List<Lead> savedLeads = leadRepository.saveAll(List.of(lead1, lead2, lead3, lead4, lead5));
                System.out.println("Database seeded with fresh high-fidelity leads.");
                
                // Seed some activities timelines for these leads
                for (Lead l : savedLeads) {
                    if ("Sarah Connor".equals(l.getName())) {
                        activityRepository.save(new Activity(null, l.getId(), "Call", "Conducted initial discovery call with Sarah. She outlined cybersecurity and SEO alignment goals.", LocalDateTime.now().minusDays(2)));
                        activityRepository.save(new Activity(null, l.getId(), "Status Change", "Moved lead stage to 'Interested' based on high discovery call response.", LocalDateTime.now().minusDays(1)));
                    } else if ("John Doe".equals(l.getName())) {
                        activityRepository.save(new Activity(null, l.getId(), "Email", "Sent John the introductory FlowCRM brochure and system analytics video link.", LocalDateTime.now().minusDays(3)));
                        activityRepository.save(new Activity(null, l.getId(), "Call", "Logged quick sync with John. He has scheduled a formal group demo for next Tuesday.", LocalDateTime.now().minusDays(1)));
                    } else if ("Bruce Wayne".equals(l.getName())) {
                        activityRepository.save(new Activity(null, l.getId(), "Meeting", "Held executive boardroom session. Presented premium scale security integrations.", LocalDateTime.now().minusDays(4)));
                        activityRepository.save(new Activity(null, l.getId(), "Email", "Received signed enterprise contract for custom VIP services.", LocalDateTime.now().minusDays(1)));
                        activityRepository.save(new Activity(null, l.getId(), "Status Change", "Moved lead stage to 'Won'. Welcome to FlowCRM!", LocalDateTime.now()));
                    } else {
                        activityRepository.save(new Activity(null, l.getId(), "Status Change", "Lead registered in flow repository.", LocalDateTime.now().minusDays(1)));
                    }
                }
                System.out.println("Database seeded with initial interaction timelines.");
            }
            
            // Seed campaigns on startup if they don't exist yet
            if (campaignRepository.count() == 0) {
                Campaign c1 = new Campaign("Q3 SaaS Onboarding Drip", "Email", "Active", 15000, 4500, 1200, 500.0, 120.0, seededCompanyId);
                Campaign c2 = new Campaign("Black Friday Retargeting", "Ad", "Paused", 50000, 12000, 3000, 5000.0, 2500.0, seededCompanyId);
                Campaign c3 = new Campaign("Spring Newsletter", "Email", "Completed", 8000, 6000, 800, 100.0, 100.0, seededCompanyId);
                
                campaignRepository.saveAll(List.of(c1, c2, c3));
                System.out.println("Database seeded with initial campaigns.");
            }
        };
    }
}
