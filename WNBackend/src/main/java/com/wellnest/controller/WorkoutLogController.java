package com.wellnest.controller;

import com.wellnest.model.WorkoutLog;
import com.wellnest.model.WorkoutLogRequest;
import com.wellnest.service.log.WorkoutLogService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workouts")
@CrossOrigin(origins = "*")
public class WorkoutLogController {

    private final WorkoutLogService workoutLogService;

    public WorkoutLogController(WorkoutLogService workoutLogService) {
        this.workoutLogService = workoutLogService;
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> log(@Valid @RequestBody WorkoutLogRequest request) {
        WorkoutLog log = workoutLogService.log(request);

        Map<String, Object> result = new HashMap<>();
        result.put("data", log);
        result.put("message", "Workout logged");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> logs(@RequestParam String email) {
        List<WorkoutLog> logs = workoutLogService.getLogs(email);

        Map<String, Object> result = new HashMap<>();
        result.put("data", logs);
        result.put("message", "Workout logs retrieved");
        return ResponseEntity.ok(result);
    }
}
