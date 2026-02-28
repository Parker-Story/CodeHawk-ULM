package com.womm.backend.repository;

import com.womm.backend.entity.User;
import com.womm.backend.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    //Optional<User> findByIdAndRole(long id, Role role);
    Optional<User> findByEmail(String email);
}
