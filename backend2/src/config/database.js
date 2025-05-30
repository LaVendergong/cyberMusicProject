const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        logger.info('正在连接数据库...');
        
        // 设置 mongoose 调试模式
        mongoose.set('debug', true);
        
        const conn = await mongoose.connect('mongodb://localhost:27017/music', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        logger.info(`MongoDB 连接成功: ${conn.connection.host}`);
        logger.info(`数据库名称: ${conn.connection.name}`);

        // 测试数据库连接
        const collections = await mongoose.connection.db.listCollections().toArray();
        logger.info('数据库中的集合:', collections.map(c => c.name));

        mongoose.connection.on('connected', () => {
            logger.info(`MongoDB 已连接: ${conn.connection.host}`);
            logger.info(`数据库名称: ${conn.connection.name}`);
            logger.info(`连接状态: ${mongoose.connection.readyState}`);
        });

        mongoose.connection.on('error', (err) => {
            logger.error('MongoDB 连接错误:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB 连接断开，尝试重新连接...');
            setTimeout(connectDB, 5000);
        });

        // 优雅关闭连接
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('MongoDB 连接已关闭');
                process.exit(0);
            } catch (err) {
                logger.error('关闭数据库连接时出错:', err);
                process.exit(1);
            }
        });

    } catch (error) {
        logger.error(`MongoDB 连接错误: ${error.message}`);
        logger.error('错误详情:', error);
        logger.info('5秒后尝试重新连接...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB; 