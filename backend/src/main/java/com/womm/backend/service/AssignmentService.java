package com.womm.backend.service;
import com.womm.backend.entity.Assignment;
import java.util.List;
public interface AssignmentService {
    public Assignment createAssignment(Assignment assignment);
    public Assignment getAssignment(Long id);
    public List<Assignment> getAllAssignments();
    public Assignment updateAssignment(Assignment assignment);
    public void deleteAssignment(Long id);
    Assignment createAssignmentForCourse(Assignment assignment, String crn);
    List<Assignment> getAssignmentsByCourse(String crn);
}