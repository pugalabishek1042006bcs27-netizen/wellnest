package com.wellnest.service;

import com.wellnest.model.Friend;
import com.wellnest.model.User;
import com.wellnest.repository.FriendRepository;
import com.wellnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public FriendService(FriendRepository friendRepository, UserRepository userRepository, EmailService emailService) {
        this.friendRepository = friendRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // Search for users by name or email
    public List<Map<String, String>> searchUsers(String userEmail, String query) {
        List<User> allUsers = userRepository.findAll();
        
        // Filter users matching the query and exclude the current user
        List<User> matchedUsers = allUsers.stream()
            .filter(user -> !user.getEmail().equals(userEmail))
            .filter(user -> 
                user.getFullName().toLowerCase().contains(query.toLowerCase()) ||
                user.getEmail().toLowerCase().contains(query.toLowerCase())
            )
            .limit(20) // Limit results to 20
            .collect(Collectors.toList());

        // Get existing friendships and pending requests to filter them out
        List<Friend> existingRelations = friendRepository.findAll().stream()
            .filter(f -> 
                (f.getUserEmail().equals(userEmail) || f.getFriendEmail().equals(userEmail)) &&
                (f.getStatus().equals("ACCEPTED") || f.getStatus().equals("PENDING"))
            )
            .collect(Collectors.toList());

        List<String> excludeEmails = existingRelations.stream()
            .map(f -> f.getUserEmail().equals(userEmail) ? f.getFriendEmail() : f.getUserEmail())
            .collect(Collectors.toList());

        // Return users that are not already friends or have pending requests
        return matchedUsers.stream()
            .filter(user -> !excludeEmails.contains(user.getEmail()))
            .map(user -> {
                Map<String, String> userInfo = new HashMap<>();
                userInfo.put("email", user.getEmail());
                userInfo.put("fullName", user.getFullName());
                return userInfo;
            })
            .collect(Collectors.toList());
    }

    // Send friend request
    public void sendFriendRequest(String userEmail, String friendEmail) {
        if (userEmail.equals(friendEmail)) {
            throw new IllegalArgumentException("Cannot send friend request to yourself");
        }

        // Ensure sender exists so we can include proper identity in the notification.
        Optional<User> requesterUser = userRepository.findByEmail(userEmail);
        if (requesterUser.isEmpty()) {
            throw new IllegalArgumentException("Requesting user not found");
        }

        // Check if user exists
        Optional<User> friendUser = userRepository.findByEmail(friendEmail);
        if (friendUser.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        // Check if relationship already exists
        Optional<Friend> existingRequest = friendRepository.findByUserEmailAndFriendEmail(userEmail, friendEmail);
        Optional<Friend> reverseRequest = friendRepository.findByUserEmailAndFriendEmail(friendEmail, userEmail);

        if (existingRequest.isPresent() || reverseRequest.isPresent()) {
            throw new IllegalArgumentException("Friend request already sent or friendship already exists");
        }

        Friend friendRequest = new Friend(userEmail, friendEmail, "PENDING");
        friendRepository.save(friendRequest);

        User requester = requesterUser.get();
        emailService.sendFriendRequestEmail(
            friendEmail,
            requester.getFullName() != null ? requester.getFullName() : requester.getEmail(),
            requester.getEmail()
        );
    }

    // Accept friend request
    @Transactional
    public void acceptFriendRequest(String userEmail, String friendEmail) {
        Optional<Friend> requestOptional = friendRepository.findByUserEmailAndFriendEmail(friendEmail, userEmail);
        
        if (requestOptional.isEmpty() || !requestOptional.get().getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Friend request not found");
        }

        Friend request = requestOptional.get();
        request.setStatus("ACCEPTED");
        request.setRespondedAt(LocalDateTime.now());
        friendRepository.save(request);

        // Create reverse friendship for bidirectional access
        Friend reverseFriendship = new Friend(userEmail, friendEmail, "ACCEPTED");
        reverseFriendship.setRequestedAt(request.getRequestedAt());
        reverseFriendship.setRespondedAt(LocalDateTime.now());
        friendRepository.save(reverseFriendship);
    }

    // Reject friend request
    public void rejectFriendRequest(String userEmail, String friendEmail) {
        Optional<Friend> requestOptional = friendRepository.findByUserEmailAndFriendEmail(friendEmail, userEmail);
        
        if (requestOptional.isEmpty() || !requestOptional.get().getStatus().equals("PENDING")) {
            throw new IllegalArgumentException("Friend request not found");
        }

        Friend request = requestOptional.get();
        request.setStatus("REJECTED");
        request.setRespondedAt(LocalDateTime.now());
        friendRepository.save(request);
    }

    // Remove friend
    @Transactional
    public void removeFriend(String userEmail, String friendEmail) {
        friendRepository.deleteByUserEmailAndFriendEmail(userEmail, friendEmail);
        friendRepository.deleteByUserEmailAndFriendEmail(friendEmail, userEmail);
    }

    // Get list of friends
    public List<Map<String, String>> getFriends(String userEmail) {
        List<Friend> friendships = friendRepository.findByUserEmailAndStatus(userEmail, "ACCEPTED");
        
        return friendships.stream()
            .map(friendship -> {
                Optional<User> friendUser = userRepository.findByEmail(friendship.getFriendEmail());
                if (friendUser.isPresent()) {
                    Map<String, String> friendInfo = new HashMap<>();
                    friendInfo.put("email", friendUser.get().getEmail());
                    friendInfo.put("fullName", friendUser.get().getFullName());
                    return friendInfo;
                }
                return null;
            })
            .filter(info -> info != null)
            .collect(Collectors.toList());
    }

    // Get pending friend requests received
    public List<Map<String, String>> getFriendRequests(String userEmail) {
        List<Friend> requests = friendRepository.findByFriendEmailAndStatus(userEmail, "PENDING");
        
        return requests.stream()
            .map(request -> {
                Optional<User> requesterUser = userRepository.findByEmail(request.getUserEmail());
                if (requesterUser.isPresent()) {
                    Map<String, String> requesterInfo = new HashMap<>();
                    requesterInfo.put("email", requesterUser.get().getEmail());
                    requesterInfo.put("fullName", requesterUser.get().getFullName());
                    return requesterInfo;
                }
                return null;
            })
            .filter(info -> info != null)
            .collect(Collectors.toList());
    }

    // Get sent friend requests
    public List<Map<String, String>> getSentRequests(String userEmail) {
        List<Friend> sentRequests = friendRepository.findByUserEmailAndStatus(userEmail, "PENDING");
        
        return sentRequests.stream()
            .map(request -> {
                Optional<User> friendUser = userRepository.findByEmail(request.getFriendEmail());
                if (friendUser.isPresent()) {
                    Map<String, String> friendInfo = new HashMap<>();
                    friendInfo.put("email", friendUser.get().getEmail());
                    friendInfo.put("fullName", friendUser.get().getFullName());
                    return friendInfo;
                }
                return null;
            })
            .filter(info -> info != null)
            .collect(Collectors.toList());
    }
}
