const mongoose = require('mongoose');

// 连接 MongoDB 数据库
const connectDB = async (succeed,wrong) => {
    try {
        // 替换为你的 MongoDB 连接字符串
        const uri = 'mongodb://localhost:27017/music'; 
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        succeed()
    } catch (error) {
        wrong(error)
        // 退出进程
        process.exit(1); 
    }
};

module.exports = connectDB;
