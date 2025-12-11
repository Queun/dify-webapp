# 腾讯云部署指南

本指南将帮助你在腾讯云服务器上部署 Dify Webapp。

## 📋 前置要求

### 1. 腾讯云服务器配置
- **CPU**: 2核或以上
- **内存**: 2GB或以上
- **带宽**: 1Mbps或以上
- **系统**: Ubuntu 22.04 LTS（推荐）
- **存储**: 20GB或以上

### 2. 必需信息
- Dify APP ID（从 Dify 平台获取）
- Dify APP KEY（从 Dify 平台获取）
- GitHub 仓库地址（你的代码仓库）

---

## 🚀 快速部署（推荐）

### 方法一：使用一键部署脚本

**步骤1：连接到服务器**
```bash
ssh root@your-server-ip
```

**步骤2：下载并运行部署脚本**
```bash
# 如果代码已在 GitHub
curl -fsSL https://raw.githubusercontent.com/your-username/dify-webapp/main/deploy.sh | bash

# 或者手动上传 deploy.sh 后执行
chmod +x deploy.sh
sudo bash deploy.sh
```

**步骤3：按提示输入信息**
- GitHub 仓库地址
- Dify APP ID
- Dify APP KEY
- Dify API URL（默认：https://api.dify.ai/v1）

**步骤4：等待部署完成**
脚本会自动完成以下操作：
- 安装 Docker
- 安装 Git
- 克隆代码
- 配置环境变量
- 构建 Docker 镜像
- 启动容器
- 配置防火墙

**步骤5：访问应用**
```
http://your-server-ip:3000
```

---

## 🔧 手动部署

如果你想更好地理解部署过程，可以按照以下步骤手动部署。

### 步骤1：连接到服务器
```bash
ssh root@your-server-ip
```

### 步骤2：安装 Docker
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | bash

# 启动 Docker
systemctl start docker
systemctl enable docker

# 验证安装
docker --version
```

### 步骤3：安装 Git
```bash
apt-get update
apt-get install -y git
```

### 步骤4：克隆代码
```bash
# 创建应用目录
mkdir -p /opt/dify-webapp
cd /opt/dify-webapp

# 克隆代码
git clone https://github.com/your-username/dify-webapp.git .
```

### 步骤5：配置环境变量
```bash
# 创建 .env.production 文件
nano .env.production
```

填入以下内容（替换为你的实际值）：
```env
NEXT_PUBLIC_APP_ID='your-dify-app-id'
NEXT_PUBLIC_APP_KEY='your-dify-app-key'
NEXT_PUBLIC_API_URL='https://api.dify.ai/v1'
JWT_SECRET='your-jwt-secret'
DB_PATH='/app/data/sessions.db'
NODE_ENV='production'
```

**生成 JWT Secret**：
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 步骤6：构建 Docker 镜像
```bash
docker build -t dify-webapp .
```

### 步骤7：运行容器
```bash
docker run -d \
  --name dify-webapp \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  -v /opt/dify-webapp/data:/app/data \
  dify-webapp
```

### 步骤8：配置防火墙
```bash
# 使用 ufw
ufw allow 3000/tcp

# 或者在腾讯云控制台配置安全组
# 添加入站规则：TCP 3000 端口，来源 0.0.0.0/0
```

### 步骤9：验证部署
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs -f dify-webapp

# 访问应用
curl http://localhost:3000
```

---

## 🔒 腾讯云安全组配置

**重要**：必须在腾讯云控制台配置安全组，否则无法从外网访问。

### 配置步骤：
1. 登录腾讯云控制台
2. 进入 **云服务器** → **安全组**
3. 选择你的服务器使用的安全组
4. 点击 **修改规则** → **入站规则**
5. 点击 **添加规则**
6. 配置如下：
   - **类型**: 自定义
   - **来源**: 0.0.0.0/0
   - **协议端口**: TCP:3000
   - **策略**: 允许
7. 保存规则

---

## 📊 常用命令

### Docker 容器管理
```bash
# 查看容器状态
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看实时日志
docker logs -f dify-webapp

# 查看最近100行日志
docker logs --tail 100 dify-webapp

# 重启容器
docker restart dify-webapp

# 停止容器
docker stop dify-webapp

# 启动容器
docker start dify-webapp

# 删除容器
docker rm -f dify-webapp
```

### 应用更新
```bash
# 进入应用目录
cd /opt/dify-webapp

# 拉取最新代码
git pull

# 重新构建镜像
docker build -t dify-webapp .

# 停止并删除旧容器
docker stop dify-webapp
docker rm dify-webapp

# 启动新容器
docker run -d \
  --name dify-webapp \
  -p 3000:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  -v /opt/dify-webapp/data:/app/data \
  dify-webapp
```

### 系统监控
```bash
# 查看系统资源使用
docker stats dify-webapp

# 查看磁盘使用
df -h

# 查看内存使用
free -h

# 查看 Docker 镜像
docker images
```

---

## 🐛 故障排查

### 问题1：无法访问应用

**检查容器是否运行**：
```bash
docker ps
```

**检查日志**：
```bash
docker logs dify-webapp
```

**检查端口是否监听**：
```bash
netstat -tlnp | grep 3000
```

**检查防火墙**：
```bash
ufw status
```

**检查腾讯云安全组**：
- 确认已添加 TCP 3000 端口的入站规则

---

### 问题2：容器启动失败

**查看详细错误**：
```bash
docker logs dify-webapp
```

**常见原因**：
- 环境变量配置错误
- 端口被占用
- 内存不足

**解决方法**：
```bash
# 检查环境变量
cat .env.production

# 检查端口占用
lsof -i :3000

# 检查内存
free -h
```

---

### 问题3：构建镜像失败

**检查 Docker 版本**：
```bash
docker --version
```

**清理 Docker 缓存**：
```bash
docker system prune -a
```

**重新构建**：
```bash
docker build --no-cache -t dify-webapp .
```

---

### 问题4：数据库文件权限问题

**检查数据目录权限**：
```bash
ls -la /opt/dify-webapp/data
```

**修复权限**：
```bash
chmod -R 755 /opt/dify-webapp/data
```

---

## 🔄 备份和恢复

### 备份数据
```bash
# 备份数据库
cp /opt/dify-webapp/data/sessions.db /opt/dify-webapp/data/sessions.db.backup

# 备份环境变量
cp /opt/dify-webapp/.env.production /opt/dify-webapp/.env.production.backup
```

### 恢复数据
```bash
# 恢复数据库
cp /opt/dify-webapp/data/sessions.db.backup /opt/dify-webapp/data/sessions.db

# 重启容器
docker restart dify-webapp
```

---

## 🌐 配置域名（可选）

如果你有域名，可以配置 Nginx 反向代理。

### 安装 Nginx
```bash
apt-get install -y nginx
```

### 配置 Nginx
```bash
nano /etc/nginx/sites-available/dify-webapp
```

添加以下配置：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 启用配置
```bash
ln -s /etc/nginx/sites-available/dify-webapp /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 配置 HTTPS（使用 Let's Encrypt）
```bash
# 安装 Certbot
apt-get install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看日志：`docker logs -f dify-webapp`
2. 检查 GitHub Issues
3. 联系技术支持

---

## 📝 更新日志

- **2025-12-12**: 初始版本，支持腾讯云一键部署
