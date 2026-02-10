package com.womm.backend.dto;

import com.womm.backend.enums.Role;

public class LoginResponse {
    private Boolean success;
    private String cwid;
    private String firstName;
    private String lastName;
    private Role role;

    public LoginResponse() {}

    public LoginResponse(Boolean success, String cwid, String firstName, String lastName,Role role) {
        this.success = success;
        this.cwid = cwid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
    }

    public Boolean getSuccess() {
        return success;
    }
    public void setSuccess(Boolean success) {
        this.success = success;
    }

    public String getCwid() {
        return cwid;
    }
    public void setCwid(String cwid) {
        this.cwid = cwid;
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

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
}
