# 部署指南

本文档提供了将围棋游戏部署到不同环境的详细步骤。

## 目录

- [构建生产版本](#构建生产版本)
- [部署到静态网站托管服务](#部署到静态网站托管服务)
  - [GitHub Pages](#github-pages)
  - [Netlify](#netlify)
  - [Vercel](#vercel)
- [部署到传统Web服务器](#部署到传统web服务器)
  - [Nginx](#nginx)
  - [Apache](#apache)
- [Docker部署](#docker部署)
- [环境变量配置](#环境变量配置)
- [性能优化建议](#性能优化建议)

## 构建生产版本

在部署之前，需要先构建应用的生产版本：

```bash
npm run build
# 或者使用 yarn
yarn build
```

构建完成后，生成的静态文件将位于 `dist` 目录中。

## 部署到静态网站托管服务

### GitHub Pages

1. 安装 `gh-pages` 包

```bash
npm install --save-dev gh-pages
# 或者使用 yarn
yarn add --dev gh-pages
```

2. 在 `package.json` 中添加以下脚本和配置：

```json
{
  "homepage": "https://[your-username].github.io/[repository-name]",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  }
}
```

3. 运行部署命令：

```bash
npm run deploy
# 或者使用 yarn
yarn deploy
```

### Netlify

1. 登录 [Netlify](https://www.netlify.com/)
2. 点击 "New site from Git"
3. 选择GitHub并授权访问您的仓库
4. 选择您的仓库
5. 在部署配置中：
   - 构建命令：`npm run build` 或 `yarn build`
   - 发布目录：`dist`
6. 点击 "Deploy site"

### Vercel

1. 登录 [Vercel](https://vercel.com/)
2. 点击 "Import Project"
3. 选择 "Import Git Repository"
4. 输入您的仓库URL或从GitHub/GitLab/Bitbucket中选择
5. 配置项目设置：
   - 构建命令：`npm run build` 或 `yarn build`
   - 输出目录：`dist`
6. 点击 "Deploy"

## 部署到传统Web服务器

### Nginx

1. 安装Nginx（如果尚未安装）

```bash
# Ubuntu/Debian
apt update && apt install nginx

# CentOS/RHEL
yum install nginx
```

2. 将构建的静态文件复制到Nginx的根目录

```bash
cp -r dist/* /var/www/html/
```

3. 配置Nginx（可选）

编辑 `/etc/nginx/sites-available/default` 文件：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/html;
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

4. 测试并重新加载Nginx配置

```bash
nginx -t
nginx -s reload
```

### Apache

1. 安装Apache（如果尚未安装）

```bash
# Ubuntu/Debian
apt update && apt install apache2

# CentOS/RHEL
yum install httpd
```

2. 将构建的静态文件复制到Apache的根目录

```bash
cp -r dist/* /var/www/html/
```

3. 启用必要的Apache模块

```bash
# Ubuntu/Debian
a2enmod rewrite

# CentOS/RHEL
# 编辑 /etc/httpd/conf/httpd.conf 并确保 mod_rewrite 已启用
```

4. 配置Apache虚拟主机（可选）

编辑或创建 `/etc/apache2/sites-available/your-site.conf`（Ubuntu/Debian）或 `/etc/httpd/conf.d/your-site.conf`（CentOS/RHEL）：

```apache
<VirtualHost *:80>
    ServerName your-domain.com
    
    DocumentRoot /var/www/html
    
    <Directory /var/www/html>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # 确保所有路由都指向index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # 缓存静态文件
    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresByType image/jpg "access plus 7 days"
        ExpiresByType image/jpeg "access plus 7 days"
        ExpiresByType image/png "access plus 7 days"
        ExpiresByType text/css "access plus 7 days"
        ExpiresByType application/javascript "access plus 7 days"
    </IfModule>
</VirtualHost>
```

5. 启用配置并重启Apache

```bash
# Ubuntu/Debian
a2ensite your-site.conf
systemctl restart apache2

# CentOS/RHEL
systemctl restart httpd
```

## Docker部署

1. 创建Dockerfile

```dockerfile
# 使用Nginx作为基础镜像
FROM nginx:alpine

# 设置工作目录
WORKDIR /app

# 复制构建文件到Nginx的web根目录
COPY dist/ /usr/share/nginx/html/

# 复制自定义Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
```

2. 创建自定义Nginx配置（nginx.conf）

```nginx\server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
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

3. 构建Docker镜像

```bash
docker build -t weiqi-game .
```

4. 运行Docker容器

```bash
docker run -p 8080:80 weiqi-game
```

现在，您可以通过 `http://localhost:8080` 访问应用。

## 环境变量配置

如果需要在不同环境中使用不同的配置，可以在构建时使用环境变量。创建 `.env.production` 文件来配置生产环境变量：

```dotenv
# 示例环境变量
VITE_APP_ENVIRONMENT=production
VITE_APP_API_URL=https://api.example.com
```

在代码中使用这些变量：

```typescript
const apiUrl = import.meta.env.VITE_APP_API_URL;
```

## 性能优化建议

### 1. 静态资源优化

- 确保图片和资源已压缩
- 使用WebP格式的图片
- 考虑使用CDN来分发静态资源

### 2. 缓存策略

- 设置适当的HTTP缓存头
- 使用Service Worker进行离线缓存

### 3. 代码优化

- 确保代码分割已正确配置
- 优化大型依赖项的使用
- 确保Tree-shaking正常工作

### 4. 监控和分析

- 添加性能监控工具
- 使用Lighthouse等工具分析应用性能
- 根据分析结果持续优化

## 常见问题排查

### 路由问题

如果使用客户端路由，确保服务器配置正确处理所有路由，将未知路径重定向到index.html。

### 资源加载问题

- 检查资源路径是否正确
- 确保CORS设置正确
- 检查服务器是否配置了正确的MIME类型

### 缓存问题

- 在静态资源文件名中包含内容哈希
- 使用适当的缓存控制头
- 在部署新版本后通知用户刷新缓存