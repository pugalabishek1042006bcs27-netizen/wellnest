package com.wellnest.service.blog;

import com.wellnest.model.BlogPost;
import com.wellnest.repository.BlogPostRepository;
import com.wellnest.repository.FriendRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoriesService {

    private static final String STORY_CATEGORY = "story";
    private static final int STORY_TTL_HOURS = 24;

    private final BlogPostRepository blogPostRepository;
    private final FriendRepository friendRepository;

    public StoriesService(BlogPostRepository blogPostRepository, FriendRepository friendRepository) {
        this.blogPostRepository = blogPostRepository;
        this.friendRepository = friendRepository;
    }

    public BlogPost createStory(BlogPost storyPost) {
        storyPost.setCategory(STORY_CATEGORY);
        storyPost.setCreatedAt(LocalDateTime.now());

        if (storyPost.getTags() == null) {
            storyPost.setTags(new ArrayList<>());
        }
        if (storyPost.getImages() == null) {
            storyPost.setImages(new ArrayList<>());
        }
        if (storyPost.getLikes() == null) {
            storyPost.setLikes(new ArrayList<>());
        }
        if (storyPost.getComments() == null) {
            storyPost.setComments(new ArrayList<>());
        }

        return blogPostRepository.save(storyPost);
    }

    public List<BlogPost> getActiveStoriesForUser(String userEmail) {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(STORY_TTL_HOURS);

        List<String> friendEmails = friendRepository.findAll().stream()
            .filter(f -> "ACCEPTED".equals(f.getStatus()))
            .filter(f -> userEmail.equals(f.getUserEmail()) || userEmail.equals(f.getFriendEmail()))
            .map(f -> userEmail.equals(f.getUserEmail()) ? f.getFriendEmail() : f.getUserEmail())
            .collect(Collectors.toList());

        return blogPostRepository.findAllByOrderByCreatedAtDesc().stream()
            .filter(post -> STORY_CATEGORY.equalsIgnoreCase(post.getCategory()))
            .filter(post -> post.getCreatedAt() != null && !post.getCreatedAt().isBefore(cutoff))
            .filter(post ->
                userEmail.equals(post.getUserEmail()) ||
                "public".equals(post.getVisibility()) ||
                ("friends".equals(post.getVisibility()) && friendEmails.contains(post.getUserEmail()))
            )
            .collect(Collectors.toList());
    }

    public Optional<BlogPost> getStoryById(String storyId) {
        return blogPostRepository.findById(storyId)
            .filter(post -> STORY_CATEGORY.equalsIgnoreCase(post.getCategory()));
    }

    public boolean deleteStory(String storyId, String userEmail) {
        Optional<BlogPost> storyOpt = getStoryById(storyId);
        if (storyOpt.isPresent() && userEmail.equals(storyOpt.get().getUserEmail())) {
            blogPostRepository.deleteById(storyId);
            return true;
        }
        return false;
    }
}