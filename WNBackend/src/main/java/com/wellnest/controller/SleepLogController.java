package com.wellnest.controller;

import com.wellnest.model.SleepLog;
import com.wellnest.model.SleepLogRequest;
import com.wellnest.service.log.SleepLogService;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sleep")
@CrossOrigin(origins = "*")
public class SleepLogController {

    private final SleepLogService sleepLogService;

    public SleepLogController(SleepLogService sleepLogService) {
        this.sleepLogService = sleepLogService;
    }

    @PostMapping("/log")
    public ResponseEntity<Map<String, Object>> log(@Valid @RequestBody SleepLogRequest request) {
        SleepLog log = sleepLogService.log(request);

        Map<String, Object> result = new HashMap<>();
        result.put("data", log);
        result.put("message", "Sleep log recorded");
        return ResponseEntity.ok(result);
    }

    @GetMapping("/logs")
    public ResponseEntity<Map<String, Object>> logs(@RequestParam String email) {
        List<SleepLog> logs = sleepLogService.getLogs(email);

        Map<String, Object> result = new HashMap<>();
        result.put("data", logs);
        result.put("message", "Sleep logs retrieved");
        return ResponseEntity.ok(result);
    }
}
