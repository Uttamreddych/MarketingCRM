package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Notification;
import com.flowcrm.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public List<Notification> getNotifications(
            @RequestAttribute("companyId") Long companyId,
            @RequestParam(required = false) Long userId
    ) {
        // Return notifications for this company and user
        return notificationRepository.findByCompanyIdAndUserIdOrderByCreatedAtDesc(companyId, userId);
    }

    @PostMapping
    public Notification createNotification(
            @RequestBody Notification notification,
            @RequestAttribute("companyId") Long companyId
    ) {
        notification.setCompanyId(companyId);
        notification.setIsRead(false);
        Notification saved = notificationRepository.save(notification);
        
        // Push in real-time over WebSocket topic
        try {
            messagingTemplate.convertAndSend("/topic/notifications/" + companyId, saved);
        } catch (Exception e) {
            System.err.println("Failed to push websocket notification: " + e.getMessage());
        }
        
        return saved;
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markAsRead(
            @PathVariable Long id,
            @RequestAttribute("companyId") Long companyId
    ) {
        return notificationRepository.findByIdAndCompanyId(id, companyId)
                .map(notif -> {
                    notif.setIsRead(true);
                    Notification updated = notificationRepository.save(notif);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Long id,
            @RequestAttribute("companyId") Long companyId
    ) {
        return notificationRepository.findByIdAndCompanyId(id, companyId)
                .map(notif -> {
                    notificationRepository.delete(notif);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
