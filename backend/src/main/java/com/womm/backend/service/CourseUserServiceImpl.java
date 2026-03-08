package com.womm.backend.service;
import com.womm.backend.entity.Course;
import com.womm.backend.entity.CourseUser;
import com.womm.backend.entity.User;
import com.womm.backend.enums.CourseRole;
import com.womm.backend.id.CourseUserId;
import com.womm.backend.repository.CourseRepository;
import com.womm.backend.repository.CourseUserRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import com.womm.backend.repository.SubmissionRepository;
import org.springframework.transaction.annotation.Transactional;
import com.womm.backend.repository.TestResultRepository;

@Service
public class CourseUserServiceImpl implements CourseUserService {
    CourseUserRepository courseUserRepository;
    UserRepository userRepository;
    CourseRepository courseRepository;
    SubmissionRepository submissionRepository;
    TestResultRepository testResultRepository;

    public CourseUserServiceImpl(CourseUserRepository courseUserRepository, UserRepository userRepository, CourseRepository courseRepository, SubmissionRepository submissionRepository, TestResultRepository testResultRepository) {
        this.courseUserRepository = courseUserRepository;
        this.userRepository = userRepository;
        this.courseRepository = courseRepository;
        this.submissionRepository = submissionRepository;
        this.testResultRepository = testResultRepository;
    }

    @Override
    public CourseUser createCourseUser(CourseUser courseUser) {
        return courseUserRepository.save(courseUser);
    }

    @Override
    public CourseUser getCourseUser(String userId, String courseCrn) {
        return courseUserRepository.findById(new CourseUserId(userId, courseCrn)).get();
    }

    @Override
    public List<CourseUser> getAllCourseUsers() {
        return courseUserRepository.findAll();
    }

    @Override
    public CourseUser updateCourseUser(CourseUser courseUser) {
        return courseUserRepository.save(courseUser);
    }

    @Override
    @Transactional
    public void deleteCourseUser(String userId, String courseCrn) {
        testResultRepository.deleteByUserIdAndCourseCrn(userId, courseCrn);
        submissionRepository.deleteByUserIdAndCourseCrn(userId, courseCrn);
        courseUserRepository.deleteById(new CourseUserId(userId, courseCrn));
    }

    @Override
    public CourseUser addUserToCourse(String crn, String cwid) {
        User user = userRepository.findByCwid(cwid)
                .orElseThrow(() -> new RuntimeException("User not found with CWID: " + cwid));
        Course course = courseRepository.findById(crn)
                .orElseThrow(() -> new RuntimeException("Course not found: " + crn));
        CourseUser courseUser = new CourseUser(user, course, CourseRole.STUDENT);
        return courseUserRepository.save(courseUser);
    }

    @Override
    public List<CourseUser> getUsersByCourse(String crn) {
        return courseUserRepository.findUsersByCourseCrn(crn);
    }
    @Override
    public CourseUser enrollByCode(String code, String cwid) {
        Course course = courseRepository.findByCode(code)
            .orElseThrow(() -> new RuntimeException("Course not found with code: " + code));
        User user = userRepository.findByCwid(cwid)
            .orElseThrow(() -> new RuntimeException("User not found with CWID: " + cwid));
        CourseUser courseUser = new CourseUser(user, course, CourseRole.STUDENT);
        return courseUserRepository.save(courseUser);
    }

    @Override
    public CourseUser promoteToTa(String crn, String userId) {
        CourseUser courseUser = courseUserRepository.findById(new CourseUserId(userId, crn))
                .orElseThrow(() -> new RuntimeException("CourseUser not found"));
        long submissionCount = submissionRepository.countByUserIdAndCourseCrn(userId, crn);
        if (submissionCount > 0) {
            throw new RuntimeException("Cannot promote to TA: student has existing submissions in this course.");
        }
        courseUser.setCourseRole(CourseRole.TA);
        return courseUserRepository.save(courseUser);
    }

    @Override
    public List<CourseUser> getCourseUsersByUserId(String userId) {
        return courseUserRepository.findCourseUsersByUserId(userId);
    }

    @Override
    public CourseUser demoteFromTa(String crn, String userId) {
        CourseUser courseUser = courseUserRepository.findById(new CourseUserId(userId, crn))
                .orElseThrow(() -> new RuntimeException("CourseUser not found"));
        courseUser.setCourseRole(CourseRole.STUDENT);
        return courseUserRepository.save(courseUser);
    }
}