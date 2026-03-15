package com.wellnest.service;

import com.wellnest.model.DietPlanRequest;
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
public class DietPlanGeminiService {
    private final RestTemplate restTemplate = new RestTemplate();
    @Value("${gemini.api.key:AIzaSyDT6V1m3Q12W3Mp-gAOZsi_Vgn4AaS7Gg8}")
    private String apiKey;
    public String generateDietPlan(DietPlanRequest request) {
        // Validate that API key exists and is not empty or placeholder
        if (apiKey == null || apiKey.isBlank() || "Enter_your_api".equals(apiKey)) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        // Create request body structure for Gemini API
        Map<String, Object> body = new HashMap<>();
        // Create text part containing the prompt for diet plan generation
        Map<String, String> textPart = new HashMap<>();
        textPart.put("text", buildPrompt(request));

        // Wrap text part in parts array as required by Gemini API structure
        Map<String, Object> partWrapper = new HashMap<>();
        // Add parts array to wrapper
        partWrapper.put("parts", List.of(textPart));
        // Add wrapped contents to request body
        body.put("contents", List.of(partWrapper));

        // Create HTTP headers for the API request
        HttpHeaders headers = new HttpHeaders();
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

        return String.valueOf(part.get("text"));
    }
    private String buildPrompt(DietPlanRequest request) {
        String planPeriod = formatValue(request.getPlanPeriod()).toLowerCase();
        String planDuration = getPlanDuration(planPeriod);
        String planStructure = getPlanStructure(planPeriod);
        
        // Create string builder to construct the full prompt
        StringBuilder prompt = new StringBuilder();
        // Add header with plan duration (1-day or 7-day)
        prompt.append("GENERATE A ").append(planDuration.toUpperCase()).append(" DIET PLAN\n\n");
        // Add user information: age and dietary preference if provided
        prompt.append("User: ").append(formatValue(request.getAge())).append(" years");
        // Append dietary preference if it has a value
        if (hasValue(request.getDietaryPreference())) prompt.append(", ").append(request.getDietaryPreference());
        prompt.append("\n\n");
        
        // Add structured format for the plan
        prompt.append(planStructure).append("\n\n");
        
        // Add required format section with example meal structure
        prompt.append("REQUIRED FORMAT - EVERY meal must have this exact structure:\n");
        prompt.append("Breakfast: Oatmeal with berries (Calories: 350, Fats: 8, Carbs: 60)\n");
        prompt.append("Lunch: Grilled chicken with rice (Calories: 450, Fats: 12, Carbs: 45)\n");
        prompt.append("Dinner: Salmon with vegetables (Calories: 520, Fats: 15, Carbs: 50)\n\n");
    
        prompt.append("MUST FOLLOW THESE RULES:\n");
        prompt.append("1. Include meal name and foods\n");
        prompt.append("2. Always add (Calories: NUMBER, Fats: NUMBER, Carbs: NUMBER)\n");
        prompt.append("3. Numbers only - no g, kcal, or other units in nutrition values\n");
        prompt.append("4. Output ONLY the meal plan with no other text\n");
        if ("week".equalsIgnoreCase(planPeriod)) {
            prompt.append("5. WEEKLY UNIQUENESS: Meals must be different every day. Do NOT repeat the same breakfast, lunch, dinner, or snack on multiple days\n");
            prompt.append("6. Across Monday-Sunday, each meal entry must have a unique dish name\n");
            prompt.append("7. Provide exact day headers in order: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday\n");
        }
        return prompt.toString();
    }
    
    // Helper method to check if a value is not null, empty, or default "not provided"
    private boolean hasValue(Object value) {
        // Return false if value is null
        if (value == null) {
            return false;
        }
        // Convert value to string and trim whitespace
        String valueStr = String.valueOf(value).trim();
        // Return true only if string is not empty and not "not provided"
        return !valueStr.isEmpty() && !"not provided".equalsIgnoreCase(valueStr);
    }

    // Helper method to convert period (day/week) to duration text for prompt
    private String getPlanDuration(String period) {
      
        if ("day".equalsIgnoreCase(period)) {
            return "1-day";
        } else if ("week".equalsIgnoreCase(period)) {
            return "7-day";
        }
        return "7-day";
    }

    // Helper method to get the structure template for daily or weekly plan
    private String getPlanStructure(String period) {
        // Return daily plan format if period is "day"
        if ("day".equalsIgnoreCase(period)) {
            // Daily plan includes breakfast, lunch, dinner, and 2 snacks
            return "DAILY PLAN FORMAT:\nBreakfast: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nLunch: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nDinner: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nSnack 1: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nSnack 2: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)";
        // Return weekly plan format if period is "week"
        } else if ("week".equalsIgnoreCase(period)) {
            // Weekly plan includes breakfast, lunch, dinner, and 1 snack for each day
            return "WEEKLY PLAN FORMAT:\nFor each day (Monday through Sunday), list:\nBreakfast: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nLunch: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nDinner: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nSnack: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)";
        }
        // Default to weekly plan format if period doesn't match
        return "WEEKLY PLAN FORMAT:\nFor each day (Monday through Sunday), list:\nBreakfast: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nLunch: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nDinner: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)\nSnack: [meal name] (Calories: [number], Fats: [number]g, Carbs: [number]g)";
    }

    // Helper method to format values by handling null and empty strings
    private String formatValue(Object value) {
        // Return "not provided" if value is null
        if (value == null) {
            return "not provided";
        }

        // Convert value to string and trim whitespace
        String valueAsString = String.valueOf(value).trim();
        // Return "not provided" if string is empty, otherwise return trimmed string
        return valueAsString.isEmpty() ? "not provided" : valueAsString;
    }
}