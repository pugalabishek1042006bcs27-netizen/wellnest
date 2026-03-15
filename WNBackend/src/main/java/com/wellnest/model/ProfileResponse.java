package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private String id;
    private String fullName;
    private String email;
    private Integer age;
    private String gender;
    private Double height;
    private Double weight;
    private String activityLevel;
    private List<String> recentHealthIssues;
    private List<String> pastHealthIssues;
    private Boolean profileCompleted;
    private DietPlan currentDietPlan;
    private WorkoutPlan currentWorkoutPlan;
}
