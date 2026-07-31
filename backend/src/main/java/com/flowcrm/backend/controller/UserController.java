package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.User;
import com.flowcrm.backend.repository.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // GET all users in the same company (admin-safe: passwords masked)
    @GetMapping
    public List<Map<String, Object>> getCompanyUsers(@RequestAttribute("companyId") Long companyId) {
        return userRepository.findByCompanyId(companyId)
                .stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "username", u.getUsername(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "active", u.getActive() != null ? u.getActive() : true,
                        "companyId", u.getCompanyId(),
                        "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : ""
                ))
                .collect(Collectors.toList());
    }

    // POST create a new team member under the same company
    @PostMapping
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request,
            @RequestAttribute("companyId") Long companyId) {

        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email is already registered"));
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid role: " + request.getRole()));
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .companyId(companyId)
                .active(true)
                .build();

        User saved = userRepository.save(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", saved.getId(),
                "username", saved.getUsername(),
                "email", saved.getEmail(),
                "role", saved.getRole().name(),
                "active", true,
                "companyId", saved.getCompanyId(),
                "createdAt", saved.getCreatedAt() != null ? saved.getCreatedAt().toString() : ""
        ));
    }

    // PATCH toggle active/inactive status
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggleUser(
            @PathVariable Long id,
            @RequestAttribute("companyId") Long companyId) {

        return userRepository.findById(id)
                .filter(u -> u.getCompanyId().equals(companyId))
                .map(user -> {
                    // Prevent deactivating an ADMIN
                    if (user.getRole() == User.Role.ADMIN) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Cannot toggle the admin account."));
                    }
                    boolean newStatus = !(user.getActive() != null && user.getActive());
                    user.setActive(newStatus);
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "active", newStatus
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE remove a team member
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(
            @PathVariable Long id,
            @RequestAttribute("companyId") Long companyId) {

        return userRepository.findById(id)
                .filter(u -> u.getCompanyId().equals(companyId))
                .map(user -> {
                    if (user.getRole() == User.Role.ADMIN) {
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Cannot delete the admin account."));
                    }
                    userRepository.delete(user);
                    return ResponseEntity.ok().<Object>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateUserRequest {
        private String username;
        private String email;
        private String password;
        private String role; // "SALES_MANAGER", "MARKETING_MANAGER", "MANAGER", "EMPLOYEE"
    }
}
