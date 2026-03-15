package com.wellnest.controller;

import com.wellnest.model.WorkoutPlanRequest;
import com.wellnest.service.WorkoutPlanGeminiService;
import com.wellnest.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-plan")
@CrossOrigin(origins = "*")
public class WorkoutPlanController {

    @Autowired
    private WorkoutPlanGeminiService workoutPlanGeminiService;

    @Autowired
    private ProfileService profileService;

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateWorkoutPlan(@RequestBody WorkoutPlanRequest request) {
        try {
            String plan = workoutPlanGeminiService.generateWorkoutPlan(request);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("plan", plan);
            response.put("message", "Workout plan generated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, Object>> deleteWorkoutPlan(@RequestParam String email) {
        try {
            profileService.deleteWorkoutPlan(email);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Workout plan deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
