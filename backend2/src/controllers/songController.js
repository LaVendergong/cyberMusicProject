const Song = require('../models/Song');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// 获取所有歌曲
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find().select('-__v');
        res.json({
            success: true,
            data: songs
        });
    } catch (error) {
        logger.error('获取歌曲列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取歌曲列表失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
        });
    }
};

// 获取单个歌曲
exports.getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id).select('-__v');
        if (!song) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }
        res.json({
            success: true,
            data: song
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取歌曲详情失败',
            error: error.message
        });
    }
};

// 添加新歌曲
exports.createSong = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const song = new Song({
            songName: req.body.songName,
            singer: req.body.singer,
            duration: req.body.duration,
            songPath: req.body.songPath,
            imgPath: req.body.imgPath,
            lyrics: req.body.lyrics
        });

        const savedSong = await song.save();
        res.status(201).json({
            success: true,
            data: savedSong
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '添加歌曲失败',
            error: error.message
        });
    }
};

// 更新歌曲信息
exports.updateSong = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const song = await Song.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!song) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        res.json({
            success: true,
            data: song
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新歌曲失败',
            error: error.message
        });
    }
};

// 删除歌曲
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findByIdAndDelete(req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        res.json({
            success: true,
            message: '歌曲已成功删除'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除歌曲失败',
            error: error.message
        });
    }
};

// 增加播放次数
exports.incrementPlayCount = async (req, res) => {
    try {
        const song = await Song.findByIdAndUpdate(
            req.params.id,
            { $inc: { playCount: 1 } },
            { new: true }
        );

        if (!song) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        res.json({
            success: true,
            data: song
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新播放次数失败',
            error: error.message
        });
    }
}; 