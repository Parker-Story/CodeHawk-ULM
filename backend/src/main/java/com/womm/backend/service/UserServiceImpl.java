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
    public User getUser(Long id) {
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
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    // Registration/Login
    @Override
    public User register(RegisterRequest request) {
        //is user with id and role in database
        if(userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists.");
        }

        User user;
        if (request.getRole() == Role.STUDENT) { // if student, add cwid
            user = new User(request.getCwid(), request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getRole());
        } else { // if faculty/TA, keep null
            user = new User(null, request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getRole());
        }

        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // check for user with given email
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        // if no user with email or incorrect password
        if(user == null || !user.getPasswordHash().equals(request.getPassword())) {
            return new LoginResponse(false, null, null, null, null, null);
        }

        // correct email and password
        if (user.getRole() == Role.STUDENT) { // if student, return cwid also
            return new LoginResponse(true, user.getId(), user.getCwid(), user.getFirstName(), user.getLastName(), user.getRole());
        } else { // if faculty/TA, return null
            return new LoginResponse(true, user.getId(), null, user.getFirstName(), user.getLastName(), user.getRole());
        }

    }
}
