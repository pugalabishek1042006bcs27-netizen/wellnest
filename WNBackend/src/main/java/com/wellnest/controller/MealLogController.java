package com.wellnest.controller;

import com.wellnest.model.MealLog;
import com.wellnest.model.MealLogRequest;
import com.wellnest.model.MealNutritionEstimateRequest;
import com.wellnest.model.MealNutritionEstimateResponse;
import com.wellnest.service.MealLogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/meals")
@CrossOrigin(origins = "*")
public class MealLogController {

    private final MealLogService mealLogService;

    public MealLogController(MealLogService mealLogService) {
        this.mealLogService = mealLogService;
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> log(@Valid @RequestBody MealLogRequest request) {
        MealLog log = mealLogService.log(request);

        Map<String, Object> result = new HashMap<>();
        result.put("data", log);
        result.put("message", "Meal logged");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> logs(@RequestParam String email) {
        List<MealLog> logs = mealLogService.getLogs(email);

        Map<String, Object> result = new HashMap<>();
        result.put("data", logs);
        result.put("message", "Meal logs retrieved");
        return ResponseEntity.ok(result);
    }

    @PostMapping("/estimate")
    public ResponseEntity<Map<String, Object>> estimate(@Valid @RequestBody MealNutritionEstimateRequest request) {
        MealNutritionEstimateResponse estimate = mealLogService.estimateNutrition(request.getMealName(), request.getFoodType());

        Map<String, Object> result = new HashMap<>();
        result.put("data", estimate);
        result.put("message", "Meal nutrition estimated");
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/logs/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable String id, @RequestParam String email) {
        mealLogService.delete(email, id);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Meal log deleted");
        return ResponseEntity.ok(result);
    }
}
