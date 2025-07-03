#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Dutch Vocabulary App Docker Starter ===${NC}"
echo

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker未安装。请先安装Docker: https://docs.docker.com/get-docker/${NC}"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose未安装。请先安装Docker Compose: https://docs.docker.com/compose/install/${NC}"
    exit 1
fi

# 显示菜单
echo -e "请选择操作:"
echo -e "1) ${GREEN}启动开发环境${NC} (带MongoDB)"
echo -e "2) ${GREEN}启动开发环境${NC} (后台运行)"
echo -e "3) ${YELLOW}停止开发环境${NC}"
echo -e "4) ${YELLOW}停止并删除所有数据${NC}"
echo -e "5) ${GREEN}构建生产Docker镜像${NC}"
echo -e "6) ${YELLOW}查看日志${NC}"
echo -e "7) ${RED}退出${NC}"
echo

read -p "请输入选项 [1-7]: " choice

case $choice in
    1)
        echo -e "${GREEN}启动开发环境...${NC}"
        docker-compose -f docker/docker-compose.yml up
        ;;
    2)
        echo -e "${GREEN}在后台启动开发环境...${NC}"
        docker-compose -f docker/docker-compose.yml up -d
        echo -e "${GREEN}服务已启动!${NC}"
        echo -e "API地址: ${YELLOW}http://localhost:8080${NC}"
        echo -e "MongoDB地址: ${YELLOW}localhost:27017${NC}"
        echo -e "使用 '${YELLOW}./docker/docker-start.sh${NC}' 并选择选项 6 查看日志"
        ;;
    3)
        echo -e "${YELLOW}停止开发环境...${NC}"
        docker-compose -f docker/docker-compose.yml down
        echo -e "${GREEN}服务已停止${NC}"
        ;;
    4)
        echo -e "${RED}警告: 这将删除所有数据卷!${NC}"
        read -p "确定要继续吗? [y/N]: " confirm
        if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
            echo -e "${YELLOW}停止服务并删除数据卷...${NC}"
            docker-compose -f docker/docker-compose.yml down -v
            echo -e "${GREEN}服务已停止，数据已删除${NC}"
        else
            echo -e "${YELLOW}操作已取消${NC}"
        fi
        ;;
    5)
        echo -e "${GREEN}构建生产Docker镜像...${NC}"
        docker build -t dutch-vocab-app:latest -f docker/Dockerfile .
        echo -e "${GREEN}镜像构建完成: dutch-vocab-app:latest${NC}"
        ;;
    6)
        echo -e "${YELLOW}显示日志 (按 Ctrl+C 退出)...${NC}"
        docker-compose -f docker/docker-compose.yml logs -f
        ;;
    7)
        echo -e "${YELLOW}退出${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}无效选项${NC}"
        exit 1
        ;;
esac