package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Campaign;
import com.flowcrm.backend.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campaigns")
@CrossOrigin(origins = "*")
public class CampaignController {

    @Autowired
    private CampaignRepository campaignRepository;

    @GetMapping
    public List<Campaign> getAllCampaigns(@RequestAttribute("companyId") Long companyId) {
        return campaignRepository.findByCompanyId(companyId);
    }

    @PostMapping
    public Campaign createCampaign(@RequestBody Campaign campaign, @RequestAttribute("companyId") Long companyId) {
        campaign.setCompanyId(companyId);
        return campaignRepository.save(campaign);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Campaign> updateCampaign(@PathVariable Long id, @RequestBody Campaign campaignDetails, @RequestAttribute("companyId") Long companyId) {
        return campaignRepository.findByIdAndCompanyId(id, companyId)
                .map(campaign -> {
                    campaign.setName(campaignDetails.getName());
                    campaign.setType(campaignDetails.getType());
                    campaign.setStatus(campaignDetails.getStatus());
                    campaign.setSentCount(campaignDetails.getSentCount());
                    campaign.setOpenCount(campaignDetails.getOpenCount());
                    campaign.setClickCount(campaignDetails.getClickCount());
                    campaign.setBudget(campaignDetails.getBudget());
                    campaign.setSpent(campaignDetails.getSpent());
                    
                    Campaign updatedCampaign = campaignRepository.save(campaign);
                    return ResponseEntity.ok(updatedCampaign);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
