const mongoose = require('mongoose');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
require('dotenv').config();

// 测试数据
const songs = [
    {songName: '华鸟风月', singer: 'senya', album: 'Imagine', duration: 346, genre: 'Touhou', releaseDate: '2012-05-27', songPath: '/localmusics/1141641196.mp3',imgPath: '/images/1364980325.jpg'},
    {songName: 'Lengsel', singer: 'Rigel Theatre', album: 'Lengsel - Ghosts of Memories -（2nd）', duration: 302, genre: 'Rigel', releaseDate: '2019-04-28', songPath: '/localmusics/M500000Chlmc3w2fol.mp3',imgPath: '/images/1710178784.jpg'},
    {songName: 'Riness -Ghosts of Memories', singer: 'Rigel Theatre&Miwele', album: 'Lengsel - Ghosts of Memories -（2nd）', duration: 350, genre: 'Rigel', releaseDate: '2019-04-28', songPath: '/localmusics/M500002MCk5I4bl9YC.mp3',imgPath: '/images/397886913.jpg'}
];

const playlists = [
    {
        name: "我的收藏",
        description: "我喜欢的歌曲",
        coverImage: "/images/default-playlist.jpg",
        songs: [] // 将在添加歌曲后更新
    },
    {
        name: "最近播放",
        description: "最近听过的歌曲",
        coverImage: "/images/default-playlist.jpg",
        songs: [] // 将在添加歌曲后更新
    }
];

// 连接数据库
const connectDB = async () => {
    try {
        const dbName = 'music';
        const uri = process.env.MONGODB_URI.endsWith(dbName) 
            ? process.env.MONGODB_URI 
            : `${process.env.MONGODB_URI}/${dbName}`;

        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: dbName
        });
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
        process.exit(1);
    }
};

// 初始化数据
const initData = async () => {
    try {
        // 清空现有数据
        await Song.deleteMany({});
        await Playlist.deleteMany({});
        console.log('已清空现有数据');

        // 添加歌曲
        const addedSongs = await Song.insertMany(songs);
        console.log('已添加歌曲数据');

        // 更新播放列表中的歌曲引用
        playlists[0].songs = addedSongs.slice(0, 2).map(song => song._id);
        playlists[1].songs = addedSongs.slice(1, 3).map(song => song._id);

        // 添加播放列表
        await Playlist.insertMany(playlists);
        console.log('已添加播放列表数据');

        console.log('数据初始化完成！');
    } catch (error) {
        console.error('数据初始化失败:', error);
    } finally {
        // 关闭数据库连接
        await mongoose.connection.close();
        console.log('数据库连接已关闭');
    }
};

// 执行初始化
connectDB().then(() => {
    initData();
}); 