const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
    try {
        logger.info('正在连接数据库...');
        // 确保连接字符串包含数据库名称
        const dbName = 'music_player'; // 指定数据库名称
        const uri = process.env.MONGODB_URI.endsWith(dbName) 
            ? process.env.MONGODB_URI 
            : `${process.env.MONGODB_URI}/${dbName}`;
            
        logger.info(`数据库URI: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')}`);

        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            retryWrites: true,
            retryReads: true,
            maxPoolSize: 10,
            minPoolSize: 5,
            heartbeatFrequencyMS: 2000,
            family: 4,
            dbName: 'music' // 显式指定数据库名称
        };

        const conn = await mongoose.connect(uri, options);
        
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
        logger.error(`数据库连接错误: ${error.message}`);
        logger.error('错误详情:', error);
        logger.info('5秒后尝试重新连接...');
        setTimeout(connectDB, 5000);
    }
};

module.exports = connectDB; 