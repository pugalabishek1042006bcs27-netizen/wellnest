package com.wellnest.service.blog;

import com.wellnest.model.BlogPost;
import com.wellnest.model.Friend;
import com.wellnest.repository.BlogPostRepository;
import com.wellnest.repository.FriendRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
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

        if (blogPost.getTags() == null) {
            blogPost.setTags(new ArrayList<>());
        }
        if (blogPost.getImages() == null) {
            blogPost.setImages(new ArrayList<>());
        }
        if (blogPost.getLikes() == null) {
            blogPost.setLikes(new ArrayList<>());
        }
        if (blogPost.getComments() == null) {
            blogPost.setComments(new ArrayList<>());
        }

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

    // Update a post (only editable by owner)
    public BlogPost updatePost(BlogPost existingPost, BlogPost updatedPost) {
        existingPost.setTitle(updatedPost.getTitle());
        existingPost.setContent(updatedPost.getContent());
        existingPost.setCategory(updatedPost.getCategory());
        existingPost.setVisibility(updatedPost.getVisibility());
        existingPost.setTags(updatedPost.getTags() != null ? updatedPost.getTags() : new ArrayList<>());
        existingPost.setImages(updatedPost.getImages() != null ? updatedPost.getImages() : new ArrayList<>());

        if (updatedPost.getUsername() != null && !updatedPost.getUsername().isBlank()) {
            existingPost.setUsername(updatedPost.getUsername());
        }

        return blogPostRepository.save(existingPost);
    }

    // Toggle like on a post
    public BlogPost toggleLike(String postId, String userEmail) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isPresent()) {
            BlogPost post = postOpt.get();
            List<String> likes = post.getLikes();

            if (likes == null) {
                likes = new ArrayList<>();
            }

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
            List<BlogPost.Comment> comments = post.getComments();
            if (comments == null) {
                comments = new ArrayList<>();
            }
            comments.add(comment);
            post.setComments(comments);
            return blogPostRepository.save(post);
        }
        return null;
    }

    // Edit a comment by index (only editable by comment author)
    public BlogPost editComment(String postId, int commentIndex, String userEmail, String text) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return null;
        }

        BlogPost post = postOpt.get();
        List<BlogPost.Comment> comments = post.getComments();
        if (comments == null || commentIndex < 0 || commentIndex >= comments.size()) {
            return null;
        }

        BlogPost.Comment existingComment = comments.get(commentIndex);
        if (!userEmail.equals(existingComment.getAuthorEmail())) {
            return null;
        }

        existingComment.setText(text);
        existingComment.setTimestamp(LocalDateTime.now());
        comments.set(commentIndex, existingComment);
        post.setComments(comments);
        return blogPostRepository.save(post);
    }

    // Delete a comment by index (comment author or post owner)
    public BlogPost deleteComment(String postId, int commentIndex, String userEmail) {
        Optional<BlogPost> postOpt = blogPostRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return null;
        }

        BlogPost post = postOpt.get();
        List<BlogPost.Comment> comments = post.getComments();
        if (comments == null || commentIndex < 0 || commentIndex >= comments.size()) {
            return null;
        }

        BlogPost.Comment existingComment = comments.get(commentIndex);
        boolean canDelete = userEmail.equals(existingComment.getAuthorEmail()) || userEmail.equals(post.getUserEmail());
        if (!canDelete) {
            return null;
        }

        comments.remove(commentIndex);
        post.setComments(comments);
        return blogPostRepository.save(post);
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