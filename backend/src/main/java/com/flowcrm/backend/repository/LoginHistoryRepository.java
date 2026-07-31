package com.flowcrm.backend.repository;

import com.flowcrm.backend.model.LoginHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, Long> {
    List<LoginHistory> findByUserIdOrderByTimestampDesc(Long userId);
    List<LoginHistory> findByUsernameOrderByTimestampDesc(String username);
}
