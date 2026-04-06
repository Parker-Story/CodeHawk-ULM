package com.womm.backend.controller;

import com.womm.backend.dto.ChangePasswordRequest;
import com.womm.backend.dto.LoginRequest;
import com.womm.backend.dto.LoginResponse;
import com.womm.backend.dto.RegisterRequest;
import com.womm.backend.entity.User;
import com.womm.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return userService.login(request);
    }

    @PostMapping("/register")
    public User register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordRequest request) {
        boolean success = userService.changePassword(request.getUserId(), request.getCurrentPassword(), request.getNewPassword());
        return success ? ResponseEntity.ok().build() : ResponseEntity.status(401).build();
    }
}
