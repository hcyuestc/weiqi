# 使用Nginx作为基础镜像
FROM nginx:alpine

# 设置工作目录
WORKDIR /app

# 复制构建文件到Nginx的web根目录
COPY dist/ /usr/share/nginx/html/

# 复制自定义Nginx配置
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
