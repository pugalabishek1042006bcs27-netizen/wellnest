package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {
    private Integer age;
    private String gender;
    private Double height; // in cm
    private Double weight; // in kg
    private String activityLevel;
    private List<String> recentHealthIssues;
    private List<String> pastHealthIssues;
    private DietPlan currentDietPlan;
    private WorkoutPlan currentWorkoutPlan;
}
