const mongoose = require('mongoose');

// MongoDB 连接选项
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 15000, // 超时时间设置为 15 秒
    socketTimeoutMS: 45000, // Socket 超时设置为 45 秒
    family: 4, // 强制使用 IPv4
    maxPoolSize: 10, // 连接池大小
    connectTimeoutMS: 15000, // 连接超时时间
};

// 连接 MongoDB 数据库
const connectDB = async (succeed, wrong) => {
    try {
        // 使用环境变量中的MongoDB连接字符串，如果没有则使用本地数据库
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/music';
        
        // 连接数据库
        const conn = await mongoose.connect(uri, mongooseOptions);
        
        // 监听连接事件
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        // 优雅关闭连接
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            process.exit(0);
        });
        
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        if (succeed) succeed();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (wrong) wrong(error);
        
        // 在生产环境中尝试重新连接
        if (process.env.NODE_ENV === 'production') {
            console.log('Attempting to reconnect to MongoDB...');
            setTimeout(() => connectDB(succeed, wrong), 5000); // 5秒后重试
        } else {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
