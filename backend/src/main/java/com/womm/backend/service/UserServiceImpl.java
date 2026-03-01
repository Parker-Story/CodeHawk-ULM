package com.womm.backend.service;
import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;
import com.womm.backend.enums.Role;
import com.womm.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
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
    public void deleteUser(String id) {
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

        User user = new User(cwid, request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getRole());
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        if (user == null || !user.getPasswordHash().equals(request.getPassword())) {
            return new LoginResponse(false, null, null, null, null, null);
        }

        return new LoginResponse(true, user.getId(), user.getCwid(), user.getFirstName(), user.getLastName(), user.getRole());
    }
}