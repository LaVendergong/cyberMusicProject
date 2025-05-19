const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const songController = require('../controllers/songController');
const upload = require('../middlewares/upload');

// 验证规则
const songValidation = [
    body('songName').notEmpty().withMessage('歌曲名称不能为空'),
    body('singer').notEmpty().withMessage('歌手名称不能为空'),
    body('duration').isNumeric().withMessage('歌曲时长必须是数字'),
    body('songPath').notEmpty().withMessage('歌曲文件路径不能为空'),
    body('imgPath').notEmpty().withMessage('封面图片路径不能为空')
];

// 获取所有歌曲
router.get('/', songController.getAllSongs);

// 获取单个歌曲
router.get('/:id', songController.getSongById);

// 添加新歌曲
router.post('/', 
    upload.fields([
        { name: 'song', maxCount: 1 },
        { name: 'cover', maxCount: 1 }
    ]),
    songValidation,
    songController.createSong
);

// 更新歌曲信息
router.put('/:id', songValidation, songController.updateSong);

// 删除歌曲
router.delete('/:id', songController.deleteSong);

// 增加播放次数
router.post('/:id/play', songController.incrementPlayCount);

module.exports = router; 