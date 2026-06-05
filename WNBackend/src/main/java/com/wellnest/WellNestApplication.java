package com.wellnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@ComponentScan(basePackages = "com.wellnest")
@EnableMongoRepositories(basePackages = "com.wellnest.repository")
public class WellNestApplication {

	public static void main(String[] args) {
		SpringApplication.run(WellNestApplication.class, args);
	}

}