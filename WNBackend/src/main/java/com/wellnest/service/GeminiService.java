package com.wellnest.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;

import com.wellnest.model.HealthTip;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service 
public class GeminiService {
    
    private final RestTemplate restTemplate = new RestTemplate();

    // Inject the Gemini API key from application.properties, with default value if not provided
    //@Value("${gemini.api.key:AIzaSyDT6V1m3Q12W3Mp-gAOZsi_Vgn4AaS7Gg8}")
    private String API_KEY;
    private final Random random = new Random();

    //Meal Images
    private final String[] nutritionImages = {
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800", // Food salad
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", // Vegetables
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800", // Fruits
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800" // Healthy meal
    };

    //Water Images
    private final String[] hydrationImages = {
        "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800", // Water glass
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800", // Water bottle
        "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800", // Water pouring
        "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800" // Drinking water
    };

    //Fitness Images
    private final String[] fitnessImages = {
        "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800", // Running
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800", // Gym workout
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800", // Yoga
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800" // Exercise
    };

    // sleep-related image 
    private final String[] sleepImages = {
        "https://images.unsplash.com/photo-1511688878353-3a2f5be94cd7?w=800", // Bedroom/sleep
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800", // Peaceful rest
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800", // Calm sleep
        "https://images.unsplash.com/photo-1444492871235-f1c06df6e554?w=800" // Relaxation
    };

    //general wellness-related image 
    private final String[] wellnessImages = {
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800", // Nature wellness
        "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=800", // Meditation
        "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800", // Mindfulness
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800" // Peaceful scene
    };

    // Array of all available health tip categories
    private final String[] categories = {"nutrition", "hydration", "fitness", "sleep", "wellness"};

    // Method to generate a single health tip with an appropriate image
    @SuppressWarnings("unchecked")
    public HealthTip generateHealthTipWithImage(String category) {
        // Initialize selected category with the input parameter
        String selectedCategory = category;
        // If category is null, empty, or "general", pick a random specific category instead
        if (category == null || category.isEmpty() || category.equalsIgnoreCase("general")) {
            selectedCategory = categories[random.nextInt(categories.length)];
        }

       
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + API_KEY;

        // Create the request body as a HashMap
        Map<String, Object> body = new HashMap<>();
        // Get current timestamp in milliseconds to ensure unique API responses
        long timestamp = System.currentTimeMillis();
        Map<String, String> textPart = new HashMap<>();
        
        // Get a category-specific prompt tailored for better AI responses
        String prompt = getCategoryPrompt(selectedCategory, timestamp);
        // Add the prompt to the text part
        textPart.put("text", prompt);

        // Wrap the text part in a parts array as required by Gemini API
        Map<String, Object> partWrapper = new HashMap<>();
        partWrapper.put("parts", List.of(textPart));

        // Add the wrapped parts to the request body under contents
        body.put("contents", List.of(partWrapper));

        // Create HTTP headers and set content type to JSON
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Create the HTTP request entity with body and headers
        HttpEntity<Map<String, Object>> request =
                new HttpEntity<>(body, headers);

        // Try-catch block to handle potential API errors gracefully
        try {
            // Send POST request to Gemini API and get response
            ResponseEntity<Map<String, Object>> response =
                    (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, request, Map.class);

            // Extract the first candidate from the response list
            Map<String, Object> candidate = (Map<String, Object>)((List<?>)response.getBody()
                    .get("candidates")).get(0);

            // Extract the content object from the candidate
            Map<String, Object> content = (Map<String, Object>)candidate.get("content");
            // Extract the first part from the content parts list
            Map<String, Object> part = (Map<String, Object>)((List<?>)content.get("parts")).get(0);

            // Convert the response text to a string
            String tipText = part.get("text").toString();
            // Get a random image URL matching the selected category
            String imageUrl = getImageByCategory(selectedCategory);

            // Return a new HealthTip object with the generated text, image, and category
            return new HealthTip(tipText, imageUrl, selectedCategory);
        } catch (Exception e) {
            // Log error message if API call fails
            System.err.println("Error generating health tip: " + e.getMessage());
            // Return a fallback health tip in case of API error
            return new HealthTip(
                "Stay hydrated! Drinking enough water helps your body function at its best.",
                hydrationImages[0],
                "hydration"
            );
        }
    }

    // Private helper method to generate category-specific prompts for the AI model
    private String getCategoryPrompt(String category, long timestamp) {
        return "Give 1 simple general health tip about " + category + ". Do not give medical advice. Request ID: " + timestamp;
    }

    // Private helper method to get a random image URL for a specific health tip category
    private String getImageByCategory(String category) {
        String[] images = switch (category.toLowerCase()) {
            // Return nutrition images array
            case "nutrition" -> nutritionImages;
            // Return hydration images array
            case "hydration" -> hydrationImages;
            // Return fitness images array
            case "fitness" -> fitnessImages;
            // Return sleep images array
            case "sleep" -> sleepImages;
            // Return wellness images array
            case "wellness" -> wellnessImages;
            // Return wellness images as default fallback
            default -> wellnessImages;
        };
        
        // Generate a random index within the bounds of the selected images array
        int index = random.nextInt(images.length);
        return images[index];
    }
    
}
