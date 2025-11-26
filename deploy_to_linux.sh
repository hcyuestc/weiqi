#!/bin/bash

# 围棋游戏部署脚本 - 适用于Linux服务器
# 此脚本提供了在Linux服务器上部署围棋游戏的完整步骤
# 使用方法：将此脚本和dist目录一起复制到您的Linux服务器上，然后执行

echo "=== 围棋游戏Linux部署指南 ==="
echo "注意：此脚本提供指导，请根据您的实际Linux发行版调整命令"
echo "================================"

echo "
1. 安装Nginx (Ubuntu/Debian系统):"
echo "sudo apt update && sudo apt install -y nginx"

echo "
1. 安装Nginx (CentOS/RHEL系统):"
echo "sudo yum install -y epel-release && sudo yum install -y nginx"

echo "
2. 启动并启用Nginx服务:"
echo "sudo systemctl start nginx"
echo "sudo systemctl enable nginx"

echo "
3. 创建网站根目录(如果需要):"
echo "sudo mkdir -p /var/www/weiqi"
echo "sudo chown -R $USER:$USER /var/www/weiqi"

echo "
4. 复制构建文件到网站根目录:"
echo "cp -r dist/* /var/www/weiqi/"

echo "
5. 创建Nginx配置文件:"
echo "sudo nano /etc/nginx/sites-available/weiqi"
echo "
# 在编辑器中粘贴以下内容:
server {
    listen 80;
    server_name your-domain.com;  # 替换为您的域名或IP地址
    
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
}"

echo "
6. 启用Nginx配置:"
echo "sudo ln -s /etc/nginx/sites-available/weiqi /etc/nginx/sites-enabled/"

echo "
7. 测试Nginx配置:"
echo "sudo nginx -t"

echo "
8. 重新加载Nginx:"
echo "sudo systemctl reload nginx"

echo "
9. 配置防火墙(如果使用):"
echo "sudo ufw allow 'Nginx HTTP'  # Ubuntu/Debian"
echo "sudo firewall-cmd --permanent --add-service=http && sudo firewall-cmd --reload  # CentOS/RHEL"

echo "
================================"
echo "部署完成! 您的围棋游戏应该可以通过服务器IP或域名访问了"
echo "如果遇到问题，请检查Nginx错误日志: sudo tail -f /var/log/nginx/error.log"
