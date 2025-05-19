# CyberBeat 音乐播放器后端

这是 CyberBeat 音乐播放器的后端服务，使用 Express.js 和 MongoDB 构建。

## 功能特性

- 歌曲管理（上传、删除、修改、查询）
- 播放列表管理
- 文件上传（音频文件和封面图片）
- 完整的错误处理
- 日志系统
- CORS 支持

## 技术栈

- Node.js
- Express.js
- MongoDB
- Mongoose
- Multer (文件上传)
- Winston (日志)
- Express Validator (数据验证)

## 安装

1. 克隆项目
```bash
git clone <repository-url>
cd backend2
```

2. 安装依赖
```bash
npm install
```

3. 创建环境配置文件
创建 `.env` 文件并添加以下配置：
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/cyberbeat
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key
UPLOAD_PATH=uploads/
```

4. 创建上传目录
```bash
mkdir -p uploads/songs uploads/covers
```

## 运行

开发环境：
```bash
npm run dev
```

生产环境：
```bash
npm start
```

## API 文档

### 歌曲相关

- `GET /api/songs` - 获取所有歌曲
- `GET /api/songs/:id` - 获取单个歌曲
- `POST /api/songs` - 添加新歌曲
- `PUT /api/songs/:id` - 更新歌曲信息
- `DELETE /api/songs/:id` - 删除歌曲
- `POST /api/songs/:id/play` - 增加播放次数

### 播放列表相关

- `GET /api/playlists` - 获取所有播放列表
- `GET /api/playlists/:id` - 获取单个播放列表
- `POST /api/playlists` - 创建播放列表
- `PUT /api/playlists/:id` - 更新播放列表
- `DELETE /api/playlists/:id` - 删除播放列表
- `POST /api/playlists/:id/songs` - 添加歌曲到播放列表
- `DELETE /api/playlists/:id/songs/:songId` - 从播放列表移除歌曲

## 目录结构

```
backend2/
├── src/
│   ├── controllers/     # 控制器
│   ├── models/         # 数据模型
│   ├── routes/         # 路由
│   ├── middlewares/    # 中间件
│   ├── utils/          # 工具函数
│   ├── config/         # 配置文件
│   └── app.js          # 应用入口
├── uploads/            # 上传文件存储
│   ├── songs/         # 音频文件
│   └── covers/        # 封面图片
├── logs/              # 日志文件
├── .env               # 环境变量
└── package.json       # 项目配置
```

## 开发说明

1. 所有新功能请创建新分支开发
2. 提交代码前请运行测试
3. 遵循 ESLint 规范
4. 及时更新文档

## 注意事项

1. 确保 MongoDB 服务已启动
2. 上传文件大小限制为 10MB
3. 支持的音频格式：mp3, wav, ogg, m4a
4. 支持的图片格式：jpg, jpeg, png, gif 