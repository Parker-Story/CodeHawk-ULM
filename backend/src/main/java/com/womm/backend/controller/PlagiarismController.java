package com.womm.backend.controller;

import com.womm.backend.service.PlagiarismService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/plagiarism")
public class PlagiarismController {

    private final PlagiarismService plagiarismService;

    public PlagiarismController(PlagiarismService plagiarismService) {
        this.plagiarismService = plagiarismService;
    }

    @GetMapping("/check/{assignmentId}")
    public List<Map<String, Object>> checkPlagiarism(@PathVariable Long assignmentId) {
        return plagiarismService.checkAssignment(assignmentId);
    }
}