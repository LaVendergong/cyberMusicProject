// 存储键名
const STORAGE_KEY = 'likedSongs';

// 从本地存储加载喜欢的歌曲列表
function loadLikedSongs() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 保存到本地存储
function saveLikedSongs(songs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
    // 触发事件通知UI更新
    window.MusicPlayer.EventBus.emit('liked-songs-updated', songs);
}

// 添加歌曲到喜欢列表
function addToLikedList(songId) {
    const likedSongs = loadLikedSongs();
    if (!likedSongs.includes(songId)) {
        likedSongs.push(songId);
        saveLikedSongs(likedSongs);
        return true;
    }
    return false;
}

// 从喜欢列表移除歌曲
function removeFromLikedList(songId) {
    const likedSongs = loadLikedSongs();
    const index = likedSongs.indexOf(songId);
    if (index !== -1) {
        likedSongs.splice(index, 1);
        saveLikedSongs(likedSongs);
        return true;
    }
    return false;
}

// 检查歌曲是否在喜欢列表中
function isLiked(songId) {
    const likedSongs = loadLikedSongs();
    return likedSongs.includes(songId);
}

// 获取所有喜欢的歌曲ID
function getAllLikedSongs() {
    return loadLikedSongs();
}

// 清空喜欢列表
function clearLikedList() {
    saveLikedSongs([]);
}

// 获取喜欢歌曲数量
function getLikedCount() {
    return loadLikedSongs().length;
}

// 将所有函数添加到全局MusicPlayer对象中
window.MusicPlayer = window.MusicPlayer || {};
window.MusicPlayer.likedList = {
    add: addToLikedList,
    remove: removeFromLikedList,
    isLiked,
    getAll: getAllLikedSongs,
    clear: clearLikedList,
    getCount: getLikedCount
};

// 创建一个渲染喜欢列表的函数
function renderLikedSongs() {
    const likedList = document.querySelector('.songlist ul:nth-child(2)');
    const likedSongs = loadLikedSongs();
    const songlist = window.MusicPlayer.songlist;
    const back = 'http://127.0.0.1:3000/';

    if (!songlist || !likedList) {
        console.log('等待数据加载...');
        return;
    }

    likedList.innerHTML = ''; // 清空现有列表
    likedSongs.forEach(songId => {
        const song = songlist.find(song => song._id === songId);
        if (song) {
            likedList.innerHTML += `
            <li>
                <div class="song">
                    <div class="songimg">
                        <img src="${back + song.imgPath}" alt="">
                    </div>
                    <div class="songname">
                        <span class="name">${song.songName}</span>
                        <span class="singer">${song.singer}</span>
                    </div>
                    <div class="songtime">
                        <span class="time">${Math.floor(song.duration/60)}:${song.duration%60 < 10?'0'+song.duration%60:song.duration%60}</span>
                    </div>
                    <div class="operation">
                        <a><span class="play">播放</span></a>
                        <span class="delete">删除</span>
                    </div>
                </div>
            </li>  
            `;
        }
    });
}

// 监听DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 如果歌曲列表已经加载，直接渲染
    if (window.MusicPlayer.songlist) {
        renderLikedSongs();
    }
});

// 监听歌曲列表加载完成事件
window.MusicPlayer.EventBus.on('playlist-loaded', () => {
    renderLikedSongs();
});

// 监听喜欢列表更新事件
window.MusicPlayer.EventBus.on('liked-songs-updated', () => {
    renderLikedSongs();
});