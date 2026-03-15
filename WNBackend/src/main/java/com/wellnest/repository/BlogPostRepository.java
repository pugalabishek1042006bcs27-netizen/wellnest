package com.wellnest.repository;

import com.wellnest.model.BlogPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogPostRepository extends MongoRepository<BlogPost, String> {
    
    List<BlogPost> findByUserEmailOrderByCreatedAtDesc(String userEmail);
    
    List<BlogPost> findByVisibilityOrderByCreatedAtDesc(String visibility);
    
    List<BlogPost> findAllByOrderByCreatedAtDesc();
}
