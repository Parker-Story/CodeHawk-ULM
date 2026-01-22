package com.womm.backend.user;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public String createUser(User user) {
        userRepository.save(user);
        return "Create Success...";
    }

    @Override
    public User getUser(String cwid) {
        return userRepository.findById(cwid).get();
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public String updateUser(User user) {
        userRepository.save(user);
        return "Update Success...";
    }

    @Override
    public String deleteUser(String cwid) {
        userRepository.deleteById(cwid);
        return "Delete Success...";
    }
    
}
