const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

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

// CORS 配置
const corsOptions = {
    origin: function(origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
            process.env.ALLOWED_ORIGINS.split(',') : 
            ['https://lavendergong.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000'];
            
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('不允许的源'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Range', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204
};

// 应用 CORS 中间件
app.use(cors(corsOptions));

// 添加安全头
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['https://lavendergong.github.io', 'http://localhost:3000', 'http://127.0.0.1:3000'];
        
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Expose-Headers', corsOptions.exposedHeaders.join(', '));
    res.setHeader('Access-Control-Max-Age', corsOptions.maxAge);
    
    // 设置缓存控制
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(204).end();
    }
    next();
});

// 安全头配置
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false
}));

// 日志配置
app.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务配置
const staticOptions = {
    setHeaders: (res, path, stat) => {
        // 设置跨域头
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
        
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
        
        // 支持音频流式传输
        res.set('Accept-Ranges', 'bytes');
    }
};

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), staticOptions));
// 配置公共资源访问
app.use('/public', express.static(path.join(__dirname, '../public'), staticOptions));
app.use('/localmusics', express.static(path.join(__dirname, '../public/localmusics'), {
    ...staticOptions,
    setHeaders: (res, path, stat) => {
        staticOptions.setHeaders(res, path, stat);
        // 额外的音频相关头部
        res.set('Cache-Control', 'public, max-age=3600');
        res.set('Accept-Ranges', 'bytes');
    }
}));
app.use('/images', express.static(path.join(__dirname, '../public/images'), staticOptions));

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

// API 路由
app.use('/api/health', healthRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

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
    if (err.name === 'CORSError') {
        return res.status(403).json({
            success: false,
            message: 'CORS 错误：' + err.message
        });
    }
    next(err);
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    logger.info(`服务器运行在 http://localhost:${PORT}`);
});

// 处理未捕获的异常
process.on('unhandledRejection', (err) => {
    logger.error('未捕获的 Promise 拒绝:', err);
    // 优雅地关闭服务器
    server.close(() => {
        process.exit(1);
    });
}); 