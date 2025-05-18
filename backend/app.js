require('dotenv').config();
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors');
const connectDB = require('./db/connection');

// 连接数据库
connectDB(
  () => console.log('Database connected successfully'),
  (err) => console.error('Database connection error:', err)
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const apiRouter = require('./routes/api')

var app = express();

// 基本中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// CORS 配置
app.use(cors({
  origin: ['*',
    'http://127.0.0.1:5501',
    'http://localhost:5501',
    'http://192.168.214.174:5501',
    'http://192.168.214.174:3000',
    'http://127.0.0.1:3000',
    'http://localhost:3000',
    'https://lavendergong.github.io/cyberMusicProject'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH']
}));

// 静态文件服务
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res) => {
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.set('Access-Control-Allow-Credentials', 'true');
  }
}));

// API 路由
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api', apiRouter);

// 404 处理
app.use(function(req, res, next) {
  next(createError(404));
});

// 错误处理
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 设置端口
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
