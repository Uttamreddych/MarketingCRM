package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.WhatsAppChat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WhatsAppChatRepository extends JpaRepository<WhatsAppChat, Long> {
    List<WhatsAppChat> findByCompanyId(Long companyId);
    Optional<WhatsAppChat> findByIdAndCompanyId(Long id, Long companyId);
    Optional<WhatsAppChat> findByCompanyIdAndCustomerPhone(Long companyId, String customerPhone);
}
