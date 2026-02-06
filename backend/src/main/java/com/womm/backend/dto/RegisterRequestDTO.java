package com.womm.backend.dto;

import com.womm.backend.enums.Role;

public class RegisterRequestDTO {
    private String cwid;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
    private Role role;
}
