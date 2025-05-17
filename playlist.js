const list = document.querySelector('.songlist ul');
const playBtn = document.querySelector('.play-btn');
let playingSong = 0;

function updatePlayIcon() {
    playBtn.innerHTML = audio.paused 
        ? '<i class="fas fa-play"></i>' 
        : '<i class="fas fa-pause"></i>';
}

// 使用全局对象中的songlist来更新UI
function updatePlaylistUI(songlist) {
    if (!songlist || !Array.isArray(songlist)) return;
    
    const back = 'http://127.0.0.1:3000/';
    list.innerHTML = ''; // 清空现有列表
    
    songlist.forEach((item, index) => {
        const isLiked = window.MusicPlayer.likedList.isLiked(item._id);
        list.innerHTML += `
        <li data-song-id="${item._id}">
            <div class="song">
                <div class="songimg">
                    <img src=${back+item.imgPath} alt="">
                </div>
                <div class="songname">
                    <span class="name">${item.songName}</span>
                    <span class="singer">${item.singer}</span>
                </div>
                <div class="songtime">
                    <span class="time">${`${Math.floor(item.duration/60)}:${item.duration%60 < 10?'0'+item.duration%60:item.duration%60}`}</span>
                </div>
                <div class="operation">
                    <span class="add ${isLiked ? 'added' : ''}"></span>
                </div>
            </div>
            
        </li>
        `;
    });

    // 重新绑定事件监听器
    bindPlaylistEvents();
}

// ==================== 播放历史系统 ====================
const HISTORY_STORAGE_KEY = 'playHistory';
const MAX_HISTORY_LENGTH = 50; // 最大历史记录数量

// 从本地存储加载播放历史
function loadPlayHistory() {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// 保存播放历史到本地存储
function savePlayHistory(history) {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    // 触发历史记录更新事件
    window.MusicPlayer.EventBus.emit('play-history-updated', history);
}

// 添加歌曲到播放历史
function addToPlayHistory(songId) {
    const history = loadPlayHistory();
    
    // 如果歌曲已在历史记录中，先移除旧记录
    const index = history.indexOf(songId);
    if (index !== -1) {
        history.splice(index, 1);
    }
    
    // 在开头添加新记录
    history.unshift(songId);
    
    // 如果超出最大长度，删除多余记录
    if (history.length > MAX_HISTORY_LENGTH) {
        history.splice(MAX_HISTORY_LENGTH);
    }
    
    savePlayHistory(history);
}

// 清空播放历史
function clearPlayHistory() {
    savePlayHistory([]);
}

// 获取播放历史
function getPlayHistory() {
    return loadPlayHistory();
}

// ==================== 音频预加载系统 ====================
class AudioPreloader {
    constructor() {
        this.preloadCache = new Map(); // 用于存储预加载的音频
        this.maxCacheSize = 5; // 最大缓存数量
        this.back = 'http://127.0.0.1:3000/';
    }

    // 预加载音频
    preload(songPath) {
        if (!songPath || this.preloadCache.has(songPath)) return;

        const audio = new Audio();
        audio.preload = 'auto';
        audio.src = this.back + songPath;
        
        // 加载一定数据后停止
        audio.addEventListener('loadeddata', () => {
            if (this.preloadCache.size >= this.maxCacheSize) {
                // 如果缓存已满，删除最早的条目
                const firstKey = this.preloadCache.keys().next().value;
                this.preloadCache.delete(firstKey);
            }
            this.preloadCache.set(songPath, audio);
        });

        // 错误处理
        audio.addEventListener('error', (e) => {
            console.error('预加载失败:', songPath, e);
            this.preloadCache.delete(songPath);
        });
    }

    // 获取预加载的音频
    getPreloadedAudio(songPath) {
        return this.preloadCache.get(songPath);
    }

    // 清理预加载缓存
    clearCache() {
        this.preloadCache.clear();
    }
}

// 创建预加载器实例
const audioPreloader = new AudioPreloader();

// 修改updateSong函数，集成预加载功能
function updateSong(index) {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist || !songlist[index]) return;

    // 添加到播放历史
    addToPlayHistory(songlist[index]._id);
    
    let paused = audio.paused;
    const back = 'http://127.0.0.1:3000/';

    const name = document.querySelector('.track-title');
    name.innerHTML = songlist[index].songName;
    const singer = document.querySelector('.artist');
    singer.innerHTML = songlist[index].singer;
    const startTime = document.querySelector('.current-time');
    startTime.innerHTML = `00:00`;
    document.querySelector('.duration').innerHTML = `${Math.floor(songlist[index].duration/60)}:${songlist[index].duration%60 < 10?'0'+songlist[index].duration%60:songlist[index].duration%60}`;
    
    // 检查是否有预加载的音频
    const preloadedAudio = audioPreloader.getPreloadedAudio(songlist[index].songPath);
    if (preloadedAudio) {
        // 如果有预加载的音频，使用它
        audio.src = preloadedAudio.src;
        audio.currentTime = 0;
    } else {
        // 如果没有预加载，正常加载
        audio.src = back + songlist[index].songPath;
    }

    const picture = document.querySelector('.album-art img');
    picture.src = back + songlist[index].imgPath;
    const progressBar = document.querySelector('.progress');
    progressBar.style.width = '0%';
    
    updatePlayIcon();
    if (!paused) {
        audio.play();
    }
    updatePlayIcon();

    // 预加载下一首和上一首
    preloadNextSongs(index);
}

// 预加载相邻歌曲
function preloadNextSongs(currentIndex) {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist) return;

    // 预加载下一首
    const nextIndex = (currentIndex + 1) % songlist.length;
    if (songlist[nextIndex]) {
        audioPreloader.preload(songlist[nextIndex].songPath);
    }

    // 预加载上一首
    const prevIndex = (currentIndex - 1 + songlist.length) % songlist.length;
    if (songlist[prevIndex]) {
        audioPreloader.preload(songlist[prevIndex].songPath);
    }
}

function bindPlaylistEvents() {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist) return;

    // 绑定图片点击播放事件
    const songImages = document.querySelectorAll('.songlist.recommended ul .songimg');
    songImages.forEach((item, index) => {
        item.addEventListener('click', () => {
            // 移除其他歌曲的playing类
            songImages.forEach(img => img.classList.remove('playing'));
            
            // 如果点击的是当前播放的歌曲
            if (playingSong === index && !audio.paused) {
                audio.pause();
                item.classList.remove('playing');
            } else {
                playingSong = index;
                updateSong(playingSong);
                item.classList.add('playing');
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    const addList = document.querySelectorAll('.operation .add');
    addList.forEach((item, index) => {
        const songId = item.closest('li').dataset.songId;
        
        item.addEventListener('click', () => {
            if(window.MusicPlayer.likedList.isLiked(songId)){ 
                window.MusicPlayer.likedList.remove(songId);
                item.classList.remove('added');
            } else {
                window.MusicPlayer.likedList.add(songId);
                item.classList.add('added');
            }
        });
    });
}

// 更新播放状态显示
function updatePlayingStatus() {
    const songImages = document.querySelectorAll('.songlist.recommended ul .songimg');
    songImages.forEach((item, index) => {
        if (index === playingSong && !audio.paused) {
            item.classList.add('playing');
        } else {
            item.classList.remove('playing');
        }
    });
}

// 监听音频播放状态变化
audio.addEventListener('play', updatePlayingStatus);
audio.addEventListener('pause', updatePlayingStatus);

// 更新收藏按钮状态
function updateLikeButtonStatus() {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist) return;

    const addButtons = document.querySelectorAll('.songlist.recommended ul li');
    addButtons.forEach(li => {
        const songId = li.dataset.songId;
        const addButton = li.querySelector('.operation .add');
        if (window.MusicPlayer.likedList.isLiked(songId)) {
            addButton.classList.add('added');
        } else {
            addButton.classList.remove('added');
        }
    });
}

// 监听liked-songs-updated事件来更新按钮状态
window.MusicPlayer.EventBus.on('liked-songs-updated', () => {
    updateLikeButtonStatus();
});

// 修改原有的playlist-loaded事件监听
window.MusicPlayer.EventBus.on('playlist-loaded', (songlist) => {
    updatePlaylistUI(songlist);
    if (audio) {
        updateEndedListener(audio, songlist);
        // 预加载第一首歌
        if (songlist && songlist.length > 0) {
            audioPreloader.preload(songlist[0].songPath);
        }
    }
    renderPlayHistory();
});

// 播放控制相关事件
const prevBtn = document.querySelector('.controls .before');
const nextBtn = document.querySelector('.controls .after');

prevBtn.addEventListener('click', () => {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist || !songlist.length) return;

    playingSong -= 1;
    if (playingSong < 0) {
        playingSong = songlist.length - 1;
    }
    updateSong(playingSong);
});

nextBtn.addEventListener('click', () => {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist || !songlist.length) return;

    playingSong += 1;
    if (playingSong >= songlist.length) {
        playingSong = 0;
    }
    updateSong(playingSong);
});

// 播放模式控制
let playMode = 0;
function updateEndedListener(audio, songlist) {
    if (!audio || !songlist || !songlist.length) {
        console.log('音频元素或歌曲列表未就绪');
        return;
    }

    // 如果之前有事件监听器，先移除它
    if (endedHandler) {
        audio.removeEventListener('ended', endedHandler);
    }

    switch(playMode) {
        case 0: // 顺序播放
            endedHandler = () => {
                console.log('歌曲播放结束，切换到下一首');
                playingSong += 1;
                if (playingSong >= songlist.length) {
                    playingSong = 0;
                }
                updateSong(playingSong);
                audio.play().catch(err => console.log('自动播放失败:', err));
                updatePlayIcon();
            };
            break;
        case 1: // 随机播放
            endedHandler = () => {
                console.log('歌曲播放结束，随机切换');
                let newIndex;
                do {
                    newIndex = Math.floor(Math.random() * songlist.length);
                } while (newIndex === playingSong && songlist.length > 1);
                
                playingSong = newIndex;
                updateSong(playingSong);
                audio.play().catch(err => console.log('自动播放失败:', err));
                updatePlayIcon();
            };
            break;
        case 2: // 单曲循环
            endedHandler = () => {
                console.log('歌曲播放结束，重新播放当前歌曲');
                updateSong(playingSong);
                audio.play().catch(err => console.log('自动播放失败:', err));
                updatePlayIcon();
            };
            break;
    }

    // 添加事件监听器
    audio.addEventListener('ended', endedHandler);
    console.log('已设置ended事件监听器，当前播放模式:', playMode);
}

let endedHandler = null;

// 确保在DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    if (audio) {
        updateEndedListener(audio, window.MusicPlayer.songlist);
    }
});

const modeBtn = document.querySelector('.controls .mode');
modeBtn.addEventListener('click', () => {
    playMode += 1;
    if (playMode >= 3) {
        playMode = 0;
    }
    updateEndedListener(audio, window.MusicPlayer.songlist);
    switch(playMode) {
        case 0:
            modeBtn.innerHTML = `<i class="fa-solid fa-right-long"></i>`;
            break;
        case 1:
            modeBtn.innerHTML = `<i class="fas fa-random"></i>`;
            break;
        case 2:
            modeBtn.innerHTML = `<i class="fas fa-redo"></i>`;
            break;
    }
    // 触发播放模式改变事件
    window.MusicPlayer.EventBus.emit('playmode-changed', playMode);
});

// 渲染播放历史列表
function renderPlayHistory() {
    const historyList = document.querySelector('.songlist ul:nth-child(3)'); // 假设第三个ul是播放历史列表
    if (!historyList) return;

    const history = loadPlayHistory();
    const songlist = window.MusicPlayer.songlist;
    const back = 'http://127.0.0.1:3000/';

    historyList.innerHTML = ''; // 清空现有列表
    
    history.forEach(songId => {
        const song = songlist.find(s => s._id === songId);
        if (song) {
            historyList.innerHTML += `
            <li data-song-id="${song._id}">
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
                        <span class="remove">移除</span>
                    </div>
                </div>
            </li>
            `;
        }
    });

    // 绑定播放历史列表的事件
    bindHistoryListEvents();
}

// 绑定播放历史列表的事件
function bindHistoryListEvents() {
    const historyList = document.querySelector('.songlist ul:nth-child(3)');
    if (!historyList) return;

    // 绑定播放按钮事件
    const playButtons = historyList.querySelectorAll('.operation .play');
    playButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            const songId = li.dataset.songId;
            const songIndex = window.MusicPlayer.songlist.findIndex(song => song._id === songId);
            
            if (songIndex !== -1) {
                playingSong = songIndex;
                updateSong(songIndex);
                
                const mainContent = document.querySelector('main');
                if (mainContent) {
                    mainContent.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 绑定移除按钮事件
    const removeButtons = historyList.querySelectorAll('.operation .remove');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const li = e.target.closest('li');
            const songId = li.dataset.songId;
            const history = loadPlayHistory();
            const index = history.indexOf(songId);
            
            if (index !== -1) {
                history.splice(index, 1);
                savePlayHistory(history);
            }
        });
    });
}

// 将播放历史功能添加到全局对象
window.MusicPlayer = window.MusicPlayer || {};
window.MusicPlayer.playHistory = {
    add: addToPlayHistory,
    clear: clearPlayHistory,
    getAll: getPlayHistory
};

// 监听播放历史更新事件
window.MusicPlayer.EventBus.on('play-history-updated', () => {
    renderPlayHistory();
});

// 监听音频加载状态
audio.addEventListener('loadstart', () => {
    // 显示加载状态
    const playBtn = document.querySelector('.play-btn');
    playBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
});

audio.addEventListener('canplay', () => {
    // 恢复正常图标
    const playBtn = document.querySelector('.play-btn');
    playBtn.innerHTML = audio.paused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
});


