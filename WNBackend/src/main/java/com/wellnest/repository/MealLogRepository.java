package com.wellnest.repository;

import com.wellnest.model.MealLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MealLogRepository extends MongoRepository<MealLog, String> {
    List<MealLog> findByUsernameOrderByTimestampDesc(String username);
    Optional<MealLog> findByIdAndUsername(String id, String username);
}
