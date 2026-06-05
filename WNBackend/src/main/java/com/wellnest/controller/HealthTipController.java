package com.wellnest.controller;

import com.wellnest.model.HealthTip;
import com.wellnest.service.ai.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health-tips")
@CrossOrigin(origins = "*")
public class HealthTipController {

    private final GeminiService geminiService;

    public HealthTipController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    /**
     * Get a random health tip with image
     * This endpoint is meant to be polled every 10 seconds from the frontend
     */
    @GetMapping("/random")
    public ResponseEntity<Map<String, Object>> getRandomHealthTip(
            @RequestParam(defaultValue = "general") String category) {
        
        HealthTip healthTip = geminiService.generateHealthTipWithImage(category);

        Map<String, Object> result = new HashMap<>();
        result.put("success", true);
        result.put("data", healthTip);
        result.put("message", "Health tip retrieved successfully");
        
        return ResponseEntity.ok(result);
    }

}
