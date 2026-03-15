package com.wellnest.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.wellnest.service.HealthChatService;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/health-chat")
@CrossOrigin(origins = "*")
public class HealthChatController {
    private final HealthChatService healthChatService;
    public HealthChatController(HealthChatService healthChatService) {
        this.healthChatService = healthChatService;
    }
    @PostMapping("/message")
    // Handles incoming chat messages and returns an AI-generated response
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestParam(required = false) String email,
            // Request body containing the message and optional health context as a JSON payload
            @RequestBody Map<String, String> payload) {
        
       
        Map<String, Object> response = new HashMap<>();
        try {
            // Extracts the user's message from the request payload
            String userMessage = payload.get("message");
            // Extracts health context from payload, defaulting to "general health" if not provided
            String healthContext = payload.getOrDefault("healthContext", "general health");
            
            // Checks if the user message is null or empty (only whitespace)
            if (userMessage == null || userMessage.trim().isEmpty()) {
                response.put("success", false);
                response.put("reply", "Please enter a message to continue the conversation.");
                return ResponseEntity.ok(response);
            }

            String reply = healthChatService.generateChatResponse(userMessage, email, healthContext);
            response.put("success", true);
            response.put("reply", reply);
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            response.put("success", false);
            response.put("reply", "I apologize, but I encountered an error. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}
