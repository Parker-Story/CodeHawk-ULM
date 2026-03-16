# -------- Build Stage --------
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

COPY . .

RUN mvn clean package -DskipTests

# -------- Run Stage --------
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN apt-get update && apt-get install -y python3 && rm -rf /var/lib/apt/lists/*

# Copy javac from build stage so student Java code can be compiled at runtime
COPY --from=build /opt/java/openjdk /opt/java/openjdk

COPY --from=build /app/target/*.jar app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]

# Install Python3 and javac (needed for student code execution)
RUN apt-get update && apt-get install -y python3 default-jdk && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/target/*.jar app.jar

CMD ["sh", "-c", "java -Dserver.port=${PORT} -jar app.jar"]