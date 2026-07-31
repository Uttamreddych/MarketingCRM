package com.flowcrm.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String industry;      // e.g., "Retail", "SaaS", "Finance"
    private String logoUrl;       // URL to company logo
    private String primaryColor;  // Hex color for branding e.g. "#6366f1"
    private String website;
    private String contactEmail;
    private String plan;          // "Starter", "Growth", "Enterprise"
    
    @Column(nullable = false, unique = true)
    private String subdomain;     // e.g., "acme" -> acme.flowcrm.ai
    
    private Boolean active = true;

    public Company() {}

    public Company(String name, String industry, String logoUrl, String primaryColor,
                   String website, String contactEmail, String plan, String subdomain) {
        this.name = name;
        this.industry = industry;
        this.logoUrl = logoUrl;
        this.primaryColor = primaryColor;
        this.website = website;
        this.contactEmail = contactEmail;
        this.plan = plan;
        this.subdomain = subdomain;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public String getLogoUrl() { return logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }

    public String getPrimaryColor() { return primaryColor; }
    public void setPrimaryColor(String primaryColor) { this.primaryColor = primaryColor; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getContactEmail() { return contactEmail; }
    public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }

    public String getPlan() { return plan; }
    public void setPlan(String plan) { this.plan = plan; }

    public String getSubdomain() { return subdomain; }
    public void setSubdomain(String subdomain) { this.subdomain = subdomain; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
