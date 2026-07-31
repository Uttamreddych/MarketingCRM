package com.flowcrm.backend.controller;

import com.flowcrm.backend.model.Company;
import com.flowcrm.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        return companyRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/subdomain/{subdomain}")
    public ResponseEntity<Company> getBySubdomain(@PathVariable String subdomain) {
        return companyRepository.findBySubdomain(subdomain)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyRepository.save(company);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id, @RequestBody Company details) {
        return companyRepository.findById(id).map(company -> {
            company.setName(details.getName());
            company.setIndustry(details.getIndustry());
            company.setLogoUrl(details.getLogoUrl());
            company.setPrimaryColor(details.getPrimaryColor());
            company.setPlan(details.getPlan());
            company.setActive(details.getActive());
            return ResponseEntity.ok(companyRepository.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }
}
