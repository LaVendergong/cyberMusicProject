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
    
    songlist.forEach(item => {
        list.innerHTML += `
        <li>
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
            </div>
            <div class="operation">
                <a><span class="play">播放</span></a>
                <span class="add">加入歌单</span>
            </div>
        </li>
        `;
    });

    // 重新绑定事件监听器
    bindPlaylistEvents();
}

function updateSong(index) {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist || !songlist[index]) return;

    
    let paused = audio.paused;
    const back = 'http://127.0.0.1:3000/';

    const name = document.querySelector('.track-title');
    name.innerHTML = songlist[index].songName;
    const singer = document.querySelector('.artist');
    singer.innerHTML = songlist[index].singer;
    const startTime = document.querySelector('.current-time');
    startTime.innerHTML = `00:00`;
    document.querySelector('.duration').innerHTML = `114`;
    
    audio.src = back + songlist[index].songPath;
    const picture = document.querySelector('.album-art img');
    picture.src = back + songlist[index].imgPath;
    const progressBar = document.querySelector('.progress');
    progressBar.style.width = '0%';
    
    updatePlayIcon();
    if (!paused) {
        audio.play();
    }
    updatePlayIcon();
}

function bindPlaylistEvents() {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist) return;

    const play = document.querySelectorAll('.operation .play');
    play.forEach((item, index) => {
        item.addEventListener('click', () => {
            playingSong = index;
            updateSong(playingSong);
            const mainContent = document.querySelector('main');
            if (mainContent) {
                mainContent.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    const addList = document.querySelectorAll('.operation .add');
    addList.forEach((item, index) => {
        const songlist = window.MusicPlayer.songlist;
        item.addEventListener('click', () => {
            if(window.MusicPlayer.likedList.isLiked(songlist[index]._id)){ 
                console.log(songlist[index]._id);
                window.MusicPlayer.likedList.remove(songlist[index]._id);
                item.innerHTML = '加入歌单';
            }else{
                window.MusicPlayer.likedList.add(songlist[index]._id);
                item.innerHTML = '已加入歌单';
            }
        });
    });
}

// 在updatePlaylistUI函数后添加这个新函数
function updateAddButtonStatus() {
    const songlist = window.MusicPlayer.songlist;
    if (!songlist) return;

    const addButtons = document.querySelectorAll('.operation .add');
    addButtons.forEach((button, index) => {
        if (window.MusicPlayer.likedList.isLiked(songlist[index]._id)) {
            button.innerHTML = '已加入歌单';
        } else {
            button.innerHTML = '加入歌单';
        }
    });
}

// 修改原有的playlist-loaded事件监听
window.MusicPlayer.EventBus.on('playlist-loaded', (songlist) => {
    updatePlaylistUI(songlist);
    updateAddButtonStatus();
    if (audio) {
        updateEndedListener(audio, songlist);
    }
});

// 同时也监听liked-songs-updated事件来更新按钮状态
window.MusicPlayer.EventBus.on('liked-songs-updated', () => {
    updateAddButtonStatus();
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


