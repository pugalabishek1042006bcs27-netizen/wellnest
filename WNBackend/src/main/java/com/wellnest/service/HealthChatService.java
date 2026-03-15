package com.wellnest.service;

import com.wellnest.model.HealthChatRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class HealthChatService {
    @Autowired
    private HealthChatGeminiService healthChatGeminiService;
    public String generateChatResponse(String userMessage, String email, String healthContext) {
        // Validate that user message exists and is not empty or whitespace only
        if (userMessage == null || userMessage.trim().isEmpty()) {
            throw new IllegalArgumentException("User message cannot be empty");
        }

        // Create a new HealthChatRequest object to encapsulate the request data
        HealthChatRequest request = new HealthChatRequest();
        // Set the user message in the request
        request.setUserMessage(userMessage);
        request.setEmail(email);
        // Set the health context or use default "general health" if null
        request.setHealthContext(healthContext != null ? healthContext : "general health");
        
        // Call HealthChatGeminiService to generate AI response using the request object
        return healthChatGeminiService.generateHealthChatResponse(request);
    }

    // Overloaded method to generate chat response with only user message (convenience method)
    public String generateChatResponse(String userMessage) {
        return generateChatResponse(userMessage, null, null);
    }
}

