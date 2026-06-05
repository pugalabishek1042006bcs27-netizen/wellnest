
package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "meal_logs")
public class MealLog {
    @Id
    private String id;

    @Indexed
    private String username;

    private String mealType;
    private String foodType;
    private String mealName;
    private Integer calories;
    private Integer protein;
    private Integer carbs;
    private Integer fats;
    private String notes;

    @Indexed
    private Instant timestamp;
}
