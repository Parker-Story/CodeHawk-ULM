package com.womm.backend.service;

import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;

import java.util.List;

public interface UserService {
    public User createUser(User user);

    public User getUser(String cwid);

    public List<User> getAllUsers();

    public User updateUser(User user);

    public void deleteUser(String cwid);

    public User register(RegisterRequest request);

    public LoginResponse login(LoginRequest request);
}
