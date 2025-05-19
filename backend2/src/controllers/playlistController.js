const Playlist = require('../models/Playlist');
const { validationResult } = require('express-validator');

// 获取所有播放列表
exports.getAllPlaylists = async (req, res) => {
    console.log(process.env.MONGODB_URI)
    req.setHeaders('Access-Control-Allow-Origin', '*');
    try {
        const playlists = await Playlist.find()
            .populate('songs', '-__v')
            .select('-__v');
        
        res.json({
            success: true,
            data: playlists
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取播放列表失败',
            error: error.message
        });
    }
};

// 获取单个播放列表
exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('songs', '-__v')
            .select('-__v');
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '播放列表不存在'
            });
        }

        res.json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取播放列表详情失败',
            error: error.message
        });
    }
};

// 创建播放列表
exports.createPlaylist = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const playlist = new Playlist({
            name: req.body.name,
            description: req.body.description,
            songs: req.body.songs || []
        });

        const savedPlaylist = await playlist.save();
        res.status(201).json({
            success: true,
            data: savedPlaylist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建播放列表失败',
            error: error.message
        });
    }
};

// 更新播放列表
exports.updatePlaylist = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        ).populate('songs', '-__v');

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '播放列表不存在'
            });
        }

        res.json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新播放列表失败',
            error: error.message
        });
    }
};

// 删除播放列表
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndDelete(req.params.id);
        
        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '播放列表不存在'
            });
        }

        res.json({
            success: true,
            message: '播放列表已成功删除'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除播放列表失败',
            error: error.message
        });
    }
};

// 添加歌曲到播放列表
exports.addSongToPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { $addToSet: { songs: req.body.songId } },
            { new: true }
        ).populate('songs', '-__v');

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '播放列表不存在'
            });
        }

        res.json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '添加歌曲到播放列表失败',
            error: error.message
        });
    }
};

// 从播放列表移除歌曲
exports.removeSongFromPlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findByIdAndUpdate(
            req.params.id,
            { $pull: { songs: req.params.songId } },
            { new: true }
        ).populate('songs', '-__v');

        if (!playlist) {
            return res.status(404).json({
                success: false,
                message: '播放列表不存在'
            });
        }

        res.json({
            success: true,
            data: playlist
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '从播放列表移除歌曲失败',
            error: error.message
        });
    }
}; 