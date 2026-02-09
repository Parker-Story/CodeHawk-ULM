package com.womm.backend.dto;

import com.womm.backend.enums.Role;

public class LoginResponse {
    private Role role;
    private String firstName;
    private String lastName;
    private String cwid;

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }

    public String getFirstName() {
        return firstName;
    }
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getCwid() {
        return cwid;
    }
    public void setCwid(String cwid) {
        this.cwid = cwid;
    }
}
