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
            <li data-song-id="${song._id}">
                <div class="song">
                    <div class="songimg">
                        <img src="${back + song.imgPath}" alt="${song.songName}">
                    </div>
                    <div class="songname">
                        <span class="name">${song.songName}</span>
                        <span class="singer">${song.singer}</span>
                    </div>
                    <div class="songtime">
                        <span class="time">${Math.floor(song.duration/60)}:${song.duration%60 < 10?'0'+song.duration%60:song.duration%60}</span>
                    </div>
                    <div class="operation">
                        <span class="delete"></span>
                    </div>
                </div>
                
            </li>  
            `;
        }
    });

    // 绑定播放和删除按钮的事件
    bindLikedListEvents();
}

// 添加事件绑定函数
function bindLikedListEvents() {
    const likedList = document.querySelector('.songlist ul:nth-child(2)');
    const songlist = window.MusicPlayer.songlist;

    // 绑定图片点击播放事件
    const songImages = likedList.querySelectorAll('.songimg');
    songImages.forEach(image => {
        image.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            const songId = li.dataset.songId;
            const songIndex = songlist.findIndex(song => song._id === songId);
            
            // 移除其他歌曲的playing类
            songImages.forEach(img => img.classList.remove('playing'));
            
            if (songIndex !== -1) {
                // 如果点击的是当前播放的歌曲
                if (window.playingSong === songIndex && !audio.paused) {
                    audio.pause();
                    image.classList.remove('playing');
                } else {
                    window.playingSong = songIndex;
                    updateSong(songIndex);
                    image.classList.add('playing');
                    
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                        mainContent.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            }
        });
    });

    // 绑定删除按钮事件
    const deleteButtons = likedList.querySelectorAll('.operation .delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            const songId = li.dataset.songId;
            
            // 从喜欢列表中移除
            removeFromLikedList(songId);
            
            // 更新主列表中对应歌曲的"加入歌单"按钮状态
            const mainListAddButton = document.querySelector(`.songlist ul:first-child li[data-song-id="${songId}"] .operation .add`);
            if (mainListAddButton) {
                mainListAddButton.classList.remove('added');
            }
        });
    });
}

// 更新播放状态显示
function updateLikedListPlayingStatus() {
    const songImages = document.querySelector('.songlist ul:nth-child(2)').querySelectorAll('.songimg');
    songImages.forEach(image => {
        const li = image.closest('li');
        const songId = li.dataset.songId;
        const songIndex = window.MusicPlayer.songlist.findIndex(song => song._id === songId);
        
        if (songIndex === window.playingSong && !audio.paused) {
            image.classList.add('playing');
        } else {
            image.classList.remove('playing');
        }
    });
}

// 监听音频播放状态变化
audio.addEventListener('play', updateLikedListPlayingStatus);
audio.addEventListener('pause', updateLikedListPlayingStatus);

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