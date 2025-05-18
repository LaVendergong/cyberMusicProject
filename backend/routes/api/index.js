const express = require('express');
const cors = require('cors');
const connection = require('../../db/connection');
const songModel = require('../../db/songSchema');
const songController = require('../../controllers/songController');

const router = express.Router();

// 歌曲相关路由
router.get('/songs', songController.getAllSongs);
router.get('/songs/search', songController.searchSongs);
router.get('/songs/:id', songController.getSongById);
router.post('/songs', songController.createSong);
router.put('/songs/:id', songController.updateSong);
router.delete('/songs/:id', songController.deleteSong);

module.exports = router;