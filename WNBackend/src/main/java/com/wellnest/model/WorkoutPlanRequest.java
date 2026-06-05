package com.wellnest.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkoutPlanRequest {
    private Integer age;
    private String fitnessLevel;
    private Double height;
    private String gender;
    private Double weight;
    private String workoutFocus;
    private String equipment;
    private String healthConditions;
    private Integer sessionTime;
    private String planPeriod;
}
