#!/bin/bash

# 安装依赖
npm install

# 确保所有必要的目录存在
mkdir -p logs
mkdir -p uploads
mkdir -p public/localmusics
mkdir -p public/images

# 设置权限
chmod -R 755 public
chmod -R 755 uploads
chmod -R 755 logs

echo "Build completed successfully" 