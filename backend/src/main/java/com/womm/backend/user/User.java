package com.womm.backend.user;

import jakarta.persistence.*;


@Entity
@Table(name = "users")
public class User {

    @Id
    @Column(name = "cwid", length = 8)
    private String cwid;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash; //TODO: add hash logic

    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Role role;

    //TODO: add timestamp logic


    // ----- Constructors -----
    public User() {}

    public User(String cwid, String firstName, String lastName, String email, String passwordHash, Role role) {
        this.cwid = cwid;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }


    // ----- Getters/Setters -----//
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

    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }

}