FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "-Dspring.data.mongodb.uri=mongodb+srv://pugalabishek1042006bcs27_db_user:uMiaY42tI5Ro3EgN@wellnest.6w8jzrw.mongodb.net/wellnest_new?appName=wellnest", "-Dspring.data.mongodb.database=wellnest_new", "app.jar"]