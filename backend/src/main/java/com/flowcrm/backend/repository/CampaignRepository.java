package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaignRepository extends JpaRepository<Campaign, Long> {
    List<Campaign> findByCompanyId(Long companyId);
    Optional<Campaign> findByIdAndCompanyId(Long id, Long companyId);
}
