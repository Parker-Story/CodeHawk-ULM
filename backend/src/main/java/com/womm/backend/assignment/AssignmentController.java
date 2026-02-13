package com.womm.backend.assignment;

import com.womm.backend.assignment.Assignment;
import com.womm.backend.assignment.AssignmentService;
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
}
