package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealNutritionEstimateResponse {
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fats;
}
