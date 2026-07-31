package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByLeadIdOrderByCreatedAtDesc(Long leadId);
}
