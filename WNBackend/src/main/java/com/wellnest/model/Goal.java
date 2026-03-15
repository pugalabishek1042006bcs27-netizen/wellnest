package com.wellnest.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Goal {
    
    @JsonProperty("id")
    private Long id;
    
    @JsonProperty("type")
    private String type; // fitness, nutrition, hydration, sleep
    
    @JsonProperty("icon")
    private String icon;
    
    @JsonProperty("name")
    private String name;
    
    @JsonProperty("target")
    private double target;
    
    @JsonProperty("unit")
    private String unit;
    
    @JsonProperty("actual")
    private double actual;
}
