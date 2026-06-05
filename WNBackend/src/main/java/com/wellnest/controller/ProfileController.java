package com.wellnest.controller;

import com.wellnest.model.ProfileRequest;
import com.wellnest.model.ProfileResponse;
import com.wellnest.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @PostMapping("/update")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @RequestParam String email,
            @Valid @RequestBody ProfileRequest request) {
        try {
            ProfileResponse response = profileService.updateProfile(email, request);
            Map<String, Object> result = new HashMap<>();
            // Wrap response to keep a consistent API shape.
            result.put("data", response);
            result.put("message", "Profile updated successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            // Return error text without leaking stack details to clients.
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String email) {
        try {
            ProfileResponse response = profileService.getProfile(email);
            Map<String, Object> result = new HashMap<>();
            // Use the same map structure as update for client consistency.
            result.put("data", response);
            result.put("message", "Profile retrieved successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            // Keep error payload minimal and consistent.
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<Map<String, Object>> resetAccount(@RequestParam String email) {
        try {
            profileService.resetAccount(email);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Account data reset successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
