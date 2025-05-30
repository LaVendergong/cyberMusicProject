const Song = require('../models/Song');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

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

// 获取歌曲信息
exports.getSongInfo = async (req, res) => {
    try {
        const songId = req.params.id;
        logger.info(`正在查询歌曲ID: ${songId}`);

        // 验证 ID 格式
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            logger.warn(`无效的歌曲ID格式: ${songId}`);
            return res.status(400).json({
                success: false,
                message: '无效的歌曲ID格式'
            });
        }

        const song = await Song.findById(songId).select('-__v');
        
        if (!song) {
            logger.warn(`未找到歌曲: ${songId}`);
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        // 直接返回歌曲数据
        res.json(song);
    } catch (error) {
        logger.error('获取歌曲信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取歌曲信息失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
        });
    }
};

// 获取歌曲音频文件
exports.getSongAudio = async (req, res) => {
    try {
        const songId = req.params.id;
        logger.info(`正在获取歌曲音频: ${songId}`);

        // 验证 ID 格式
        if (!mongoose.Types.ObjectId.isValid(songId)) {
            logger.warn(`无效的歌曲ID格式: ${songId}`);
            return res.status(400).json({
                success: false,
                message: '无效的歌曲ID格式'
            });
        }

        const song = await Song.findById(songId);
        
        if (!song) {
            logger.warn(`未找到歌曲: ${songId}`);
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        // 检查文件是否存在
        const filePath = path.join(__dirname, '../../uploads', song.songPath);
        logger.info(`检查文件路径: ${filePath}`);

        if (!fs.existsSync(filePath)) {
            logger.warn(`文件不存在: ${filePath}`);
            return res.status(404).json({
                success: false,
                message: '音频文件不存在'
            });
        }

        // 获取文件信息
        const stat = fs.statSync(filePath);
        const fileSize = stat.size;
        const range = req.headers.range;

        if (range) {
            // 处理范围请求
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(filePath, { start, end });
            
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': 'audio/mpeg'
            });
            
            file.pipe(res);
        } else {
            // 完整文件请求
            res.writeHead(200, {
                'Content-Length': fileSize,
                'Content-Type': 'audio/mpeg'
            });
            
            fs.createReadStream(filePath).pipe(res);
        }
    } catch (error) {
        logger.error('获取歌曲音频失败:', error);
        res.status(500).json({
            success: false,
            message: '获取歌曲音频失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
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
            title: req.body.title,
            artist: req.body.artist,
            album: req.body.album,
            duration: req.body.duration,
            filePath: req.files.song[0].filename,
            coverImage: req.files.cover ? req.files.cover[0].filename : null,
            genre: req.body.genre ? req.body.genre.split(',') : [],
            tags: req.body.tags ? req.body.tags.split(',') : []
        });

        const savedSong = await song.save();
        res.status(201).json({
            success: true,
            data: savedSong
        });
    } catch (error) {
        logger.error('添加歌曲失败:', error);
        res.status(500).json({
            success: false,
            message: '添加歌曲失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
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
        logger.error('更新歌曲失败:', error);
        res.status(500).json({
            success: false,
            message: '更新歌曲失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
        });
    }
};

// 删除歌曲
exports.deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        
        if (!song) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }

        // 删除文件
        const filePath = path.join(__dirname, '../../uploads', song.filePath);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        // 删除封面图片
        if (song.coverImage) {
            const coverPath = path.join(__dirname, '../../uploads', song.coverImage);
            if (fs.existsSync(coverPath)) {
                fs.unlinkSync(coverPath);
            }
        }

        await song.remove();

        res.json({
            success: true,
            message: '歌曲已成功删除'
        });
    } catch (error) {
        logger.error('删除歌曲失败:', error);
        res.status(500).json({
            success: false,
            message: '删除歌曲失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
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
        logger.error('更新播放次数失败:', error);
        res.status(500).json({
            success: false,
            message: '更新播放次数失败',
            error: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
        });
    }
}; 