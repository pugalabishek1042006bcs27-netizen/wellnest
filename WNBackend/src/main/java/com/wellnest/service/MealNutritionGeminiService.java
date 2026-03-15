package com.wellnest.service;

import com.wellnest.model.MealNutritionEstimateResponse;
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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MealNutritionGeminiService {

    private final RestTemplate restTemplate;

    @Value("${gemini.api.key:}")
    private String apiKey;

    public MealNutritionGeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public MealNutritionEstimateResponse estimateNutrition(String mealName, String foodType) {
        if (apiKey == null || apiKey.isBlank() || "Enter_your_api".equals(apiKey)) {
            throw new IllegalStateException("Gemini API key is not configured");
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

        Map<String, Object> body = new HashMap<>();
        Map<String, String> textPart = new HashMap<>();
        textPart.put("text", buildPrompt(mealName, foodType));

        Map<String, Object> partWrapper = new HashMap<>();
        partWrapper.put("parts", List.of(textPart));
        body.put("contents", List.of(partWrapper));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(body, headers);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, httpEntity, Map.class);
        Map<String, Object> responseBody = response.getBody();

        @SuppressWarnings("unchecked")
        Map<String, Object> candidate = (Map<String, Object>) ((List<?>) responseBody.get("candidates")).get(0);
        @SuppressWarnings("unchecked")
        Map<String, Object> content = (Map<String, Object>) candidate.get("content");
        @SuppressWarnings("unchecked")
        Map<String, Object> part = (Map<String, Object>) ((List<?>) content.get("parts")).get(0);

        String text = String.valueOf(part.get("text"));
        return parseEstimate(text);
    }

    private MealNutritionEstimateResponse parseEstimate(String rawText) {
        String cleaned = extractJsonObject(rawText);
        return new MealNutritionEstimateResponse(
            extractInteger(cleaned, "calories"),
            extractInteger(cleaned, "protein"),
            extractInteger(cleaned, "carbs"),
            extractInteger(cleaned, "fats")
        );
    }

    private String extractJsonObject(String rawText) {
        if (rawText == null) {
            throw new RuntimeException("Gemini returned empty response");
        }

        String trimmed = rawText.trim();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replace("```json", "").replace("```", "").trim();
        }

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start < 0 || end <= start) {
            throw new RuntimeException("Gemini response did not include JSON");
        }

        return trimmed.substring(start, end + 1);
    }

    private int sanitize(int value) {
        return Math.max(value, 0);
    }

    private int extractInteger(String jsonText, String key) {
        Pattern pattern = Pattern.compile("\\\"" + key + "\\\"\\s*:\\s*(-?\\d+)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(jsonText);
        if (!matcher.find()) {
            return 0;
        }

        try {
            return sanitize(Integer.parseInt(matcher.group(1)));
        } catch (NumberFormatException ex) {
            return 0;
        }
    }

    private String buildPrompt(String mealName, String foodType) {
        String foodTypePart = (foodType == null || foodType.isBlank()) ? "" : ("; food type: " + foodType);
        return "Estimate nutrition for this meal: " + mealName + foodTypePart + ". "
            + "Return ONLY valid JSON with numeric integer fields exactly like this: "
            + "{\"calories\": 0, \"protein\": 0, \"carbs\": 0, \"fats\": 0}. "
            + "No markdown, no explanation, no units.";
    }
}
