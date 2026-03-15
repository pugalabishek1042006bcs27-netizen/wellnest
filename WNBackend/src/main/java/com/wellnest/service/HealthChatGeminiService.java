package com.wellnest.service;

import com.wellnest.model.HealthChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@Service
public class HealthChatGeminiService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${gemini.api.key:AIzaSyDT6V1m3Q12W3Mp-gAOZsi_Vgn4AaS7Gg8}")
    private String apiKey;

    public String generateHealthChatResponse(HealthChatRequest request) {
        if (apiKey == null || apiKey.isBlank() || "Enter_your_api".equals(apiKey)) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        // Create request body structure for Gemini API
        Map<String, Object> body = new HashMap<>();
        // Create text part containing the prompt for health chat response
        Map<String, String> textPart = new HashMap<>();
        // Build and set the prompt based on user request
        textPart.put("text", buildPrompt(request));

        // Wrap text part in parts array as required by Gemini API structure
        Map<String, Object> partWrapper = new HashMap<>();
        // Add parts array to wrapper
        partWrapper.put("parts", List.of(textPart));
        // Add wrapped contents to request body
        body.put("contents", List.of(partWrapper));

        // Create HTTP headers for the API request
        HttpHeaders headers = new HttpHeaders();
        // Set content type to JSON for API communication
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Wrap request body and headers into HTTP entity
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);
        
        // Send POST request to Gemini API and get response (suppress unchecked cast warning)
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, httpEntity, Map.class);
        // Extract response body from HTTP response
        Map<String, Object> responseBody = response.getBody();

        // Extract first candidate from the candidates list in response
        @SuppressWarnings("unchecked")
        Map<String, Object> candidate = (Map<String, Object>) ((List<?>) responseBody.get("candidates")).get(0);

        // Extract content object from the candidate
        @SuppressWarnings("unchecked")
        Map<String, Object> content = (Map<String, Object>) candidate.get("content");

        // Extract first part from the parts array in content
        @SuppressWarnings("unchecked")
        Map<String, Object> part = (Map<String, Object>) ((List<?>) content.get("parts")).get(0);

        // Return the generated health chat response text from the API response
        return part.get("text").toString();
    }

    private String buildPrompt(HealthChatRequest request) {
        // Extract user message from request or set to empty string if null
        String userMessage = request.getUserMessage() != null ? request.getUserMessage() : "";
        // Extract health context from request or default to "general health" if null
        String healthContext = request.getHealthContext() != null ? request.getHealthContext() : "general health";

        // Create string builder to construct the full prompt
        StringBuilder prompt = new StringBuilder();
        // Set the persona and instructions for the AI assistant
        prompt.append("You are a knowledgeable and friendly health, fitness, and nutrition assistant.\n\n");
        
        // Add instructions section for the AI to follow
        prompt.append("Instructions:\n");
        // Instruction 1: Provide accurate health advice
        prompt.append("1. Provide accurate, helpful, and safe health advice\n");
        // Instruction 2: Keep responses concise
        prompt.append("2. Keep responses concise and easy to understand\n");
        // Instruction 3: Encourage consulting healthcare professionals
        prompt.append("3. Always encourage consulting healthcare professionals for serious medical concerns\n");
        // Instruction 4: Be supportive and motivational
        prompt.append("4. Be supportive and motivational in your tone\n");
        // Instruction 5: Focus on evidence-based wellness
        prompt.append("5. Focus on evidence-based wellness recommendations\n\n");
        
        // Add the health context for the conversation
        prompt.append("Health Context: ").append(healthContext).append("\n\n");
        
        // Add the user's question or message
        prompt.append("User Question: ").append(userMessage).append("\n\n");
        
        // Add the format requirements section
        prompt.append("EXACT FORMAT REQUIRED:\n");
        // Specify the response format structure
        prompt.append("Provide a helpful response in the format:\n");
        // Example 1: Response section
        prompt.append("Response: [Your health advice here]\n");
        // Example 2: Tips section
        prompt.append("Tips: [2-3 actionable tips]\n");
        // Example 3: Disclaimer section
        prompt.append("Disclaimer: [A brief disclaimer about consulting healthcare professionals]\n\n");
        
        // Add rules for AI to follow when generating the response
        prompt.append("MUST FOLLOW THESE RULES:\n");
        // Rule 1: Always include response with helpful advice
        prompt.append("1. Always include a Response section with helpful advice\n");
        // Rule 2: Include practical tips
        prompt.append("2. Include practical Tips that users can implement\n");
        // Rule 3: Include disclaimer
        prompt.append("3. Include a Disclaimer about consulting healthcare professionals\n");
        // Rule 4: No medical diagnosis
        prompt.append("4. Do not provide medical diagnosis or treatment\n");
        // Rule 5: Focus on wellness
        prompt.append("5. Focus on general wellness and healthy lifestyle recommendations\n");

        
        return prompt.toString();
    }
}

