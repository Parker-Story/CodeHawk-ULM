package com.womm.backend.controller;

import com.womm.backend.entity.User;
import com.womm.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping(path = "/api/users")
public class UserController {

    UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ----- CRUD -----
    // Create
    @PostMapping
    public User createUserDetails(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Retrieve One
    @GetMapping("/{id}")
    public User getUserDetails(@PathVariable("id") Long id) {
        return userService.getUser(id);
    }

    // Retrieve All
    @GetMapping()
    public List<User> getAllUserDetails() {
        return userService.getAllUsers();
    }

    // Update
    @PutMapping("/{id}")
    public User updateUserDetails(@PathVariable Long id, @RequestBody User updatedUser) {
        User user = userService.getUser(id);

        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setEmail(updatedUser.getEmail());
        user.setPasswordHash(updatedUser.getPasswordHash());

        return userService.updateUser(user);
    }

    // Delete
    @DeleteMapping("/{id}")
    public void deleteUserDetails(@PathVariable("id") Long id) {
        System.out.println("Deleting user: " + id);
        userService.deleteUser(id);
    }

}
