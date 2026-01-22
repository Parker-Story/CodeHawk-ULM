package com.womm.backend.user;

import java.util.List;

public interface UserService {
    public String createUser(User user);
    public User getUser(String cwid);
    public List<User> getAllUsers();
    public String updateUser(User user);
    public String deleteUser(String cwid);
}
