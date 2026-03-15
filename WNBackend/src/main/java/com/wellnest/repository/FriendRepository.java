package com.wellnest.repository;

import com.wellnest.model.Friend;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends MongoRepository<Friend, String> {
    
    // Find all friends for a user (accepted friendships)
    List<Friend> findByUserEmailAndStatus(String userEmail, String status);
    List<Friend> findByFriendEmailAndStatus(String friendEmail, String status);
    
    // Find pending requests sent by a user
    List<Friend> findByUserEmailAndStatus(String userEmail);
    
    // Find pending requests received by a user
    List<Friend> findByFriendEmailAndStatus(String friendEmail);
    
    // Check if friendship or request already exists
    Optional<Friend> findByUserEmailAndFriendEmail(String userEmail, String friendEmail);
    
    // Delete friendship
    void deleteByUserEmailAndFriendEmail(String userEmail, String friendEmail);
}
