#!/bin/bash

# 围棋游戏部署测试脚本
# 用于验证部署后的应用是否正常运行

echo "开始测试围棋游戏部署..."

# 定义测试URL
TEST_URL="http://localhost:8080"  # Docker部署的默认端口

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 进行HTTP健康检查
check_health() {
    echo "\n[测试1] 检查应用是否可以访问..."
    
    if command_exists curl; then
        HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$TEST_URL")
        if [ "$HTTP_STATUS" -eq 200 ]; then
            echo "✓ 应用可正常访问，HTTP状态码: $HTTP_STATUS"
            return 0
        else
            echo "✗ 应用无法访问，HTTP状态码: $HTTP_STATUS"
            return 1
        fi
    else
        echo "⚠ curl 命令不可用，跳过HTTP检查"
        return 0
    fi
}

# 检查核心文件是否存在（适用于直接检查文件系统，需要在服务器上执行）
check_core_files() {
    echo "\n[测试2] 检查核心文件是否存在..."
    
    if [ -d "/var/www/weiqi" ]; then
        # 传统部署检查
        if [ -f "/var/www/weiqi/index.html" ] && [ -f "/var/www/weiqi/index.js" ]; then
            echo "✓ 核心文件存在于 /var/www/weiqi/"
            return 0
        else
            echo "✗ 核心文件在 /var/www/weiqi/ 中不存在"
            return 1
        fi
    elif command_exists docker; then
        # Docker部署检查
        if docker ps | grep -q "weiqi-game"; then
            echo "✓ Docker容器 weiqi-game 正在运行"
            return 0
        else
            echo "✗ Docker容器 weiqi-game 未运行"
            return 1
        fi
    else
        echo "⚠ 无法确定部署类型，跳过文件检查"
        return 0
    fi
}

# 检查服务是否正常运行
check_services() {
    echo "\n[测试3] 检查服务状态..."
    
    # 检查Nginx服务
    if command_exists systemctl && systemctl is-active --quiet nginx; then
        echo "✓ Nginx服务正在运行"
    elif command_exists service && service nginx status >/dev/null 2>&1; then
        echo "✓ Nginx服务正在运行"
    else
        echo "⚠ Nginx服务未运行（可能使用Docker部署）"
    fi
    
    # 检查Docker服务
    if command_exists docker && systemctl is-active --quiet docker; then
        echo "✓ Docker服务正在运行"
    fi
    
    return 0
}

# 显示访问信息
show_access_info() {
    echo "\n[部署访问信息]"
    echo "根据部署方式，您可以通过以下地址访问围棋游戏："
    echo "- Docker部署: http://[服务器IP]:8080"
    echo "- 传统Nginx部署: http://[服务器IP] 或 http://[域名]"
    echo ""
    echo "请在浏览器中打开上述地址进行访问验证。"
    echo ""
    echo "验证步骤："
    echo "1. 检查页面是否正常加载"
    echo "2. 尝试进行围棋游戏"
    echo "3. 验证黑白棋子是否能正常落子"
    echo "4. 测试AI对战功能（如果有）"
}

# 执行所有测试
success=0
check_health || success=1
check_core_files || success=1
check_services || success=1
show_access_info

# 总结
if [ "$success" -eq 0 ]; then
    echo "\n🎉 测试完成！所有测试通过，应用应该可以正常运行。"
    exit 0
else
    echo "\n⚠️  测试完成，但有一些测试未通过。请检查以上错误信息。"
    exit 1
fi
