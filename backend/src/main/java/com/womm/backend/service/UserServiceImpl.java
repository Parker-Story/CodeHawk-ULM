package com.womm.backend.service;
import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;
import com.womm.backend.enums.Role;
import com.womm.backend.repository.AssignmentGroupMemberRepository;
import com.womm.backend.repository.CourseUserRepository;
import com.womm.backend.repository.RubricScoreRepository;
import com.womm.backend.repository.SubmissionFileRepository;
import com.womm.backend.repository.SubmissionRepository;
import com.womm.backend.repository.TestResultRepository;
import com.womm.backend.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private final TestResultRepository testResultRepository;
    private final RubricScoreRepository rubricScoreRepository;
    private final SubmissionFileRepository submissionFileRepository;
    private final SubmissionRepository submissionRepository;
    private final AssignmentGroupMemberRepository assignmentGroupMemberRepository;
    private final CourseUserRepository courseUserRepository;

    public UserServiceImpl(UserRepository userRepository,
                           TestResultRepository testResultRepository,
                           RubricScoreRepository rubricScoreRepository,
                           SubmissionFileRepository submissionFileRepository,
                           SubmissionRepository submissionRepository,
                           AssignmentGroupMemberRepository assignmentGroupMemberRepository,
                           CourseUserRepository courseUserRepository) {
        this.userRepository = userRepository;
        this.testResultRepository = testResultRepository;
        this.rubricScoreRepository = rubricScoreRepository;
        this.submissionFileRepository = submissionFileRepository;
        this.submissionRepository = submissionRepository;
        this.assignmentGroupMemberRepository = assignmentGroupMemberRepository;
        this.courseUserRepository = courseUserRepository;
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public User getUser(String id) {
        return userRepository.findById(id).get();
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    @Override
    @Transactional
    public void deleteUser(String id) {
        testResultRepository.deleteByUserId(id);
        rubricScoreRepository.deleteByUserId(id);
        submissionFileRepository.deleteByUserId(id);
        submissionRepository.deleteByUserId(id);
        assignmentGroupMemberRepository.deleteByUserId(id);
        courseUserRepository.deleteByUserId(id);
        userRepository.deleteById(id);
    }

    @Override
    public User register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User with this email already exists.");
        }

        // For students and TAs, check if CWID already exists
        if (request.getCwid() != null && !request.getCwid().isEmpty()) {
            if (userRepository.findByCwid(request.getCwid()).isPresent()) {
                throw new RuntimeException("User with this CWID already exists.");
            }
        }

        // Faculty have null CWID
        String cwid = (request.getRole() == Role.FACULTY) ? null : request.getCwid();

        String hashedPassword = encoder.encode(request.getPassword());
        User user = new User(cwid, request.getFirstName(), request.getLastName(), request.getEmail(), hashedPassword, request.getRole());
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (user == null) {
            return new LoginResponse(false, "USER_NOT_FOUND", null, null, null, null, null, null);
        }

        String stored = user.getPasswordHash();
        boolean matched;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            matched = encoder.matches(request.getPassword(), stored);
        } else {
            // Plain-text legacy password — compare then migrate
            matched = stored.equals(request.getPassword());
            if (matched) {
                user.setPasswordHash(encoder.encode(request.getPassword()));
                userRepository.save(user);
            }
        }

        if (!matched) {
            return new LoginResponse(false, "INVALID_PASSWORD", null, null, null, null, null, null);
        }
        return new LoginResponse(true, null, user.getId(), user.getCwid(), user.getFirstName(), user.getLastName(), user.getRole(), user.getEmail());
    }

    @Override
    public boolean changePassword(String userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return false;

        String stored = user.getPasswordHash();
        boolean matched;
        if (stored.startsWith("$2a$") || stored.startsWith("$2b$") || stored.startsWith("$2y$")) {
            matched = encoder.matches(currentPassword, stored);
        } else {
            matched = stored.equals(currentPassword);
        }

        if (!matched) return false;

        user.setPasswordHash(encoder.encode(newPassword));
        userRepository.save(user);
        return true;
    }
}