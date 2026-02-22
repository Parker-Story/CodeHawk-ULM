package com.womm.backend.service;

import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.CourseRepository;
import com.womm.backend.entity.Assignment;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AssignmentServiceImpl implements AssignmentService{

    AssignmentRepository assignmentRepository;
    CourseRepository courseRepository;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository, CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public Assignment createAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @Override
    public Assignment getAssignment(Long id) {
        return assignmentRepository.findById(id).get();
    }

    @Override
    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }

    @Override
    public Assignment updateAssignment(Assignment assignment) {
        return assignmentRepository.save(assignment);
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
}
