package com.wellnest.service;

import com.wellnest.model.BlogPost;
import com.wellnest.model.Friend;
import com.wellnest.repository.BlogPostRepository;
import com.wellnest.repository.FriendRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class BlogPostService {

    private final BlogPostRepository blogPostRepository;
    private final FriendRepository friendRepository;

    public BlogPostService(BlogPostRepository blogPostRepository, FriendRepository friendRepository) {
        this.blogPostRepository = blogPostRepository;
        this.friendRepository = friendRepository;
    }

    // Create a new blog post
    public BlogPost createPost(BlogPost blogPost) {
        blogPost.setCreatedAt(LocalDateTime.now());
        return blogPostRepository.save(blogPost);
    }

    // Get all posts visible to a user (public posts + friends' posts)
    public List<BlogPost> getPostsForUser(String userEmail) {
        // Get all posts
        List<BlogPost> allPosts = blogPostRepository.findAllByOrderByCreatedAtDesc();
        
        // Get user's friend emails (accepted friends only)
        List<String> friendEmails = friendRepository.findAll().stream()
            .filter(f -> f.getStatus().equals("ACCEPTED"))
            .filter(f -> f.getUserEmail().equals(userEmail) || f.getFriendEmail().equals(userEmail))
            .map(f -> f.getUserEmail().equals(userEmail) ? f.getFriendEmail() : f.getUserEmail())
            .collect(Collectors.toList());
        
        // Filter posts: own posts + public posts + friends' posts
        return allPosts.stream()
            .filter(post -> 
                post.getUserEmail().equals(userEmail) || // User's own posts
                post.getVisibility().equals("public") || // Public posts
                (post.getVisibility().equals("friends") && friendEmails.contains(post.getUserEmail())) // Friends' posts
            )
            .collect(Collectors.toList());
    }

    // Get posts by user email
    public List<BlogPost> getPostsByUser(String userEmail) {
        return blogPostRepository.findByUserEmailOrderByCreatedAtDesc(userEmail);
    }

    // Get a single post by ID
    public Optional<BlogPost> getPostById(String id) {
        return blogPostRepository.findById(id);
    }

    // Toggle like on a post
    public BlogPost toggleLike(String postId, String userEmail) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            List<String> likes = post.getLikes();
            
            if (likes.contains(userEmail)) {
                likes.remove(userEmail);
            } else {
                likes.add(userEmail);
            }
            
            post.setLikes(likes);
            return blogPostRepository.save(post);
        }
        return null;
    }

    // Add a comment to a post
    public BlogPost addComment(String postId, BlogPost.Comment comment) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            comment.setTimestamp(LocalDateTime.now());
            post.getComments().add(comment);
            return blogPostRepository.save(post);
        }
        return null;
    }

    // Delete a post (only by owner)
    public boolean deletePost(String postId, String userEmail) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isPresent() && postOpt.get().getUserEmail().equals(userEmail)) {
            blogPostRepository.deleteById(postId);
            return true;
        }
        return false;
    }
}
