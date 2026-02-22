# -------- Build Stage --------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy backend project files
COPY . .

# Build the Spring Boot jar
RUN mvn clean package -DskipTests

# -------- Run Stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the built jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Run the app on Render's provided PORT
CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
