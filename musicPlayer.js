// 使用全局命名空间中的数据
(function() {
    // 确保 MusicPlayer 命名空间存在
    const MusicPlayer = window.MusicPlayer = window.MusicPlayer || {};

    // 创建事件总线
    const EventBus = {
        _events: {},
        on(event, callback) {
            if (!this._events[event]) this._events[event] = [];
            this._events[event].push(callback);
        },
        off(event, callback) {
            if (!this._events[event]) return;
            if (!callback) {
                delete this._events[event];
            } else {
                this._events[event] = this._events[event].filter(cb => cb !== callback);
            }
        },
        emit(event, data) {
            (this._events[event] || []).forEach(callback => callback(data));
        }
    };

    // 将事件总线挂载到全局命名空间
    MusicPlayer.EventBus = EventBus;

    // 创建音乐播放器控制器
    const MusicController = {
        songlist: [], // 存储歌曲列表

        init() {
            // 订阅播放模式变更事件
            EventBus.on('playmode-changed', this.handlePlayModeChange);
            EventBus.on('playlist-changed', this.handlePlaylistChange);
            // 初始化其他功能
            this.setupEventListeners();
            // 获取歌曲列表
            this.fetchSongList();
        },

        // 获取歌曲列表的方法
        async fetchSongList() {
            try {
                const response = await fetch(window.AppConfig.getApiUrl(window.AppConfig.ENDPOINTS.SONGS));
                if (!response.ok) {
                    throw new Error(`HTTP错误 状态码: ${response.status}`);
                }
                const result = await response.json();
                if (!result.success) {
                    throw new Error(result.message || '获取歌曲列表失败');
                }
                
                this.songlist = result.data; // 保存到控制器中
                MusicPlayer.songlist = result.data; // 保存到全局命名空间
                
                // 触发歌曲列表更新事件
                EventBus.emit('playlist-loaded', result.data);
                
                console.log('歌曲列表加载成功:', result.data);
                return result.data;
            } catch (error) {
                console.error('获取歌曲列表失败:', error);
                EventBus.emit('playlist-error', error);
                throw error;
            }
        },

        handlePlayModeChange(mode) {
            console.log('播放模式已更改为:', mode);
            // 这里可以添加播放模式变更后的处理逻辑
        },

        handlePlaylistChange(playlist) {
            console.log('播放列表已更改为:', playlist);
            // 这里可以添加播放列表变更后的处理逻辑
        },

        setupEventListeners() {
            // 监听歌曲列表加载完成事件
            EventBus.on('playlist-loaded', (songlist) => {
                console.log('歌曲列表已加载，可以进行后续操作');
            });

            // 监听歌曲列表加载错误事件
            EventBus.on('playlist-error', (error) => {
                console.error('歌曲列表加载失败:', error);
            });
        },

        // 获取当前歌曲列表
        getSongList() {
            return this.songlist || [];
        },

        // 获取当前播放模式
        getPlayMode() {
            return MusicPlayer.playMode;
        },

        // 清理事件监听器
        destroy() {
            EventBus.off('playmode-changed', this.handlePlayModeChange);
            EventBus.off('playlist-changed', this.handlePlaylistChange);
        }
    };

    // 将控制器暴露到全局命名空间
    MusicPlayer.Controller = MusicController;

    // 初始化控制器
    document.addEventListener('DOMContentLoaded', () => {
        MusicController.init();
    });
})(); 