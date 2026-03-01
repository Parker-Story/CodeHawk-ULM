package com.womm.backend.service;
import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;
import java.util.List;

public interface UserService {
    User createUser(User user);
    User getUser(String id);
    List<User> getAllUsers();
    User updateUser(User user);
    void deleteUser(String id);
    User register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
}