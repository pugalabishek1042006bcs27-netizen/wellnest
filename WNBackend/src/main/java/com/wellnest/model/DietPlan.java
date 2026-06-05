package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DietPlan {
    private String plan;
    private String period; // "day", "week", or "month"
    private LocalDateTime createdAt;
    private Map<String, Object> preferences;
}
