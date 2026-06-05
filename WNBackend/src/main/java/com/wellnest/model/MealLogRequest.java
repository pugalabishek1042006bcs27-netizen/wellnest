//Data Transfer Object (DTO)
package com.wellnest.model;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MealLogRequest {
    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String mealType;

    @NotBlank
    private String foodType;

    @NotBlank
    private String mealName;

    @PositiveOrZero
    private Integer calories;

    @PositiveOrZero
    private Integer protein;

    @PositiveOrZero
    private Integer carbs;

    @PositiveOrZero
    private Integer fats;

    private String notes;

    private Instant timestamp;
}
