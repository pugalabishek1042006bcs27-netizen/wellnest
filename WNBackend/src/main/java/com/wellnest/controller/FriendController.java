package com.wellnest.controller;

import com.wellnest.service.FriendService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/friends")
@CrossOrigin(origins = "http://localhost:5173")
public class FriendController {

    @Autowired
    private FriendService friendService;

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String email, @RequestParam String query) {
        try {
            List<Map<String, String>> results = friendService.searchUsers(email, query);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", results);
            response.put("message", "Search completed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error searching users: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendFriendRequest(@RequestParam String email, @RequestParam String friendEmail) {
        try {
            friendService.sendFriendRequest(email, friendEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Friend request sent successfully");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error sending friend request: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/accept")
    public ResponseEntity<?> acceptFriendRequest(@RequestParam String email, @RequestParam String friendEmail) {
        try {
            friendService.acceptFriendRequest(email, friendEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Friend request accepted");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error accepting friend request: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/reject")
    public ResponseEntity<?> rejectFriendRequest(@RequestParam String email, @RequestParam String friendEmail) {
        try {
            friendService.rejectFriendRequest(email, friendEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Friend request rejected");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error rejecting friend request: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @DeleteMapping("/remove")
    public ResponseEntity<?> removeFriend(@RequestParam String email, @RequestParam String friendEmail) {
        try {
            friendService.removeFriend(email, friendEmail);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Friend removed successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error removing friend: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/list")
    public ResponseEntity<?> getFriends(@RequestParam String email) {
        try {
            List<Map<String, String>> friends = friendService.getFriends(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", friends);
            response.put("message", "Friends list retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error retrieving friends: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<?> getFriendRequests(@RequestParam String email) {
        try {
            List<Map<String, String>> requests = friendService.getFriendRequests(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", requests);
            response.put("message", "Friend requests retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error retrieving friend requests: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/sent")
    public ResponseEntity<?> getSentRequests(@RequestParam String email) {
        try {
            List<Map<String, String>> sentRequests = friendService.getSentRequests(email);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", sentRequests);
            response.put("message", "Sent requests retrieved successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("message", "Error retrieving sent requests: " + e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
