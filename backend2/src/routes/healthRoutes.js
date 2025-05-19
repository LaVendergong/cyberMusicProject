const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// 健康检查路由
router.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: '服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 数据库状态检查
router.get('/db', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const states = {
        0: '已断开',
        1: '已连接',
        2: '正在连接',
        3: '正在断开'
    };

    res.json({
        status: 'success',
        database: {
            state: states[dbState],
            connected: dbState === 1
        },
        timestamp: new Date().toISOString()
    });
});

module.exports = router; 