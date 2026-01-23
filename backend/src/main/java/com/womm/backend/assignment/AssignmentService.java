package com.womm.backend.assignment;

import java.util.List;

public interface AssignmentService {
    public Assignment createAssignment(Assignment assignment);
    public Assignment getAssignment(Long id);
    public List<Assignment> getAllAssignments();
    public Assignment updateAssignment(Assignment assignment);
    public void deleteAssignment(Long id);
}
