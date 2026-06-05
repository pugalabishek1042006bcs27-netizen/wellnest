package com.wellnest.controller;

import com.wellnest.model.Goal;
import com.wellnest.model.User;
import com.wellnest.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/save")
    public ResponseEntity<?> saveGoals(@RequestParam String email, @RequestBody List<Goal> goals) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("message", "User not found");
                }});
            }

            user.setGoals(goals);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            Map<String, Object> response = new HashMap<>();
            response.put("data", goals);
            response.put("message", "Goals saved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error saving goals: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/get")
    public ResponseEntity<?> getGoals(@RequestParam String email) {
        try {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(new HashMap<String, String>() {{
                    put("message", "User not found");
                }});
            }

            List<Goal> goals = user.getGoals();

            Map<String, Object> response = new HashMap<>();
            response.put("data", goals);
            response.put("message", "Goals retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error retrieving goals: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
