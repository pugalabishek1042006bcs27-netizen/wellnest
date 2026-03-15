package com.wellnest.service;

import com.wellnest.model.WorkoutPlanRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;


@Service
public class WorkoutPlanGeminiService {
    @Autowired
    private RestTemplate restTemplate;

    @Value("${gemini.api.key:AIzaSyDT6V1m3Q12W3Mp-gAOZsi_Vgn4AaS7Gg8}")
    private String geminiApiKey;

    public String generateWorkoutPlan(WorkoutPlanRequest request) {
        if (geminiApiKey == null || geminiApiKey.isEmpty()) {
          
            throw new RuntimeException("Gemini API key not configured");
        }

        // Build the Gemini API endpoint URL with the API key as query parameter
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + geminiApiKey;
        String prompt = buildPrompt(request);

        // Create the request body as a HashMap
        Map<String, Object> requestBody = new HashMap<>();
        // Create content object to hold the text part
        Map<String, Object> content = new HashMap<>();
        // Create part object to hold the prompt text
        Map<String, String> part = new HashMap<>();

        // Set the prompt text in the part
        part.put("text", prompt);
        // Add part to content's parts array
        content.put("parts", new Object[]{part});
        // Add content to requestBody's contents array
        requestBody.put("contents", new Object[]{content});

        // Create HTTP headers for the API request
        HttpHeaders headers = new HttpHeaders();
        // Set content type to JSON for API communication
        headers.set("Content-Type", "application/json");
        // Wrap request body and headers into HTTP entity
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(requestBody, headers);

        // Send POST request to Gemini API and get response (suppress unchecked cast warning)
        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, httpEntity, Map.class);
        // Extract response body from HTTP response
        Map<String, Object> responseBody = response.getBody();

        // Check if response body exists and contains candidates
        if (responseBody != null && responseBody.containsKey("candidates")) {
            // Extract candidates from response
            Object candidates = responseBody.get("candidates");
            // Check if candidates is a list
            if (candidates instanceof java.util.List) {
                // Cast to list for iteration
                java.util.List<?> candidatesList = (java.util.List<?>) candidates;
                // Check if candidates list is not empty
                if (!candidatesList.isEmpty()) {
                    // Get the first candidate from the list
                    Object firstCandidate = candidatesList.get(0);
                    // Check if first candidate is a map
                    if (firstCandidate instanceof Map) {
                        // Cast to map
                        Map<?, ?> candidateMap = (Map<?, ?>) firstCandidate;
                        // Extract content object from candidate
                        Object content_obj = candidateMap.get("content");
                        // Check if content is a map
                        if (content_obj instanceof Map) {
                            // Cast to map
                            Map<?, ?> contentMap = (Map<?, ?>) content_obj;
                            // Extract parts from content
                            Object parts_obj = contentMap.get("parts");
                            // Check if parts is a list
                            if (parts_obj instanceof java.util.List) {
                                // Cast to list
                                java.util.List<?> partsList = (java.util.List<?>) parts_obj;
                                // Check if parts list is not empty
                                if (!partsList.isEmpty()) {
                                    // Get the first part from parts list
                                    Object firstPart = partsList.get(0);
                                    // Check if first part is a map
                                    if (firstPart instanceof Map) {
                                        // Cast to map
                                        Map<?, ?> partMap = (Map<?, ?>) firstPart;
                                        // Return the text value from the first part
                                        return (String) partMap.get("text");
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        
        return "Unable to generate workout plan. Please try again.";
    }

    // Helper method to build the prompt for Gemini API based on user request
    private String buildPrompt(WorkoutPlanRequest request) {
        // Get intensity level based on fitness level
        String intensityLevel = getIntensityFromFitnessLevel(request.getFitnessLevel());
        // Get plan period or default to "day" if null
        String planPeriod = request.getPlanPeriod() != null ? request.getPlanPeriod() : "day";
        // Convert plan period to duration format (1-week or 1-day)
        String duration = planPeriod.equalsIgnoreCase("week") ? "1-week" : "1-day";
        
        // Create string builder to construct the full prompt
        StringBuilder prompt = new StringBuilder();
        // Add introductory text with duration, age, and gender
        prompt.append("Create a personalized ").append(duration).append(" workout plan for a ").append(request.getAge()).append("-year-old ").append(request.getGender()).append(".\n\n");
        // Add user details section
        prompt.append("User Details:\n");
        
        prompt.append("- Fitness Level: ").append(request.getFitnessLevel()).append(" (").append(intensityLevel).append(" intensity)\n");
        
        prompt.append("- Height: ").append(String.format("%.1f", request.getHeight())).append(" cm\n");
        
        prompt.append("- Weight: ").append(String.format("%.1f", request.getWeight())).append(" kg\n");
       
        prompt.append("- Primary Goal: ").append(request.getWorkoutFocus()).append("\n");
        
        prompt.append("- Available Equipment: ").append(request.getEquipment()).append("\n");
        
        prompt.append("- Session Duration: ").append(request.getSessionTime()).append(" minutes\n");
        
        prompt.append("- Health Considerations: ").append(request.getHealthConditions() != null && !request.getHealthConditions().isEmpty() ? request.getHealthConditions() : "None").append("\n\n");
        
        // Check if plan period is weekly
        if (planPeriod.equalsIgnoreCase("week")) {
            // Add format requirements for weekly plan
            prompt.append("EXACT FORMAT REQUIRED FOR WEEKLY PLAN:\n");
            // Example Monday with exercises
            prompt.append("Monday:\n");
            // Example push-ups with details
            prompt.append("  Exercise: Push-ups (Sets: 3, Reps: 15, Rest: 60s)\n");
            prompt.append("    Form: Keep body straight, core engaged\n");
            prompt.append("    Muscles: Chest, Triceps, Shoulders\n");
            // Example squats with details
            prompt.append("  Exercise: Squats (Sets: 3, Reps: 15, Rest: 60s)\n");
            prompt.append("    Form: Keep chest up, knees aligned with toes\n");
            prompt.append("    Muscles: Quadriceps, Hamstrings, Glutes\n");
            // Example Tuesday with exercises
            prompt.append("Tuesday:\n");
            // Example burpees with details
            prompt.append("  Exercise: Burpees (Sets: 3, Reps: 10, Rest: 90s)\n");
            prompt.append("    Form: Jump explosively, land softly\n");
            prompt.append("    Muscles: Full body cardio\n\n");
        } else {
            // Add format requirements for daily plan
            prompt.append("EXACT FORMAT REQUIRED FOR DAILY PLAN:\n");
            // Add warm-up section
            prompt.append("Warm-up:\n");
            // Example jumping jacks
            prompt.append("  Exercise: Jumping Jacks (Sets: 2, Reps: 30, Rest: 30s)\n");
            prompt.append("    Form: Jump feet apart while raising arms\n");
            prompt.append("    Muscles: Cardio warm-up\n");
            // Add main workout section
            prompt.append("Main Workout:\n");
            // Example push-ups with details
            prompt.append("  Exercise: Push-ups (Sets: 3, Reps: 15, Rest: 60s)\n");
            prompt.append("    Form: Keep body straight, core engaged\n");
            prompt.append("    Muscles: Chest, Triceps, Shoulders\n");
            // Example squats with details
            prompt.append("  Exercise: Squats (Sets: 3, Reps: 15, Rest: 60s)\n");
            prompt.append("    Form: Keep chest up, knees aligned with toes\n");
            prompt.append("    Muscles: Quadriceps, Hamstrings, Glutes\n\n");
        }
        
        // Add rules for AI to follow
        prompt.append("MUST FOLLOW THESE RULES:\n");
        // Rule 1: Exercise format specification
        prompt.append("1. For ").append(planPeriod.equalsIgnoreCase("week") ? "each day" : "the workout").append(", list exercises in this EXACT format: 'Exercise: [Name] (Sets: X, Reps: Y, Rest: Zs)'\n");
        // Rule 2: Exercise details
        prompt.append("2. Below each exercise, add:\n");
        prompt.append("   - Form: Form tips and cues for proper execution\n");
        prompt.append("   - Muscles: Target muscle groups\n");
        // Rule 3: Sets as number
        prompt.append("3. Include sets count as a NUMBER\n");
        // Rule 4: Reps as number
        prompt.append("4. Include reps count as a NUMBER\n");
        // Rule 5: Rest duration format
        prompt.append("5. Include rest duration (e.g., 60s, 90s)\n");
        // Rule 6: Fitness level and equipment matching
        prompt.append("6. Make sure exercises match the fitness level and use only available equipment\n");
        
        // Return the complete prompt as a string
        return prompt.toString();
    }

    // Helper method to convert fitness level to intensity level
    private String getIntensityFromFitnessLevel(String fitnessLevel) {
        // Return "moderate" as default if fitness level is null
        if (fitnessLevel == null) return "moderate";
        // Use switch expression to map fitness level to intensity
        return switch(fitnessLevel.toLowerCase()) {
            // Beginner maps to low intensity
            case "beginner" -> "low";
            // Intermediate maps to moderate intensity
            case "intermediate" -> "moderate";
            // Advanced and expert map to high intensity
            case "advanced", "expert" -> "high";
            // Default to moderate for unknown fitness levels
            default -> "moderate";
        };
    }
}

