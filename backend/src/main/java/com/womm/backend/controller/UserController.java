package com.womm.backend.controller;

import com.womm.backend.entity.User;
import com.womm.backend.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping(path = "/api/user")
@CrossOrigin(origins = "http://localhost:3000")
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
    @GetMapping("{cwid}")
    public User getUserDetails(@PathVariable("cwid") String cwid) {
        return userService.getUser(cwid);
    }

    // Retrieve All
    @GetMapping()
    public List<User> getAllUserDetails() {
        return userService.getAllUsers();
    }

    // Update
    @PutMapping
    public User updateUserDetails(@RequestBody User user) {
        return userService.updateUser(user);
    }

    // Delete
    @DeleteMapping("{cwid}")
    public void deleteUserDetails(@PathVariable("cwid") String cwid) {
        userService.deleteUser(cwid);
    }

}
