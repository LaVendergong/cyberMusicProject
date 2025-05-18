const Song = require('../db/songSchema');

// 获取所有歌曲
exports.getAllSongs = async (req, res) => {
    try {
        const songs = await Song.find({});
        res.json({
            success: true,
            data: songs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 获取单个歌曲
exports.getSongById = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
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
            message: error.message
        });
    }
};

// 创建新歌曲
exports.createSong = async (req, res) => {
    try {
        const newSong = new Song(req.body);
        const savedSong = await newSong.save();
        res.status(201).json({
            success: true,
            data: savedSong
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 更新歌曲
exports.updateSong = async (req, res) => {
    try {
        const updatedSong = await Song.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSong) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }
        res.json({
            success: true,
            data: updatedSong
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// 删除歌曲
exports.deleteSong = async (req, res) => {
    try {
        const deletedSong = await Song.findByIdAndDelete(req.params.id);
        if (!deletedSong) {
            return res.status(404).json({
                success: false,
                message: '歌曲不存在'
            });
        }
        res.json({
            success: true,
            message: '歌曲已删除'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 搜索歌曲
exports.searchSongs = async (req, res) => {
    try {
        const { keyword } = req.query;
        const songs = await Song.find({
            $or: [
                { songName: { $regex: keyword, $options: 'i' } },
                { singer: { $regex: keyword, $options: 'i' } },
                { album: { $regex: keyword, $options: 'i' } }
            ]
        });
        res.json({
            success: true,
            data: songs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 