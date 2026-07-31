package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByCompanyIdAndUserIdOrderByCreatedAtDesc(Long companyId, Long userId);
    List<Notification> findByCompanyIdAndIsReadOrderByCreatedAtDesc(Long companyId, Boolean isRead);
    Optional<Notification> findByIdAndCompanyId(Long id, Long companyId);
}
