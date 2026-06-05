package com.wellnest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "friends")
public class Friend {
    
    @Id
    private String id;
    
    private String userEmail;
    private String friendEmail;
    private String status; // PENDING, ACCEPTED, REJECTED
    private LocalDateTime requestedAt;
    private LocalDateTime respondedAt;
    
    public Friend(String userEmail, String friendEmail, String status) {
        this.userEmail = userEmail;
        this.friendEmail = friendEmail;
        this.status = status;
        this.requestedAt = LocalDateTime.now();
    }
}
