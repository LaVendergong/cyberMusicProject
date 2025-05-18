const mongoose = require('mongoose');

// 连接 MongoDB 数据库
const connectDB = async (succeed, wrong) => {
    try {
        // 使用环境变量中的MongoDB连接字符串，如果没有则使用本地数据库
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/music';
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB connected successfully');
        if (succeed) succeed();
    } catch (error) {
        console.error('MongoDB connection error:', error);
        if (wrong) wrong(error);
        // 在生产环境中不要直接退出进程
        if (process.env.NODE_ENV === 'development') {
            process.exit(1);
        }
    }
};

module.exports = connectDB;
