# 构建阶段
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app

# 复制 pom.xml 并下载依赖项（利用 Docker 缓存机制）
COPY dutch-vocab-backend/pom.xml .
RUN mvn dependency:go-offline

# 复制源代码并构建应用
COPY dutch-vocab-backend/src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 添加一个非 root 用户来运行应用
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 复制构建好的 JAR 文件
COPY --from=build --chown=spring:spring /app/target/*.jar app.jar

# 设置环境变量
ENV SPRING_PROFILES_ACTIVE=prod

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]