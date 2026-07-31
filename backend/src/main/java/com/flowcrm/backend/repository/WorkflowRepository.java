package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends JpaRepository<Workflow, Long> {
    List<Workflow> findByCompanyId(Long companyId);
    Optional<Workflow> findByIdAndCompanyId(Long id, Long companyId);
    List<Workflow> findByCompanyIdAndActive(Long companyId, Boolean active);
    List<Workflow> findByCompanyIdAndTriggerTypeAndActive(Long companyId, String triggerType, Boolean active);
}
