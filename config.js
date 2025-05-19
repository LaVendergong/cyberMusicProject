// 全局配置
window.AppConfig = {
    // API基础地址
    API_BASE_URL: 'http://127.0.0.1:3000',
    
    // API端点
    ENDPOINTS: {
        SONGLIST: '/api/songs',
        SONG_SEARCH: '/api/songs/search',
        SONG_BY_ID: '/api/songs',
        SONGS: '/api/songs'
    },

    // 获取完整的API URL
    getApiUrl(endpoint) {
        return `${this.API_BASE_URL}${endpoint}`;
    },

    // 获取资源URL（如图片、音频等）
    getResourceUrl(path) {
        return `${this.API_BASE_URL}${path}`;
    }
}; 
