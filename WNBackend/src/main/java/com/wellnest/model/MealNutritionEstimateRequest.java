package com.wellnest.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealNutritionEstimateRequest {
    @NotBlank
    private String mealName;

    private String foodType;
}
