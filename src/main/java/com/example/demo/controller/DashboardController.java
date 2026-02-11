package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    @GetMapping("/admin/dashboard")
    public String adminDashboard() {
        return "Admin Dashboard";
    }

    @GetMapping("/responder/dashboard")
    public String responderDashboard() {
        return "Responder Dashboard";
    }

    @GetMapping("/citizen/dashboard")
    public String citizenDashboard() {
        return "Citizen Dashboard";
    }
}
