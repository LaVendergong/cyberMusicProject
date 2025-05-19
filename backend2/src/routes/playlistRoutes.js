const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const playlistController = require('../controllers/playlistController');

// 验证规则
const playlistValidation = [
    body('name').notEmpty().withMessage('播放列表名称不能为空'),
    body('description').optional(),
    body('songs').optional().isArray().withMessage('歌曲列表必须是数组')
];

// 获取所有播放列表
router.get('/', playlistController.getAllPlaylists);

// 获取单个播放列表
router.get('/:id', playlistController.getPlaylistById);

// 创建播放列表
router.post('/', playlistValidation, playlistController.createPlaylist);

// 更新播放列表
router.put('/:id', playlistValidation, playlistController.updatePlaylist);

// 删除播放列表
router.delete('/:id', playlistController.deletePlaylist);

// 添加歌曲到播放列表
router.post('/:id/songs', 
    body('songId').notEmpty().withMessage('歌曲ID不能为空'),
    playlistController.addSongToPlaylist
);

// 从播放列表移除歌曲
router.delete('/:id/songs/:songId', playlistController.removeSongFromPlaylist);

module.exports = router; 