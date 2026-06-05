# Build stage
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
# Use shell form so environment variables from Render are expanded and passed to the JVM
CMD ["sh", "-c", "java -Dspring.data.mongodb.uri=\"$SPRING_DATA_MONGODB_URI\" -jar app.jar"]
