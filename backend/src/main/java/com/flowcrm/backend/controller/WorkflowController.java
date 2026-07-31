package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Workflow;
import com.flowcrm.backend.repository.WorkflowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workflows")
@CrossOrigin(origins = "*")
public class WorkflowController {

    @Autowired
    private WorkflowRepository workflowRepository;

    @GetMapping
    public List<Workflow> getAllWorkflows(@RequestAttribute("companyId") Long companyId) {
        return workflowRepository.findByCompanyId(companyId);
    }

    @PostMapping
    public Workflow createWorkflow(@RequestBody Workflow workflow, @RequestAttribute("companyId") Long companyId) {
        workflow.setCompanyId(companyId);
        return workflowRepository.save(workflow);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Workflow> updateWorkflow(
            @PathVariable Long id,
            @RequestBody Workflow workflowDetails,
            @RequestAttribute("companyId") Long companyId
    ) {
        return workflowRepository.findByIdAndCompanyId(id, companyId)
                .map(workflow -> {
                    workflow.setName(workflowDetails.getName());
                    workflow.setTriggerType(workflowDetails.getTriggerType());
                    workflow.setTriggerConditions(workflowDetails.getTriggerConditions());
                    workflow.setActions(workflowDetails.getActions());
                    workflow.setActive(workflowDetails.getActive());
                    
                    Workflow updated = workflowRepository.save(workflow);
                    return ResponseEntity.ok(updated);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkflow(@PathVariable Long id, @RequestAttribute("companyId") Long companyId) {
        return workflowRepository.findByIdAndCompanyId(id, companyId)
                .map(workflow -> {
                    workflowRepository.delete(workflow);
                    return ResponseEntity.ok().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
