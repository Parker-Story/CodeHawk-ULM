package com.codehawk.controller;

import com.codehawk.dto.GradeResult;
import com.codehawk.service.BackendService;
import com.codehawk.service.GradingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grade")
public class GradingController {

    @Autowired
    private GradingService gradingService;

    @Autowired
    private BackendService backendService;

    @PostMapping("/{submissionId}")
    public GradeResult grade(@PathVariable String submissionId) {
        GradeResult result = gradingService.gradeSubmission(submissionId);
        if (result.getErrorMessage() == null) {
            backendService.sendGradeToBackend(result);
        }
        return result;
    }
}
