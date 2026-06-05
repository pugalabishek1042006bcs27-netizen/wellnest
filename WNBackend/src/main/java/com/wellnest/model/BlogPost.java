package com.wellnest.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "blog_posts")
public class BlogPost {
    
    @Id
    private String id;
    
    private String userEmail;
    private String username;
    private String title;
    private String content;
    private String category;
    private List<String> tags;
    private List<String> images;
    private String visibility; // "public" or "friends"
    private List<String> likes; // List of user emails who liked
    private List<Comment> comments;
    private LocalDateTime createdAt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Comment {
        private String author;
        private String authorEmail;
        private String text;
        private LocalDateTime timestamp;
    }
    
    public BlogPost(String userEmail, String username) {
        this.userEmail = userEmail;
        this.username = username;
        this.tags = new ArrayList<>();
        this.images = new ArrayList<>();
        this.likes = new ArrayList<>();
        this.comments = new ArrayList<>();
        this.createdAt = LocalDateTime.now();
    }
}
