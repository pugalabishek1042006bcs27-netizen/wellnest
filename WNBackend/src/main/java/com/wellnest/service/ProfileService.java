package com.wellnest.service; 

import com.wellnest.model.User; 
import com.wellnest.model.ProfileRequest; 
import com.wellnest.model.ProfileResponse; 
import com.wellnest.repository.UserRepository;
import org.springframework.stereotype.Service; 

import java.time.LocalDateTime; 
import java.util.Optional; 

@Service 
public class ProfileService { 

    private final UserRepository userRepository; 

    public ProfileService(UserRepository userRepository) { 
        this.userRepository = userRepository; 
    } 

    public ProfileResponse updateProfile(String email, ProfileRequest request) { // update profile data
        Optional<User> userOptional = userRepository.findByEmail(email); // lookup user by email
        if (userOptional.isEmpty()) { // handle missing user
            throw new RuntimeException("User not found"); 
        } 

        User user = userOptional.get(); // unwrap user
        user.setAge(request.getAge()); // update age
        if (request.getGender() != null && !request.getGender().isBlank()) {
            user.setGender(request.getGender()); // update gender if provided
        }
        user.setHeight(request.getHeight()); // update height
        user.setWeight(request.getWeight()); // update weight
        user.setActivityLevel(request.getActivityLevel()); // update activity level
        user.setRecentHealthIssues(request.getRecentHealthIssues()); // update recent issues
        user.setPastHealthIssues(request.getPastHealthIssues()); // update past issues
        if (request.getCurrentDietPlan() != null) { // update diet plan if provided
            user.setCurrentDietPlan(request.getCurrentDietPlan());
        }
        if (request.getCurrentWorkoutPlan() != null) { // update workout plan if provided
            user.setCurrentWorkoutPlan(request.getCurrentWorkoutPlan());
        }
        user.setProfileCompleted(true); // mark profile complete
        user.setUpdatedAt(LocalDateTime.now()); // set update timestamp

        userRepository.save(user); // persist changes
        return convertToProfileResponse(user); // return response model
    } 

    public ProfileResponse getProfile(String email) { // retrieve profile data
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) { 
            throw new RuntimeException("User not found"); 
        } 
        return convertToProfileResponse(userOptional.get()); 
    } 

    public void deleteDietPlan(String email) { // delete diet plan
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setCurrentDietPlan(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void deleteWorkoutPlan(String email) { // delete workout plan
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setCurrentWorkoutPlan(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public void resetAccount(String email) { // reset user profile and tracker history
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        user.setAge(null);
        user.setHeight(null);
        user.setWeight(null);
        user.setActivityLevel(null);
        user.setRecentHealthIssues(null);
        user.setPastHealthIssues(null);
        user.setCurrentDietPlan(null);
        user.setCurrentWorkoutPlan(null);
        user.setGoals(null);
        user.setWaterIntakeLogs(null);
        user.setWorkoutLogs(null);
        user.setSleepLogs(null);
        user.setMealLogs(null);
        user.setProfileCompleted(false);
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
    }

    private ProfileResponse convertToProfileResponse(User user) { // map user to response
        ProfileResponse response = new ProfileResponse(); // create response
        response.setId(user.getId()); 
        response.setFullName(user.getFullName()); 
        response.setEmail(user.getEmail()); 
        response.setAge(user.getAge()); 
        response.setGender(user.getGender()); 
        response.setHeight(user.getHeight());
        response.setWeight(user.getWeight()); 
        response.setActivityLevel(user.getActivityLevel()); 
        response.setRecentHealthIssues(user.getRecentHealthIssues());
        response.setPastHealthIssues(user.getPastHealthIssues());
        response.setProfileCompleted(user.getProfileCompleted()); // map completion flag
        response.setCurrentDietPlan(user.getCurrentDietPlan()); // map diet plan
        response.setCurrentWorkoutPlan(user.getCurrentWorkoutPlan()); // map workout plan
        return response; 
    } 
} 
