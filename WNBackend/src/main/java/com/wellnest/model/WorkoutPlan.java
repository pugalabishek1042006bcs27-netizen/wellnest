package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlan {
    private String plan;
    private LocalDateTime createdAt;
    private Map<String, Object> preferences;
}
