package com.wellnest.model;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietPlanRequest {

    @NotBlank(message = "Dietary preference is required")
    private String dietaryPreference;

    @NotBlank(message = "Weight goal is required")
    private String weightGoal;

    private String planPeriod; // "day", "week", or "month"
    private String allergies;
    private String mealFrequency;
    private String cuisinePreference;
    private String mealPrepTime;

    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
}