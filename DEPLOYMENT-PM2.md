# 腾讯云 PM2 部署指南（推荐）

本指南使用 **PM2** 直接运行 Node.js 应用，**不使用 Docker**，更简单、更快速。

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

## 🚀 快速部署（一键脚本）

### 步骤1：连接到服务器
```bash
ssh root@your-server-ip
```

### 步骤2：下载并运行部署脚本
```bash
# 如果代码已在 GitHub
curl -fsSL https://raw.githubusercontent.com/your-username/dify-webapp/main/deploy-pm2.sh | bash

# 或者手动上传 deploy-pm2.sh 后执行
chmod +x deploy-pm2.sh
sudo bash deploy-pm2.sh
```

### 步骤3：按提示输入信息
- GitHub 仓库地址
- Dify APP ID
- Dify APP KEY
- Dify API URL（默认：https://api.dify.ai/v1）

### 步骤4：等待部署完成
脚本会自动完成以下操作：
- ✅ 安装 Node.js 22
- ✅ 安装 PM2
- ✅ 安装 Git
- ✅ 克隆代码
- ✅ 配置环境变量
- ✅ 安装依赖
- ✅ 构建应用
- ✅ 启动 PM2 进程
- ✅ 配置开机自启
- ✅ 配置防火墙

### 步骤5：配置腾讯云安全组
1. 登录腾讯云控制台
2. 进入 **云服务器** → **安全组**
3. 添加入站规则：**TCP 3000 端口**，来源 **0.0.0.0/0**

### 步骤6：访问应用
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

### 步骤2：安装 Node.js 22
```bash
# 添加 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

# 安装 Node.js
apt-get install -y nodejs

# 验证安装
node -v  # 应该显示 v22.x.x
npm -v
```

### 步骤3：安装 PM2
```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 -v
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
DB_PATH='/opt/dify-webapp/data/sessions.db'
NODE_ENV='production'
```

**生成 JWT Secret**：
```bash
openssl rand -hex 32
```

### 步骤6：安装依赖
```bash
npm install
```

### 步骤7：构建应用
```bash
npm run build
```

### 步骤8：创建数据目录
```bash
mkdir -p /opt/dify-webapp/data
mkdir -p /opt/dify-webapp/logs
```

### 步骤9：启动应用
```bash
# 使用 PM2 启动
pm2 start npm --name "dify-webapp" -- start

# 或者使用配置文件启动
pm2 start ecosystem.config.js
```

### 步骤10：配置开机自启
```bash
# 生成启动脚本
pm2 startup systemd -u root --hp /root

# 保存当前进程列表
pm2 save
```

### 步骤11：配置防火墙
```bash
# 使用 ufw
ufw allow 3000/tcp

# 或者在腾讯云控制台配置安全组
# 添加入站规则：TCP 3000 端口，来源 0.0.0.0/0
```

### 步骤12：验证部署
```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs dify-webapp

# 访问应用
curl http://localhost:3000
```

---

## 📊 PM2 常用命令

### 进程管理
```bash
# 查看所有进程状态
pm2 status
pm2 list

# 查看详细信息
pm2 show dify-webapp

# 重启应用
pm2 restart dify-webapp

# 停止应用
pm2 stop dify-webapp

# 启动应用
pm2 start dify-webapp

# 删除进程
pm2 delete dify-webapp

# 重载应用（零停机）
pm2 reload dify-webapp
```

### 日志管理
```bash
# 查看实时日志
pm2 logs dify-webapp

# 查看最近100行日志
pm2 logs dify-webapp --lines 100

# 只看错误日志
pm2 logs dify-webapp --err

# 清空日志
pm2 flush

# 查看日志文件位置
pm2 show dify-webapp
```

### 监控
```bash
# 实时监控（CPU、内存）
pm2 monit

# 查看资源使用
pm2 status
```

### 开机自启
```bash
# 生成启动脚本
pm2 startup

# 保存当前进程列表
pm2 save

# 取消开机自启
pm2 unstartup systemd
```

---

## 🔄 应用更新

### 方法一：使用 Git 更新
```bash
# 进入应用目录
cd /opt/dify-webapp

# 拉取最新代码
git pull

# 安装新依赖（如果有）
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart dify-webapp

# 查看日志确认
pm2 logs dify-webapp
```

### 方法二：零停机更新
```bash
cd /opt/dify-webapp
git pull
npm install
npm run build

# 使用 reload 而不是 restart（零停机）
pm2 reload dify-webapp
```

### 方法三：创建更新脚本
创建 `update.sh`：
```bash
#!/bin/bash
cd /opt/dify-webapp
echo "拉取最新代码..."
git pull
echo "安装依赖..."
npm install
echo "构建应用..."
npm run build
echo "重启应用..."
pm2 restart dify-webapp
echo "更新完成！"
pm2 logs dify-webapp --lines 50
```

使用：
```bash
chmod +x update.sh
./update.sh
```

---

## 🐛 故障排查

### 问题1：应用无法启动

**查看日志**：
```bash
pm2 logs dify-webapp --err
```

**常见原因**：
- 端口被占用
- 环境变量配置错误
- 依赖安装不完整
- 构建失败

**解决方法**：
```bash
# 检查端口占用
lsof -i :3000

# 检查环境变量
cat /opt/dify-webapp/.env.production

# 重新安装依赖
cd /opt/dify-webapp
rm -rf node_modules
npm install

# 重新构建
npm run build

# 重启应用
pm2 restart dify-webapp
```

---

### 问题2：应用频繁重启

**查看重启次数**：
```bash
pm2 status
```

**查看错误日志**：
```bash
pm2 logs dify-webapp --err --lines 100
```

**常见原因**：
- 内存不足
- 未捕获的异常
- 数据库连接失败

**解决方法**：
```bash
# 增加内存限制
pm2 delete dify-webapp
pm2 start npm --name "dify-webapp" --max-memory-restart 1G -- start

# 或修改 ecosystem.config.js
nano ecosystem.config.js
# 修改 max_memory_restart: '1G'

pm2 restart dify-webapp
```

---

### 问题3：无法访问应用

**检查应用状态**：
```bash
pm2 status
```

**检查端口监听**：
```bash
netstat -tlnp | grep 3000
```

**检查防火墙**：
```bash
ufw status
```

**检查腾讯云安全组**：
- 确认已添加 TCP 3000 端口的入站规则

**测试本地访问**：
```bash
curl http://localhost:3000
```

---

### 问题4：日志文件过大

**查看日志大小**：
```bash
du -sh /opt/dify-webapp/logs/
```

**清空日志**：
```bash
pm2 flush
```

**配置日志轮转**：
安装 PM2 日志轮转模块：
```bash
pm2 install pm2-logrotate

# 配置
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
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

## 🔄 备份和恢复

### 备份数据
```bash
# 备份数据库
cp /opt/dify-webapp/data/sessions.db /opt/dify-webapp/data/sessions.db.backup.$(date +%Y%m%d)

# 备份环境变量
cp /opt/dify-webapp/.env.production /opt/dify-webapp/.env.production.backup

# 备份整个应用（可选）
tar -czf /root/dify-webapp-backup-$(date +%Y%m%d).tar.gz /opt/dify-webapp
```

### 恢复数据
```bash
# 恢复数据库
cp /opt/dify-webapp/data/sessions.db.backup.20251212 /opt/dify-webapp/data/sessions.db

# 重启应用
pm2 restart dify-webapp
```

### 自动备份脚本
创建 `/root/backup.sh`：
```bash
#!/bin/bash
BACKUP_DIR="/root/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份数据库
cp /opt/dify-webapp/data/sessions.db $BACKUP_DIR/sessions.db.$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "sessions.db.*" -mtime +7 -delete

echo "备份完成: $BACKUP_DIR/sessions.db.$DATE"
```

添加到 crontab（每天凌晨2点备份）：
```bash
chmod +x /root/backup.sh
crontab -e
# 添加：
0 2 * * * /root/backup.sh
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

## 📊 性能优化

### 1. 启用集群模式
修改 `ecosystem.config.js`：
```javascript
module.exports = {
  apps: [{
    name: 'dify-webapp',
    script: 'node_modules/next/dist/bin/next',
    args: 'start',
    instances: 'max',  // 使用所有CPU核心
    exec_mode: 'cluster',  // 集群模式
    // ... 其他配置
  }]
}
```

重启：
```bash
pm2 delete dify-webapp
pm2 start ecosystem.config.js
pm2 save
```

### 2. 配置 Node.js 内存
```bash
# 增加 Node.js 内存限制
pm2 delete dify-webapp
pm2 start npm --name "dify-webapp" --node-args="--max-old-space-size=1024" -- start
pm2 save
```

### 3. 启用 PM2 监控
```bash
# 安装 PM2 Plus（可选）
pm2 link <secret> <public>

# 或使用内置监控
pm2 monit
```

---

## 📞 获取帮助

如果遇到问题：
1. 查看日志：`pm2 logs dify-webapp`
2. 查看状态：`pm2 status`
3. 查看详细信息：`pm2 show dify-webapp`
4. 检查 GitHub Issues

---

## 📝 更新日志

- **2025-12-12**: 初始版本，支持 PM2 部署（不使用 Docker）

---

## 🆚 PM2 vs Docker 对比

| 特性 | PM2 方案 | Docker 方案 |
|------|---------|------------|
| 部署速度 | ⚡ 快（5-8分钟） | 🐢 慢（10-15分钟） |
| 学习曲线 | ✅ 简单 | ⚠️ 需要学习 Docker |
| 资源占用 | ✅ 低 | ⚠️ 较高 |
| 环境隔离 | ⚠️ 无 | ✅ 完全隔离 |
| 更新方式 | ✅ 简单（git pull） | ⚠️ 需要重新构建镜像 |
| 适用场景 | 实验环境、小规模 | 生产环境、大规模 |

**推荐**：对于实验环境，PM2 方案更简单、更快速！
