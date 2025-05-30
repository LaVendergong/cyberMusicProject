const express = require('express');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');

// 导入日志配置
const logger = require('./config/logger');

// 导入数据库连接
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// 导入路由
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const healthRoutes = require('./routes/healthRoutes');

const app = express();

// 连接数据库
connectDB();

// 中间件
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range'],
    exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges'],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志配置
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

// 静态文件服务配置
const staticOptions = {
    setHeaders: (res, path, stat) => {
        // 设置音频文件的 MIME 类型
        if (path.endsWith('.mp3')) {
            res.set('Content-Type', 'audio/mpeg');
        } else if (path.endsWith('.wav')) {
            res.set('Content-Type', 'audio/wav');
        } else if (path.endsWith('.ogg')) {
            res.set('Content-Type', 'audio/ogg');
        } else if (path.endsWith('.flac')) {
            res.set('Content-Type', 'audio/flac');
        }
        
        // 设置缓存控制
        res.set('Cache-Control', 'public, max-age=31536000');
        
        // 设置跨域头
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Range, Content-Type, Authorization');
        res.set('Access-Control-Expose-Headers', 'Content-Range, Content-Length, Accept-Ranges');
        res.set('Accept-Ranges', 'bytes');
    }
};

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), staticOptions));
app.use('/public', express.static(path.join(__dirname, '../public'), staticOptions));
app.use('/localmusics', express.static(path.join(__dirname, '../public/localmusics'), staticOptions));
app.use('/images', express.static(path.join(__dirname, '../public/images'), staticOptions));

// API 路由
app.use('/api/health', healthRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// 添加对音频范围请求的支持
app.get('/localmusics/*', (req, res, next) => {
    if (req.headers.range) {
        const audioPath = path.join(__dirname, '../public/localmusics', req.params[0]);
        const stat = fs.statSync(audioPath);
        const range = req.headers.range;
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;
        
        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${stat.size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'audio/mpeg'
        });
        
        const stream = fs.createReadStream(audioPath, { start, end });
        stream.pipe(res);
    } else {
        next();
    }
});

// 添加测试路由
app.get('/test', (req, res) => {
    res.json({
        success: true,
        message: 'API 服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 处理 404 错误
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '请求的资源不存在'
    });
});

// 错误处理中间件
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : '未知错误'
    });
});

// 启动服务器
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    logger.info(`服务器运行在 http://localhost:${port}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
    logger.error('未捕获的 Promise 拒绝:', err);
    // 优雅地关闭服务器
    server.close(() => {
        process.exit(1);
    });
}); 