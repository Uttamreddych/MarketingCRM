package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Task;
import com.flowcrm.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "*")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping
    public List<Task> getAllTasks(@RequestAttribute("companyId") Long companyId) {
        return taskRepository.findByCompanyId(companyId);
    }

    @GetMapping("/lead/{leadId}")
    public List<Task> getTasksByLead(@PathVariable Long leadId, @RequestAttribute("companyId") Long companyId) {
        return taskRepository.findByCompanyIdAndLeadId(companyId, leadId);
    }

    @PostMapping
    public Task createTask(@RequestBody Task task, @RequestAttribute("companyId") Long companyId) {
        task.setCompanyId(companyId);
        if (task.getCompleted() == null) {
            task.setCompleted(false);
        }
        return taskRepository.save(task);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task taskDetails, @RequestAttribute("companyId") Long companyId) {
        return taskRepository.findByIdAndCompanyId(id, companyId)
                .map(task -> {
                    task.setTitle(taskDetails.getTitle());
                    task.setDescription(taskDetails.getDescription());
                    task.setDueDate(taskDetails.getDueDate());
                    task.setPriority(taskDetails.getPriority());
                    task.setCompleted(taskDetails.getCompleted());
                    task.setAssignedToUserId(taskDetails.getAssignedToUserId());
                    task.setAssignedTo(taskDetails.getAssignedTo());
                    task.setType(taskDetails.getType());
                    task.setRecurrence(taskDetails.getRecurrence());
                    
                    Task updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(updatedTask);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Task> toggleTask(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return taskRepository.findByIdAndCompanyId(id, companyId)
                .map(task -> {
                    task.setCompleted(!task.getCompleted());
                    Task updatedTask = taskRepository.save(task);
                    return ResponseEntity.ok(updatedTask);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return taskRepository.findByIdAndCompanyId(id, companyId)
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
