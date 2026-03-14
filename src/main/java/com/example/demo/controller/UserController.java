package com.example.demo.controller;

import com.example.demo.Entity.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/responders")
    public List<User> getResponders() {
        return userRepository.findByRole("RESPONDER");
    }
}
