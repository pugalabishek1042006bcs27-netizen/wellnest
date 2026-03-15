package com.wellnest.controller;

import com.wellnest.model.BlogPost;
import com.wellnest.service.BlogPostService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/blog")
@CrossOrigin(origins = "*")
public class BlogPostController {

    private final BlogPostService blogPostService;

    public BlogPostController(BlogPostService blogPostService) {
        this.blogPostService = blogPostService;
    }

    // Create a new blog post
    @PostMapping("/posts")
    public ResponseEntity<BlogPost> createPost(@RequestBody BlogPost blogPost) {
        try {
            BlogPost createdPost = blogPostService.createPost(blogPost);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get all posts visible to a user
    @GetMapping("/posts")
    public ResponseEntity<List<BlogPost>> getPostsForUser(@RequestParam String userEmail) {
        try {
            List<BlogPost> posts = blogPostService.getPostsForUser(userEmail);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get posts by specific user
    @GetMapping("/posts/user/{userEmail}")
    public ResponseEntity<List<BlogPost>> getPostsByUser(@PathVariable String userEmail) {
        try {
            List<BlogPost> posts = blogPostService.getPostsByUser(userEmail);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get a single post by ID
    @GetMapping("/posts/{id}")
    public ResponseEntity<BlogPost> getPostById(@PathVariable String id) {
        Optional<BlogPost> post = blogPostService.getPostById(id);
        return post.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Toggle like on a post
    @PostMapping("/posts/{id}/like")
    public ResponseEntity<BlogPost> toggleLike(@PathVariable String id, @RequestBody Map<String, String> request) {
        try {
            String userEmail = request.get("userEmail");
            BlogPost updatedPost = blogPostService.toggleLike(id, userEmail);
            if (updatedPost != null) {
                return ResponseEntity.ok(updatedPost);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Add a comment to a post
    @PostMapping("/posts/{id}/comment")
    public ResponseEntity<BlogPost> addComment(@PathVariable String id, @RequestBody BlogPost.Comment comment) {
        try {
            BlogPost updatedPost = blogPostService.addComment(id, comment);
            if (updatedPost != null) {
                return ResponseEntity.ok(updatedPost);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a post
    @DeleteMapping("/posts/{id}")
    public ResponseEntity<Map<String, String>> deletePost(@PathVariable String id, @RequestParam String userEmail) {
        try {
            boolean deleted = blogPostService.deletePost(id, userEmail);
            if (deleted) {
                return ResponseEntity.ok(Map.of("message", "Post deleted successfully"));
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only delete your own posts"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
