const mongoose = require('mongoose');
const Song = require('../models/Song');
const logger = require('../utils/logger');

const sampleSongs = [
    {
        songName: "测试歌曲1",
        singer: "测试歌手1",
        album: "测试专辑1",
        duration: 180,
        genre: "流行",
        releaseDate: "2024-05-24",
        songPath: "/localmusics/test1.mp3",
        imgPath: "/localmusics/test1.jpg"
    },
    {
        songName: "测试歌曲2",
        singer: "测试歌手2",
        album: "测试专辑2",
        duration: 240,
        genre: "摇滚",
        releaseDate: "2024-05-24",
        songPath: "/localmusics/test2.mp3",
        imgPath: "/localmusics/test2.jpg"
    }
];

const seedDatabase = async () => {
    try {
        // 连接数据库
        await mongoose.connect('mongodb://localhost:27017/music', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // 清空现有数据
        await Song.deleteMany({});
        logger.info('已清空现有数据');

        // 插入新数据
        const songs = await Song.insertMany(sampleSongs);
        logger.info(`成功插入 ${songs.length} 条测试数据`);

        // 显示插入的数据
        const allSongs = await Song.find();
        logger.info('数据库中的歌曲:', allSongs);

        process.exit(0);
    } catch (error) {
        logger.error('数据种子脚本执行失败:', error);
        process.exit(1);
    }
};

seedDatabase(); 