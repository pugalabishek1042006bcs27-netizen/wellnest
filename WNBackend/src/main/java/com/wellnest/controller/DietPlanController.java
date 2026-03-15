package com.wellnest.controller;

import com.wellnest.model.DietPlanRequest;
import com.wellnest.service.DietPlanGeminiService;
import com.wellnest.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/diet-plan")
@CrossOrigin(origins = "*")
public class DietPlanController {

    
    private final DietPlanGeminiService dietPlanGeminiService;
    private final ProfileService profileService;

    public DietPlanController(DietPlanGeminiService dietPlanGeminiService, ProfileService profileService) {
        this.dietPlanGeminiService = dietPlanGeminiService;
        this.profileService = profileService;
    }
    @PostMapping("/generate")
    // Handles diet plan generation based on user request and returns a JSON response
    public ResponseEntity<Map<String, Object>> generateDietPlan(@Valid @RequestBody DietPlanRequest request) {
        // Creates a HashMap to store the response data
        Map<String, Object> response = new HashMap<>();
        try {
            String plan = dietPlanGeminiService.generateDietPlan(request);
            response.put("success", true);
            // Stores the generated diet plan in the response
            response.put("plan", plan);
            response.put("message", "Diet plan generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", "Failed to generate diet plan: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteDietPlan(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        try {
            // Calls the service to delete the diet plan for the provided email address
            profileService.deleteDietPlan(email);
            response.put("success", true);
            response.put("message", "Diet plan deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("message", "Failed to delete diet plan: " + ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
