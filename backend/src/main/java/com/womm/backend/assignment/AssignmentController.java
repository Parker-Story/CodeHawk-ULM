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
    public Assignment createAssignmentDetails(@RequestParam String courseCrn, @RequestParam Long id, @RequestParam String title) {
        return assignmentService.createAssignment(courseCrn, id, title);
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
    public Assignment updateAssignmentDetails(@RequestParam String courseCrn, @RequestParam Long id, @RequestParam String title) {
        return assignmentService.updateAssignment(courseCrn, id, title);
    }

    // Delete
    @DeleteMapping("{id}")
    public void deleteAssignmentDetails(@PathVariable("id") Long id) {
        assignmentService.deleteAssignment(id);
    }
}
