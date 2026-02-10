package com.womm.backend.service;

import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;
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
    public User getUser(String cwid) {
        return userRepository.findById(cwid).get();
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
    public void deleteUser(String cwid) {
        userRepository.deleteById(cwid);
    }

    // Registration/Login
    @Override
    public User register(RegisterRequest request) {
        //is user with cwid and role in database
        if(userRepository.findByCwidAndRole(request.getCwid(), request.getRole()).isPresent()) {
            throw new RuntimeException("User already exists.");
        }

        User user = new User(request.getCwid(), request.getFirstName(), request.getLastName(), request.getEmail(), request.getPassword(), request.getRole());
        return userRepository.save(user);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        // check for user with given email
        User user = userRepository.findByEmail(request.getEmail()).orElse(null);

        // if no user with email or incorrect password
        if(user == null || !user.getPasswordHash().equals(request.getPassword())) {
            return new LoginResponse(false, null, null, null, null);
        }

        // correct email and password
        return new LoginResponse(true, user.getCwid(), user.getFirstName(), user.getLastName(), user.getRole());
    }
}
