const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
    songName: {
        type: String,
        required: [true, '歌曲名称是必需的'],
        trim: true
    },
    singer: {
        type: String,
        required: [true, '歌手名称是必需的'],
        trim: true
    },
    duration: {
        type: Number,
        required: [true, '歌曲时长是必需的']
    },
    songPath: {
        type: String,
        required: [true, '歌曲文件路径是必需的']
    },
    imgPath: {
        type: String,
        required: [true, '封面图片路径是必需的']
    },
    lyrics: {
        type: String,
        default: ''
    },
    playCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// 更新时自动更新updatedAt字段
songSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Song', songSchema); 