package com.womm.backend.user;

import org.springframework.web.bind.annotation.*;
import java.util.List;


@RestController
@RequestMapping(path = "/user")
public class UserController {

    UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // ----- CRUD -----
    // Create
    @PostMapping
    public String createUserDetails(@RequestBody User user) {
        userService.createUser(user);
        return "User created successfully.";
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
    public String updateUserDetails(@RequestBody User user) {
        userService.updateUser(user);
        return "User updated successfully.";
    }

    // Delete
    @DeleteMapping("{cwid}")
    public String deleteUserDetails(@PathVariable("cwid") String cwid) {
        userService.deleteUser(cwid);
        return "User deleted successfully.";
    }

}
