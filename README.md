# Dutch Vocabulary App - Docker Deployment Guide

本指南提供了如何使用Docker部署Dutch Vocabulary应用程序的详细说明，包括本地开发环境和生产环境部署。

## 目录

- [前提条件](#前提条件)
- [项目结构](#项目结构)
- [本地开发](#本地开发)
- [生产部署](#生产部署)
  - [Render部署](#render部署)
  - [其他云平台部署](#其他云平台部署)
- [环境变量](#环境变量)
- [常见问题](#常见问题)

## 前提条件

确保你的系统已安装以下软件：

- Docker (20.10+)
- Docker Compose (2.0+)
- Git
- Java 17 (仅用于本地开发，Docker中已包含)
- Maven (仅用于本地开发，Docker中已包含)

## 项目结构

```
dutch-vocab-app/
├── src/                    # 后端源代码
├── dutch-vocab-frondend/   # 前端源代码
├── Dockerfile              # Docker构建文件
├── docker-compose.yml      # Docker Compose配置
├── .dockerignore           # Docker忽略文件
└── README.md               # 本文档
```

## 本地开发

### 1. 克隆仓库

```bash
git clone <repository-url>
cd dutch-vocab-app
```

### 2. 启动本地开发环境

```bash
docker-compose up
```

这将启动：
- Spring Boot应用 (http://localhost:8080)
- MongoDB数据库 (localhost:27017)

### 3. 访问应用

- API: http://localhost:8080
- 前端: 打开dutch-vocab-frondend/index.html文件

### 4. 停止开发环境

```bash
docker-compose down
```

如果你想删除所有数据（包括MongoDB数据卷）：

```bash
docker-compose down -v
```

## 生产部署

### Render部署

#### 使用Render Blueprint（推荐）

项目已配置Render Blueprint，可以一键部署整个应用：

1. 确保你的代码已推送到GitHub/GitLab仓库
2. 登录[Render](https://render.com/)
3. 点击"New +"，选择"Blueprint"
4. 连接你的GitHub/GitLab仓库
5. Render会自动检测`render.yaml`文件并创建所有必要的服务

#### 配置环境变量

部署过程中，Render会提示你设置以下环境变量：
- `SPRING_DATA_MONGODB_URI`: MongoDB连接URI（格式：`mongodb+srv://username:password@cluster.mongodb.net/dutch_vocab`）
- `SPRING_PROFILES_ACTIVE`: 设置为`prod`

#### 手动部署（替代方案）

如果你不想使用Blueprint，也可以手动部署：

##### 1. 创建Web Service

1. 登录[Render](https://render.com/)
2. 点击"New +"，选择"Web Service"
3. 连接你的GitHub/GitLab仓库
4. 配置服务：
   - **Name**: `dutch-vocab-api`
   - **Environment**: `Docker`
   - **Region**: 选择离用户最近的区域
   - **Branch**: `main`（或你的主分支）

##### 2. 配置环境变量

添加以下环境变量：
- `SPRING_DATA_MONGODB_URI`: MongoDB连接URI
- `SPRING_PROFILES_ACTIVE`: `prod`

##### 3. 部署前端

1. 点击"New +"，选择"Static Site"
2. 连接你的GitHub/GitLab仓库
3. 配置：
   - **Name**: `dutch-vocab-frontend`
   - **Publish directory**: `dutch-vocab-frontend`

### 其他云平台部署

本应用的Docker配置适用于大多数支持Docker的云平台，包括：

- AWS Elastic Beanstalk
- Google Cloud Run
- Azure App Service
- Heroku (使用Container Registry)
- DigitalOcean App Platform

## 环境变量

### 开发环境变量

在`docker-compose.yml`中设置：

- `MONGO_USERNAME`: MongoDB用户名（默认：admin）
- `MONGO_PASSWORD`: MongoDB密码（默认：password）
- `SPRING_PROFILES_ACTIVE`: 应用程序配置文件（默认：dev）

### 生产环境变量

在部署平台上设置：

- `SPRING_DATA_MONGODB_URI`: MongoDB连接URI（格式：`mongodb+srv://username:password@cluster.mongodb.net/dutch_vocab`）
- `SPRING_PROFILES_ACTIVE`: 应用程序配置文件（设为prod）
- `PORT`: 应用程序端口（某些平台会自动设置）

## 常见问题

### 应用无法连接到MongoDB

检查：
1. 环境变量是否正确设置
2. MongoDB Atlas IP白名单是否包含应用服务器IP
3. MongoDB Atlas连接字符串是否正确

### Docker构建失败

检查：
1. Dockerfile语法是否正确
2. 系统是否有足够的磁盘空间
3. Maven依赖是否能正常下载

### 应用启动但无法访问

检查：
1. 防火墙或安全组设置
2. 端口映射是否正确
3. 健康检查是否通过（访问/health端点）