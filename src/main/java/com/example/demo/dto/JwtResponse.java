package com.example.demo.dto;

public class JwtResponse {

    private String token;
    private String role;
    private Long id;

    public JwtResponse(String token, String role, Long id) {
        this.token = token;
        this.role = role;
        this.id = id;
    }

    public Long getId() {
        return id;
    }

    public String getToken() {
        return token;
    }

    public String getRole() {
        return role;
    }
}
