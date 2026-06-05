package com.wellnest.controller;

import com.wellnest.model.BlogPost;
import com.wellnest.service.blog.BlogPostService;
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

    // Update a post
    @PutMapping("/posts/{id}")
    public ResponseEntity<?> updatePost(@PathVariable String id, @RequestParam String userEmail, @RequestBody BlogPost blogPost) {
        try {
            Optional<BlogPost> existingPost = blogPostService.getPostById(id);
            if (existingPost.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            if (!existingPost.get().getUserEmail().equals(userEmail)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You can only edit your own posts"));
            }

            BlogPost updatedPost = blogPostService.updatePost(existingPost.get(), blogPost);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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

    // Edit a comment (only by comment author)
    @PutMapping("/posts/{id}/comments/{commentIndex}")
    public ResponseEntity<?> editComment(
            @PathVariable String id,
            @PathVariable int commentIndex,
            @RequestParam String userEmail,
            @RequestBody Map<String, String> request) {
        try {
            String text = request.get("text");
            if (text == null || text.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Comment text is required"));
            }

            BlogPost updatedPost = blogPostService.editComment(id, commentIndex, userEmail, text);
            if (updatedPost != null) {
                return ResponseEntity.ok(updatedPost);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You can only edit your own comments"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Delete a comment (comment author or post owner)
    @DeleteMapping("/posts/{id}/comments/{commentIndex}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String id,
            @PathVariable int commentIndex,
            @RequestParam String userEmail) {
        try {
            BlogPost updatedPost = blogPostService.deleteComment(id, commentIndex, userEmail);
            if (updatedPost != null) {
                return ResponseEntity.ok(updatedPost);
            }
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "You are not allowed to delete this comment"));
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
