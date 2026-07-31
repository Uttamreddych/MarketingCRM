package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByCompanyId(Long companyId);
    Optional<Task> findByIdAndCompanyId(Long id, Long companyId);
    List<Task> findByCompanyIdAndLeadId(Long companyId, Long leadId);
    List<Task> findByCompanyIdAndCompleted(Long companyId, Boolean completed);
}
