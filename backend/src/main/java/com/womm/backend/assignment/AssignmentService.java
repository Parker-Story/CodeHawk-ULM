package com.womm.backend.assignment;

import java.util.List;

public interface AssignmentService {
    public Assignment createAssignment(String courseCrn, Long id, String title);
    public Assignment getAssignment(Long id);
    public List<Assignment> getAllAssignments();
    public Assignment updateAssignment(String courseCrn, Long id, String title);
    public void deleteAssignment(Long id);
}
