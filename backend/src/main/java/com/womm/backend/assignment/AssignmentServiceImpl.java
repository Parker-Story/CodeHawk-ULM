package com.womm.backend.assignment;

import com.womm.backend.course.Course;
import com.womm.backend.course.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@Transactional
public class AssignmentServiceImpl implements AssignmentService{

    AssignmentRepository assignmentRepository;
    CourseRepository courseRepository;

    public AssignmentServiceImpl(AssignmentRepository assignmentRepository, CourseRepository courseRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    public Assignment createAssignment(String courseCrn, Long id, String title) {
        Course course = courseRepository.findById(courseCrn).get();
        Assignment assignment = new Assignment(id, course, title);
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
    public Assignment updateAssignment(String courseCrn, Long id, String title) {
        Course course = courseRepository.findById(courseCrn).get();
        Assignment assignment = new Assignment(id, course, title);
        return assignmentRepository.save(assignment);
    }

    @Override
    public void deleteAssignment(Long id) {
        assignmentRepository.deleteById(id);
    }
}
