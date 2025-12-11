#!/bin/bash

# Dify Webapp 一键部署脚本
# 适用于腾讯云/阿里云 Ubuntu 22.04 服务器

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  Dify Webapp 一键部署脚本"
echo "=========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 root 用户运行此脚本${NC}"
    echo "使用命令: sudo bash deploy.sh"
    exit 1
fi

echo -e "${GREEN}步骤 1/6: 检查系统环境${NC}"
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "内核版本: $(uname -r)"
echo ""

# 安装 Docker
echo -e "${GREEN}步骤 2/6: 安装 Docker${NC}"
if command -v docker &> /dev/null; then
    echo "Docker 已安装，版本: $(docker --version)"
else
    echo "正在安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}Docker 安装完成！${NC}"
fi
echo ""

# 安装 Git
echo -e "${GREEN}步骤 3/6: 安装 Git${NC}"
if command -v git &> /dev/null; then
    echo "Git 已安装，版本: $(git --version)"
else
    echo "正在安装 Git..."
    apt-get update
    apt-get install -y git
    echo -e "${GREEN}Git 安装完成！${NC}"
fi
echo ""

# 克隆代码
echo -e "${GREEN}步骤 4/6: 获取应用代码${NC}"
read -p "请输入 GitHub 仓库地址 (例如: https://github.com/username/dify-webapp.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo -e "${RED}错误: 仓库地址不能为空${NC}"
    exit 1
fi

APP_DIR="/opt/dify-webapp"

if [ -d "$APP_DIR" ]; then
    echo "目录已存在，正在更新代码..."
    cd "$APP_DIR"
    git pull
else
    echo "正在克隆代码..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
echo -e "${GREEN}代码获取完成！${NC}"
echo ""

# 配置环境变量
echo -e "${GREEN}步骤 5/6: 配置环境变量${NC}"
echo "请输入以下配置信息："
echo ""

read -p "Dify APP ID: " APP_ID
read -p "Dify APP KEY: " APP_KEY
read -p "Dify API URL (默认: https://api.dify.ai/v1): " API_URL
API_URL=${API_URL:-https://api.dify.ai/v1}

# 生成 JWT Secret
JWT_SECRET=$(openssl rand -hex 32)
echo -e "${YELLOW}已自动生成 JWT Secret: $JWT_SECRET${NC}"

# 创建 .env.production 文件
cat > .env.production <<EOF
NEXT_PUBLIC_APP_ID='$APP_ID'
NEXT_PUBLIC_APP_KEY='$APP_KEY'
NEXT_PUBLIC_API_URL='$API_URL'
JWT_SECRET='$JWT_SECRET'
DB_PATH='/app/data/sessions.db'
NODE_ENV='production'
EOF

echo -e "${GREEN}环境变量配置完成！${NC}"
echo ""

# 构建和运行 Docker 容器
echo -e "${GREEN}步骤 6/6: 构建和启动应用${NC}"

# 停止并删除旧容器（如果存在）
if docker ps -a | grep -q dify-webapp; then
    echo "停止旧容器..."
    docker stop dify-webapp || true
    docker rm dify-webapp || true
fi

# 删除旧镜像（可选）
if docker images | grep -q dify-webapp; then
    echo "删除旧镜像..."
    docker rmi dify-webapp || true
fi

echo "正在构建 Docker 镜像（这可能需要几分钟）..."
docker build -t dify-webapp .

echo "正在启动容器..."
docker run -d \
  --name dify-webapp \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  -v "$APP_DIR/data:/app/data" \
  dify-webapp

echo ""
echo -e "${GREEN}✓ 部署完成！${NC}"
echo ""
echo "=========================================="
echo "  部署信息"
echo "=========================================="
echo "应用地址: http://$(curl -s ifconfig.me):3000"
echo "容器名称: dify-webapp"
echo "数据目录: $APP_DIR/data"
echo ""
echo "常用命令:"
echo "  查看日志: docker logs -f dify-webapp"
echo "  重启应用: docker restart dify-webapp"
echo "  停止应用: docker stop dify-webapp"
echo "  启动应用: docker start dify-webapp"
echo ""

# 配置防火墙
echo -e "${YELLOW}正在配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    ufw allow 3000/tcp
    echo -e "${GREEN}防火墙规则已添加（端口 3000）${NC}"
else
    echo -e "${YELLOW}未检测到 ufw，请手动在腾讯云控制台开放 3000 端口${NC}"
fi

echo ""
echo -e "${GREEN}=========================================="
echo "  部署成功！"
echo "==========================================${NC}"
echo ""
echo "请在浏览器访问: http://$(curl -s ifconfig.me):3000"
echo ""
echo -e "${YELLOW}注意: 如果无法访问，请检查腾讯云安全组是否开放了 3000 端口${NC}"
