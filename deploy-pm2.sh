#!/bin/bash

# Dify Webapp PM2 部署脚本（不使用 Docker）
# 适用于腾讯云/阿里云 Ubuntu 22.04 服务器

set -e  # 遇到错误立即退出

echo "=========================================="
echo "  Dify Webapp PM2 部署脚本"
echo "  (不使用 Docker，直接运行 Node.js)"
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
    echo "使用命令: sudo bash deploy-pm2.sh"
    exit 1
fi

echo -e "${GREEN}步骤 1/7: 检查系统环境${NC}"
echo "操作系统: $(lsb_release -d | cut -f2)"
echo "内核版本: $(uname -r)"
echo ""

# 安装 Node.js 22
echo -e "${GREEN}步骤 2/7: 安装 Node.js 22${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "Node.js 已安装，版本: $NODE_VERSION"

    # 检查版本是否为 22.x
    if [[ ! $NODE_VERSION =~ ^v22\. ]]; then
        echo -e "${YELLOW}当前版本不是 22.x，正在升级...${NC}"
        curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
        apt-get install -y nodejs
    fi
else
    echo "正在安装 Node.js 22..."
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
    echo -e "${GREEN}Node.js 安装完成！${NC}"
fi

echo "Node.js 版本: $(node -v)"
echo "npm 版本: $(npm -v)"
echo ""

# 安装 PM2
echo -e "${GREEN}步骤 3/7: 安装 PM2${NC}"
if command -v pm2 &> /dev/null; then
    echo "PM2 已安装，版本: $(pm2 -v)"
else
    echo "正在安装 PM2..."
    npm install -g pm2
    echo -e "${GREEN}PM2 安装完成！${NC}"
fi
echo ""

# 安装 Git
echo -e "${GREEN}步骤 4/7: 安装 Git${NC}"
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
echo -e "${GREEN}步骤 5/7: 获取应用代码${NC}"
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
echo -e "${GREEN}步骤 6/7: 配置环境变量${NC}"
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
DB_PATH='$APP_DIR/data/sessions.db'
NODE_ENV='production'
EOF

echo -e "${GREEN}环境变量配置完成！${NC}"
echo ""

# 安装依赖和构建
echo -e "${GREEN}步骤 7/7: 安装依赖并构建应用${NC}"

# 创建数据目录
mkdir -p "$APP_DIR/data"

echo "正在安装依赖（这可能需要几分钟）..."
npm install

echo "正在构建应用（这可能需要几分钟）..."
npm run build

echo -e "${GREEN}构建完成！${NC}"
echo ""

# 停止旧的 PM2 进程（如果存在）
echo "检查并停止旧进程..."
pm2 delete dify-webapp 2>/dev/null || true

# 使用 PM2 启动应用
echo "正在启动应用..."
pm2 start npm --name "dify-webapp" -- start

# 设置 PM2 开机自启
pm2 startup systemd -u root --hp /root
pm2 save

echo ""
echo -e "${GREEN}✓ 部署完成！${NC}"
echo ""
echo "=========================================="
echo "  部署信息"
echo "=========================================="
echo "应用地址: http://$(curl -s ifconfig.me):3000"
echo "应用目录: $APP_DIR"
echo "数据目录: $APP_DIR/data"
echo ""
echo "PM2 常用命令:"
echo "  查看状态: pm2 status"
echo "  查看日志: pm2 logs dify-webapp"
echo "  重启应用: pm2 restart dify-webapp"
echo "  停止应用: pm2 stop dify-webapp"
echo "  启动应用: pm2 start dify-webapp"
echo "  查看监控: pm2 monit"
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
echo ""
echo "查看实时日志: pm2 logs dify-webapp --lines 100"
