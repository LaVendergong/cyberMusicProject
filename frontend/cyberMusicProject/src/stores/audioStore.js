import { defineStore } from 'pinia';
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

export const useAudioStore = defineStore('audio', () => {
    // 音频元素引用
    const audioElement = ref(null);
    
    // 播放状态
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const volume = ref(70);
    const isMuted = ref(false);
    
    // 播放列表相关
    const playlist = ref([]);
    const currentIndex = ref(0);
    const playMode = ref(0); // 0: 顺序播放, 1: 随机播放, 2: 单曲循环
    
    // 当前播放歌曲
    const currentSong = ref({
        _id: '',
        songName: '',
        singer: '',
        album: '',
        duration: 0,
        genre: '',
        releaseDate: '',
        songPath: '',
        imgPath: '',
        createdAt: '',
        updatedAt: '',
        url: '',
        coverUrl: ''
    });

    // 计算属性
    const currentSongInfo = computed(() => {
        const song = playlist.value[currentIndex.value] || currentSong.value;
        console.log('当前歌曲信息:', song);
        return song;
    });

    // 初始化音频元素
    const initAudioElement = (element) => {
        console.log('初始化音频元素:', {
            hasElement: !!element,
            readyState: element?.readyState,
            src: element?.src,
            volume: element?.volume,
            muted: element?.muted
        });

        if (!element) {
            console.error('音频元素不存在');
            return;
        }

        // 如果已经初始化过相同的元素，则跳过
        if (audioElement.value === element) {
            console.log('音频元素已经初始化过，跳过');
            return;
        }

        // 保存当前播放状态
        const wasPlaying = isPlaying.value;
        const currentTime = audioElement.value?.currentTime || 0;
        const currentSrc = audioElement.value?.src;

        // 清理旧的音频元素
        if (audioElement.value) {
            audioElement.value.removeEventListener('timeupdate', updateCurrentTime);
            audioElement.value.removeEventListener('ended', handleEnded);
            audioElement.value.removeEventListener('error', handleError);
        }

        // 设置新的音频元素
        audioElement.value = element;

        // 设置音频属性
        audioElement.value.preload = 'auto';
        audioElement.value.crossOrigin = 'anonymous';
        audioElement.value.volume = volume.value / 100;
        audioElement.value.muted = isMuted.value;

        // 恢复播放状态
        if (currentSrc) {
            audioElement.value.src = currentSrc;
            audioElement.value.currentTime = currentTime;
            if (wasPlaying) {
                audioElement.value.load();
                audioElement.value.play().catch(error => {
                    console.error('恢复播放失败:', error);
                });
            }
        }

        // 添加事件监听器
        audioElement.value.addEventListener('timeupdate', updateCurrentTime);
        audioElement.value.addEventListener('ended', handleEnded);
        audioElement.value.addEventListener('error', handleError);

        console.log('音频元素初始化完成:', {
            readyState: audioElement.value.readyState,
            networkState: audioElement.value.networkState,
            volume: audioElement.value.volume,
            muted: audioElement.value.muted,
            src: audioElement.value.src
        });
    };

    // 监听音频元素变化
    watch(() => audioElement.value, (newElement, oldElement) => {
        console.log('音频元素变化:', {
            hasAudioElement: !!newElement,
            oldElement: !!oldElement,
            isInitialized: false
        });
        
        if (newElement) {
            // 保存当前状态
            const wasPlaying = isPlaying.value;
            const currentTime = oldElement?.currentTime || 0;
            const currentSrc = oldElement?.src;

            // 初始化新元素
            initAudioElement(newElement);

            // 恢复状态
            if (currentSrc) {
                newElement.src = currentSrc;
                newElement.currentTime = currentTime;
                if (wasPlaying) {
                    newElement.load();
                    newElement.play().catch(error => {
                        console.error('恢复播放失败:', error);
                    });
                }
            }
        }
    }, { immediate: true });

    // 音频事件处理函数
    const updateCurrentTime = () => {
        if (audioElement.value) {
            currentTime.value = audioElement.value.currentTime;
            duration.value = audioElement.value.duration;
        }
    };

    const handleEnded = () => {
        console.log('音频播放结束');
        isPlaying.value = false;
        currentTime.value = 0;
        if (playMode.value === 0) {
            nextTrack();
        } else if (playMode.value === 2) {
            audioElement.value.currentTime = 0;
            audioElement.value.play();
        }
    };

    const handleError = (error) => {
        console.error('音频错误:', error);
        isPlaying.value = false;
    };

    // 播放控制方法
    const play = async () => {
        console.log('尝试播放音频:', {
            hasAudioElement: !!audioElement.value,
            readyState: audioElement.value?.readyState,
            networkState: audioElement.value?.networkState,
            src: audioElement.value?.src,
            volume: audioElement.value?.volume,
            muted: audioElement.value?.muted
        });

        if (!audioElement.value) {
            console.error('音频元素不存在');
            return;
        }

        try {
            // 确保音频已加载
            if (audioElement.value.readyState < 2) {
                console.log('等待音频加载...');
                await new Promise((resolve, reject) => {
                    const handleCanPlay = () => {
                        audioElement.value.removeEventListener('canplay', handleCanPlay);
                        audioElement.value.removeEventListener('error', handleError);
                        resolve();
                    };
                    const handleError = (error) => {
                        audioElement.value.removeEventListener('canplay', handleCanPlay);
                        audioElement.value.removeEventListener('error', handleError);
                        reject(error);
                    };
                    audioElement.value.addEventListener('canplay', handleCanPlay);
                    audioElement.value.addEventListener('error', handleError);
                });
            }

            // 确保音量设置正确
            audioElement.value.volume = volume.value / 100;
            audioElement.value.muted = isMuted.value;

            // 播放音频
            await audioElement.value.play();
            isPlaying.value = true;
            console.log('音频开始播放');
        } catch (error) {
            console.error('播放失败:', error);
            isPlaying.value = false;
        }
    };

    const pause = () => {
        console.log('暂停音频');
        if (audioElement.value) {
            audioElement.value.pause();
            isPlaying.value = false;
        }
    };

    const seek = (time) => {
        if (!audioElement.value) return;
        try {
            console.log('跳转到时间:', time);
            audioElement.value.currentTime = time;
            currentTime.value = time;
        } catch (error) {
            console.error('跳转失败:', error);
        }
    };

    const setVolume = (newVolume) => {
        volume.value = Math.max(0, Math.min(100, newVolume));
        if (audioElement.value) {
            audioElement.value.volume = volume.value / 100;
        }
    };

    const toggleMute = () => {
        isMuted.value = !isMuted.value;
        if (audioElement.value) {
            audioElement.value.muted = isMuted.value;
        }
    };

    // 播放列表控制方法
    const addToPlaylist = (song) => {
        playlist.value.push(song);
        savePlaylist();
    };

    const removeFromPlaylist = (index) => {
        playlist.value.splice(index, 1);
        if (currentIndex.value >= playlist.value.length) {
            currentIndex.value = Math.max(0, playlist.value.length - 1);
        }
        savePlaylist();
    };

    const clearPlaylist = () => {
        playlist.value = [];
        currentIndex.value = 0;
        savePlaylist();
    };

    const changeTrack = async (index) => {
        if (index < 0 || index >= playlist.value.length) return;
        
        // 保存当前播放状态
        const wasPlaying = isPlaying.value;
        
        // 更新当前歌曲
        currentIndex.value = index;
        currentSong.value = playlist.value[index];
        
        // 等待一小段时间确保状态更新
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // 如果之前在播放，则继续播放
        if (wasPlaying) {
            // 确保音频元素存在
            if (!audioElement.value) {
                const audioEl = document.querySelector('audio');
                if (audioEl) {
                    initAudioElement(audioEl);
                }
            }
            await play();
        } else {
            // 如果之前在暂停，确保音频元素也处于暂停状态
            if (audioElement.value) {
                audioElement.value.pause();
            }
            isPlaying.value = false;
        }
        
        savePlaylist();
    };

    const nextTrack = async () => {
        const nextIndex = (currentIndex.value + 1) % playlist.value.length;
        await changeTrack(nextIndex);
    };

    const prevTrack = async () => {
        const prevIndex = (currentIndex.value - 1 + playlist.value.length) % playlist.value.length;
        await changeTrack(prevIndex);
    };

    // 本地存储相关
    const savePlaylist = () => {
        console.log('保存播放列表:', playlist.value);
        localStorage.setItem('playlist', JSON.stringify(playlist.value));
        localStorage.setItem('currentIndex', currentIndex.value.toString());
        localStorage.setItem('playMode', playMode.value.toString());
    };

    const loadPlaylist = async () => {
        console.log('开始加载播放列表');
        try {
            // 首先尝试从API获取播放列表
            const response = await fetch('/api/songs');
            console.log('API响应状态:', response.status);
            
            if (!response.ok) {
                throw new Error(`HTTP错误! 状态: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('API返回数据:', data);
            
            if (data.success && data.data && Array.isArray(data.data)) {
                playlist.value = data.data;
                console.log('从API加载播放列表成功:', playlist.value);
                
                // 设置当前歌曲
                if (playlist.value.length > 0) {
                    currentIndex.value = 0;
                    currentSong.value = playlist.value[0];
                }
                
                savePlaylist();
            } else {
                console.error('API返回数据格式错误:', data);
                // 如果API返回数据格式错误，尝试从本地存储加载
                const savedPlaylist = localStorage.getItem('playlist');
                if (savedPlaylist) {
                    const parsedPlaylist = JSON.parse(savedPlaylist);
                    if (Array.isArray(parsedPlaylist) && parsedPlaylist.length > 0) {
                        playlist.value = parsedPlaylist;
                        console.log('从本地存储加载播放列表:', playlist.value);
                        
                        // 设置当前歌曲
                        currentIndex.value = 0;
                        currentSong.value = playlist.value[0];
                    }
                }
            }

            // 加载保存的播放状态
            const savedIndex = localStorage.getItem('currentIndex');
            if (savedIndex !== null) {
                const index = parseInt(savedIndex);
                if (index >= 0 && index < playlist.value.length) {
                    currentIndex.value = index;
                    currentSong.value = playlist.value[index];
                    console.log('加载保存的当前索引:', currentIndex.value);
                }
            }

            const savedMode = localStorage.getItem('playMode');
            if (savedMode !== null) {
                playMode.value = parseInt(savedMode);
                console.log('加载保存的播放模式:', playMode.value);
            }

            // 打印当前播放列表状态
            console.log('播放列表加载完成，当前状态:', {
                playlistLength: playlist.value.length,
                currentIndex: currentIndex.value,
                playMode: playMode.value,
                currentSong: currentSong.value
            });
        } catch (error) {
            console.error('加载播放列表时发生错误:', error);
            // 发生错误时，尝试从本地存储加载
            const savedPlaylist = localStorage.getItem('playlist');
            if (savedPlaylist) {
                const parsedPlaylist = JSON.parse(savedPlaylist);
                if (Array.isArray(parsedPlaylist) && parsedPlaylist.length > 0) {
                    playlist.value = parsedPlaylist;
                    currentIndex.value = 0;
                    currentSong.value = playlist.value[0];
                    console.log('从本地存储加载播放列表:', playlist.value);
                }
            } else {
                playlist.value = [];
                currentIndex.value = 0;
                currentSong.value = null;
            }
        }
    };

    // 组件挂载时初始化
    onMounted(async () => {
        console.log('audioStore mounted');
        // 从本地存储加载播放列表
        await loadPlaylist();
        
        // 尝试恢复音频元素
        const audioEl = document.querySelector('audio');
        if (audioEl) {
            console.log('找到音频元素，开始初始化');
            initAudioElement(audioEl);
        } else {
            console.error('未找到音频元素');
        }
    });

    // 组件卸载时清理
    onUnmounted(() => {
        console.log('audioStore unmounted');
        if (audioElement.value) {
            // 只移除事件监听器，不清空源和停止播放
            audioElement.value.removeEventListener('timeupdate', updateCurrentTime);
            audioElement.value.removeEventListener('ended', handleEnded);
            audioElement.value.removeEventListener('error', handleError);
        }
    });

    return {
        audioElement,
        currentSongInfo,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playlist,
        currentIndex,
        playMode,
        initAudioElement,
        play,
        pause,
        seek,
        setVolume,
        toggleMute,
        nextTrack,
        prevTrack,
        changeTrack,
        clearPlaylist
    };
}); 