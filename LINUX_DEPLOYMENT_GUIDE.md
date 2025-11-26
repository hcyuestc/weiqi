# 围棋游戏 Linux 部署指南

本指南提供了将围棋游戏部署到 Linux 服务器的详细步骤，包括传统部署和 Docker 部署两种方式。

## 准备工作

1. 确保您的 Linux 服务器已安装并配置好网络
2. 确保您已完成项目的生产构建（`npm run build`）
3. 将以下文件复制到您的 Linux 服务器：
   - `dist/` 目录（构建输出）
   - 部署脚本和配置文件

## 方法一：传统部署（Nginx）

### 步骤 1：安装 Nginx

根据您的 Linux 发行版，选择以下命令之一：

#### Ubuntu/Debian 系统：
```bash
sudo apt update && sudo apt install -y nginx
```

#### CentOS/RHEL 系统：
```bash
sudo yum install -y epel-release && sudo yum install -y nginx
```

### 步骤 2：启动并启用 Nginx 服务

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

### 步骤 3：创建网站根目录

```bash
sudo mkdir -p /var/www/weiqi
sudo chown -R $USER:$USER /var/www/weiqi
```

### 步骤 4：部署构建文件

将 `dist` 目录中的所有文件复制到网站根目录：

```bash
cp -r dist/* /var/www/weiqi/
```

### 步骤 5：配置 Nginx 虚拟主机

创建 Nginx 配置文件：

```bash
sudo nano /etc/nginx/sites-available/weiqi
```

粘贴以下配置内容（根据需要修改）：

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名或服务器IP
    
    root /var/www/weiqi;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 缓存静态文件
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }
}
```

### 步骤 6：启用配置并重启 Nginx

```bash
sudo ln -s /etc/nginx/sites-available/weiqi /etc/nginx/sites-enabled/
sudo nginx -t  # 测试配置是否正确
sudo systemctl reload nginx
```

### 步骤 7：配置防火墙

如果您的服务器启用了防火墙，需要开放 HTTP 端口：

#### Ubuntu/Debian (使用 ufw)：
```bash
sudo ufw allow 'Nginx HTTP'
```

#### CentOS/RHEL (使用 firewalld)：
```bash
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --reload
```

## 方法二：Docker 部署

### 步骤 1：安装 Docker 和 Docker Compose

根据您的 Linux 发行版，安装 Docker 和 Docker Compose。以下是通用步骤：

```bash
# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 步骤 2：准备 Docker 配置文件

确保以下文件已复制到服务器：
- `Dockerfile`
- `docker-compose.yml`
- `nginx.conf`
- `dist/` 目录

### 步骤 3：构建并运行容器

在包含 `docker-compose.yml` 的目录中运行：

```bash
docker-compose up -d
```

这将构建 Docker 镜像并以后台模式启动容器。

### 步骤 4：访问应用

应用将在 `http://服务器IP:8080` 上运行。

## 部署后验证

部署完成后，您可以通过以下方式验证应用是否正常运行：

1. 打开浏览器，访问您的服务器 IP 或域名
2. 检查应用是否正常加载
3. 尝试进行围棋游戏，验证功能是否正常

## 常见问题排查

### Nginx 部署问题

1. 检查 Nginx 错误日志：
   ```bash
   sudo tail -f /var/log/nginx/error.log
   ```

2. 确保文件权限正确：
   ```bash
   sudo chown -R www-data:www-data /var/www/weiqi
   ```

### Docker 部署问题

1. 检查容器日志：
   ```bash
   docker-compose logs
   ```

2. 检查容器状态：
   ```bash
   docker-compose ps
   ```

3. 重新构建镜像：
   ```bash
   docker-compose up -d --build
   ```

## 自动部署脚本

我们提供了一个辅助脚本 `deploy_to_linux.sh`，您可以在 Linux 服务器上运行它来查看详细的部署步骤。

```bash
chmod +x deploy_to_linux.sh
./deploy_to_linux.sh
```

---

部署完成后，您的围棋游戏应该可以通过配置的 URL 正常访问了！