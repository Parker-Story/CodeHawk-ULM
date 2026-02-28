package com.womm.backend.controller;

import com.womm.backend.service.AssignmentService;
import com.womm.backend.entity.Assignment;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(path = "/assignment")
public class AssignmentController {

    AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    // ----- CRUD -----
    // Create
    @PostMapping
    public Assignment createAssignmentDetails(@RequestBody Assignment assignment) {
        return assignmentService.createAssignment(assignment);
    }

    // Retrieve One
    @GetMapping("{id}")
    public Assignment getAssignmentDetails(@PathVariable("id") Long id) {
        return assignmentService.getAssignment(id);
    }

    // Retrieve All
    @GetMapping()
    public List<Assignment> getAllAssignmentDetails() {
        return assignmentService.getAllAssignments();
    }

    // Update
    @PutMapping
    public Assignment updateAssignmentDetails(@RequestBody Assignment assignment) {
        return assignmentService.updateAssignment(assignment);
    }

    // Delete
    @DeleteMapping("{id}")
    public void deleteAssignmentDetails(@PathVariable("id") Long id) {
        assignmentService.deleteAssignment(id);
    }

    @PostMapping("/course/{crn}")
    public Assignment createAssignmentForCourse(@RequestBody Assignment assignment, @PathVariable("crn") String crn) {
        return assignmentService.createAssignmentForCourse(assignment, crn);
    }

    @GetMapping("/course/{crn}")
    public List<Assignment> getAssignmentsByCourse(@PathVariable("crn") String crn) {
        return assignmentService.getAssignmentsByCourse(crn);
    }
}
