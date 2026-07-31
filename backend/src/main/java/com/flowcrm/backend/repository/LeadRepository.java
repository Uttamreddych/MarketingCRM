package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Lead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LeadRepository extends JpaRepository<Lead, Long> {
    List<Lead> findByCompanyId(Long companyId);
    Optional<Lead> findByIdAndCompanyId(Long id, Long companyId);
    List<Lead> findByCompanyIdAndNormalizedPhone(Long companyId, String normalizedPhone);
    List<Lead> findByCompanyIdAndStatus(Long companyId, String status);
}
