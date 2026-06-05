package com.wellnest.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.ConnectionString;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.SimpleMongoClientDatabaseFactory;

@Configuration
public class MongoConfig {

    private static final Logger log = LoggerFactory.getLogger(MongoConfig.class);
    private static final String FALLBACK_URI = "mongodb://localhost:27017/wellnest";

    private String resolveUri() {
        String uri = System.getenv("SPRING_DATA_MONGODB_URI");
        if (uri == null || uri.isBlank()) {
            log.warn("SPRING_DATA_MONGODB_URI env var not found - falling back to localhost");
            return FALLBACK_URI;
        }
        log.info("MongoDB URI loaded from SPRING_DATA_MONGODB_URI env var");
        return uri.trim();
    }

    @Bean
    public MongoClient mongoClient() {
        return MongoClients.create(resolveUri());
    }

    @Bean
    public SimpleMongoClientDatabaseFactory mongoDbFactory(MongoClient mongoClient) {
        String uri = resolveUri();
        ConnectionString cs = new ConnectionString(uri);
        String database = cs.getDatabase();
        if (database == null || database.isBlank()) {
            database = "wellnest";
        }
        return new SimpleMongoClientDatabaseFactory(mongoClient, database);
    }

    @Bean
    public MongoTemplate mongoTemplate(SimpleMongoClientDatabaseFactory mongoDbFactory) {
        return new MongoTemplate(mongoDbFactory);
    }
}
