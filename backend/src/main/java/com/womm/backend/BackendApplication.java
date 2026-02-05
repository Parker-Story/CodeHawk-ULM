package com.womm.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
        //Todo: Error handling - @Transactional in serviceImpl classes?
        //Todo: add DTOs
        //Todo: add auth and security
        //Todo: connect frontend
    }

}
