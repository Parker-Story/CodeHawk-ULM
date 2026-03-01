package com.womm.backend.dto;
import com.womm.backend.enums.Role;

public class LoginResponse {
    private Boolean success;
    private String id;
    private String cwid;
    private String firstName;
    private String lastName;
    private Role role;
    private String email;

    public LoginResponse() {}
    public LoginResponse(Boolean success, String id, String cwid, String firstName, String lastName, Role role, String email) {
        this.success = success;
        this.id = id;
        this.cwid = cwid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.email = email;
    }

    public Boolean getSuccess() { return success; }
    public void setSuccess(Boolean success) { this.success = success; }
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getCwid() { return cwid; }
    public void setCwid(String cwid) { this.cwid = cwid; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}