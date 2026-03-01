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

    @PostMapping
    public User createUserDetails(@RequestBody User user) {
        return userService.createUser(user);
    }

    @GetMapping("/{id}")
    public User getUserDetails(@PathVariable("id") String id) {
        return userService.getUser(id);
    }

    @GetMapping()
    public List<User> getAllUserDetails() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    public User updateUserDetails(@PathVariable String id, @RequestBody User updatedUser) {
        User user = userService.getUser(id);
        user.setFirstName(updatedUser.getFirstName());
        user.setLastName(updatedUser.getLastName());
        user.setEmail(updatedUser.getEmail());
        user.setPasswordHash(updatedUser.getPasswordHash());
        return userService.updateUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUserDetails(@PathVariable("id") String id) {
        userService.deleteUser(id);
    }
}