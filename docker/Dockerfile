# 构建阶段
FROM maven:3.8.5-openjdk-17-slim AS build
WORKDIR /app

# 首先复制父POM文件
COPY pom.xml .

# 创建子模块目录并复制子模块的pom.xml
RUN mkdir -p dutch-vocab-backend
COPY dutch-vocab-backend/pom.xml ./dutch-vocab-backend/

# 下载依赖项（利用 Docker 缓存机制）
RUN mvn dependency:go-offline -pl dutch-vocab-backend

# 复制源代码并构建应用
COPY dutch-vocab-backend/src ./dutch-vocab-backend/src
RUN mvn clean package -DskipTests -pl dutch-vocab-backend

# 运行阶段
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# 添加一个非 root 用户来运行应用
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# 复制构建好的 JAR 文件
COPY --from=build --chown=spring:spring /app/dutch-vocab-backend/target/*.jar app.jar

# 设置环境变量
ENV SPRING_PROFILES_ACTIVE=prod

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-jar", "app.jar"]