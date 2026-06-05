package com.wellnest.service.log;

import com.wellnest.model.SleepLog;
import com.wellnest.model.SleepLogRequest;
import com.wellnest.model.User;
import com.wellnest.repository.SleepLogRepository;
import com.wellnest.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class SleepLogService {

    private final SleepLogRepository sleepLogRepository;
    private final UserRepository userRepository;

    public SleepLogService(SleepLogRepository sleepLogRepository, UserRepository userRepository) {
        this.sleepLogRepository = sleepLogRepository;
        this.userRepository = userRepository;
    }

    public SleepLog log(SleepLogRequest request) {
        String username = getUsernameByEmail(request.getEmail());
        SleepLog log = new SleepLog(
            null,
            username,
            request.getDurationHours(),
            request.getNotes(),
            request.getTimestamp() != null ? request.getTimestamp() : Instant.now()
        );
        return sleepLogRepository.save(log);
    }

    public List<SleepLog> getLogs(String email) {
        String username = getUsernameByEmail(email);
        return sleepLogRepository.findByUsernameOrderByTimestampDesc(username);
    }

    public void delete(String id) {
        sleepLogRepository.deleteById(id);
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
