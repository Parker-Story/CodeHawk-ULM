package com.womm.backend.service;
import com.womm.backend.repository.AssignmentRepository;
import com.womm.backend.repository.CourseRepository;
import com.womm.backend.entity.Assignment;
import com.womm.backend.entity.Course;
import org.springframework.stereotype.Service;
import java.util.List;
import com.womm.backend.repository.SubmissionRepository;
import org.springframework.transaction.annotation.Transactional;
import com.womm.backend.repository.TestResultRepository;
import com.womm.backend.repository.RubricScoreRepository;
import com.womm.backend.repository.AssignmentRubricItemTestCaseRepository;
import com.womm.backend.repository.TestCaseRepository;
import com.womm.backend.repository.AssignmentRubricRepository;

@Service
public class AssignmentServiceImpl implements AssignmentService {
    AssignmentRepository assignmentRepository;
    CourseRepository courseRepository;
    SubmissionRepository submissionRepository;
    private final TestResultRepository testResultRepository;
    private final RubricScoreRepository rubricScoreRepository;
    private final AssignmentRubricItemTestCaseRepository articRepository;
    private final TestCaseRepository testCaseRepository;
    private final AssignmentRubricRepository assignmentRubricRepository;

    public AssignmentServiceImpl(
            AssignmentRepository assignmentRepository,
            CourseRepository courseRepository,
            SubmissionRepository submissionRepository,
            TestResultRepository testResultRepository,
            RubricScoreRepository rubricScoreRepository,
            AssignmentRubricItemTestCaseRepository articRepository,
            TestCaseRepository testCaseRepository,
            AssignmentRubricRepository assignmentRubricRepository) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.submissionRepository = submissionRepository;
        this.testResultRepository = testResultRepository;
        this.rubricScoreRepository = rubricScoreRepository;
        this.articRepository = articRepository;
        this.testCaseRepository = testCaseRepository;
        this.assignmentRubricRepository = assignmentRubricRepository;
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
    @Transactional
    public void deleteAssignment(Long id) {
        testResultRepository.deleteByAssignmentId(id);
        rubricScoreRepository.deleteByAssignmentId(id);
        submissionRepository.deleteByAssignmentId(id);
        articRepository.deleteByAssignmentId(id);
        testCaseRepository.deleteByAssignmentId(id);
        assignmentRubricRepository.deleteByAssignmentId(id);
        assignmentRepository.deleteById(id);
    }

    @Override
    public Assignment createAssignmentForCourse(Assignment assignment, String crn) {
        Course course = courseRepository.findById(crn).get();
        assignment.setCourse(course);
        return assignmentRepository.save(assignment);
    }

    @Override
    public List<Assignment> getAssignmentsByCourse(String crn) {
        return assignmentRepository.findByCoursecrn(crn);
    }
}