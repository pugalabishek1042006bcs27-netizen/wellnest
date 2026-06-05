package com.wellnest.service.log;

import com.wellnest.model.User;
import com.wellnest.model.WaterIntakeLog;
import com.wellnest.model.WaterIntakeRequest;
import com.wellnest.repository.UserRepository;
import com.wellnest.repository.WaterIntakeLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class WaterIntakeService {

    private final WaterIntakeLogRepository waterIntakeLogRepository;
    private final UserRepository userRepository;

    public WaterIntakeService(WaterIntakeLogRepository waterIntakeLogRepository, UserRepository userRepository) {
        this.waterIntakeLogRepository = waterIntakeLogRepository;
        this.userRepository = userRepository;
    }

    public WaterIntakeLog log(WaterIntakeRequest request) {
        String username = getUsernameByEmail(request.getEmail());
        WaterIntakeLog log = new WaterIntakeLog(
            null,
            username,
            request.getLiters(),
            request.getCups(),
            request.getTimestamp() != null ? request.getTimestamp() : Instant.now()
        );
        return waterIntakeLogRepository.save(log);
    }

    public List<WaterIntakeLog> getLogs(String email) {
        String username = getUsernameByEmail(email);
        return waterIntakeLogRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public void delete(String id) {
        waterIntakeLogRepository.deleteById(id);
    }

    private String getUsernameByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        String username = user.getUsername();
        if (username == null || username.isBlank()) {
            throw new RuntimeException("Username not set");
        }
        return username;
    }
}