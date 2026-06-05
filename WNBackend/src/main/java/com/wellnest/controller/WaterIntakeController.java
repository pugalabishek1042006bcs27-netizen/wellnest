package com.wellnest.controller;

import com.wellnest.model.WaterIntakeLog;
import com.wellnest.model.WaterIntakeRequest;
import com.wellnest.service.log.WaterIntakeService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/water-intake")
@CrossOrigin(origins = "*")
public class WaterIntakeController {

    private final WaterIntakeService waterIntakeService;

    public WaterIntakeController(WaterIntakeService waterIntakeService) {
        this.waterIntakeService = waterIntakeService;
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> log(@Valid @RequestBody WaterIntakeRequest request) {
        WaterIntakeLog log = waterIntakeService.log(request);

        Map<String, Object> result = new HashMap<>();
        result.put("data", log);
        result.put("message", "Water intake logged");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> logs(@RequestParam String email) {
        List<WaterIntakeLog> logs = waterIntakeService.getLogs(email);

        Map<String, Object> result = new HashMap<>();
        result.put("data", logs);
        result.put("message", "Water intake logs retrieved");
        return ResponseEntity.ok(result);
    }
}
