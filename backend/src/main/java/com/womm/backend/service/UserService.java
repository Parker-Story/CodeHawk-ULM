package com.womm.backend.service;

import com.womm.backend.entity.User;

import java.util.List;

public interface UserService {
    public User createUser(User user);
    public User getUser(String cwid);
    public List<User> getAllUsers();
    public User updateUser(User user);
    public void deleteUser(String cwid);
}
