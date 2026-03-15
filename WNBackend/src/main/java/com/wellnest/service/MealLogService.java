package com.wellnest.service;

import com.wellnest.model.MealLog;
import com.wellnest.model.MealLogRequest;
import com.wellnest.model.MealNutritionEstimateResponse;
import com.wellnest.model.User;
import com.wellnest.repository.MealLogRepository;
import com.wellnest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class MealLogService {

    private final MealLogRepository mealLogRepository;
    private final UserRepository userRepository;
    private final MealNutritionGeminiService mealNutritionGeminiService;

    public MealLogService(MealLogRepository mealLogRepository, UserRepository userRepository, MealNutritionGeminiService mealNutritionGeminiService) {
        this.mealLogRepository = mealLogRepository;
        this.userRepository = userRepository;
        this.mealNutritionGeminiService = mealNutritionGeminiService;
    }

    public MealLog log(MealLogRequest request) {
        String username = getUsernameByEmail(request.getEmail());

        Integer calories = request.getCalories();
        Integer protein = request.getProtein();
        Integer carbs = request.getCarbs();
        Integer fats = request.getFats();

        if (needsEstimate(calories, protein, carbs, fats)) {
            MealNutritionEstimateResponse estimate = mealNutritionGeminiService.estimateNutrition(request.getMealName(), request.getFoodType());
            calories = estimate.getCalories();
            protein = estimate.getProtein();
            carbs = estimate.getCarbs();
            fats = estimate.getFats();
        }

        MealLog log = new MealLog(
            null,
            username,
            request.getMealType(),
            request.getFoodType(),
            request.getMealName(),
            calories,
            protein,
            carbs,
            fats,
            request.getNotes(),
            request.getTimestamp() != null ? request.getTimestamp() : Instant.now()
        );
        return mealLogRepository.save(log);//saves the log to database
    }

    public MealNutritionEstimateResponse estimateNutrition(String mealName, String foodType) {
        return mealNutritionGeminiService.estimateNutrition(mealName, foodType);
    }

    public List<MealLog> getLogs(String email) {
        String username = getUsernameByEmail(email);
        return mealLogRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public void delete(String email, String id) {
        String username = getUsernameByEmail(email);
        MealLog log = mealLogRepository.findByIdAndUsername(id, username)
            .orElseThrow(() -> new RuntimeException("Meal log not found"));
        mealLogRepository.delete(log);
    }

    private boolean needsEstimate(Integer calories, Integer protein, Integer carbs, Integer fats) {
        return calories == null || calories <= 0 || protein == null || carbs == null || fats == null;
    }

    private String getUsernameByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        String username = user.getUsername();
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username not set");
        }
        return username;
    }
}
