package com.wellnest.service.log;

import com.wellnest.model.User;
import com.wellnest.model.WorkoutLog;
import com.wellnest.model.WorkoutLogRequest;
import com.wellnest.repository.UserRepository;
import com.wellnest.repository.WorkoutLogRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class WorkoutLogService {

    private final WorkoutLogRepository workoutLogRepository;
    private final UserRepository userRepository;

    public WorkoutLogService(WorkoutLogRepository workoutLogRepository, UserRepository userRepository) {
        this.workoutLogRepository = workoutLogRepository;
        this.userRepository = userRepository;
    }

    public WorkoutLog log(WorkoutLogRequest request) {
        String username = getUsernameByEmail(request.getEmail());
        WorkoutLog log = new WorkoutLog(
            null,
            username,
            request.getExerciseType(),
            request.getDurationMinutes(),
            request.getCalories(),
            request.getTimestamp() != null ? request.getTimestamp() : Instant.now()
        );
        return workoutLogRepository.save(log);
    }

    public List<WorkoutLog> getLogs(String email) {
        String username = getUsernameByEmail(email);
        return workoutLogRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public void delete(String id) {
        workoutLogRepository.deleteById(id);
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
