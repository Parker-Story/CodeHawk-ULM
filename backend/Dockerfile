# -------- Build Stage --------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

# -------- Run Stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

# Install Python3 for student code execution
RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

# Copy full JDK from build stage so student Java code can be compiled at runtime
COPY --from=build /opt/java/openjdk /opt/java/openjdk
ENV PATH="/opt/java/openjdk/bin:${PATH}"

COPY --from=build /app/target/*.jar app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]
