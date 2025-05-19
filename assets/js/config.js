// 环境配置
const ENV = {
    development: {
        API_URL: 'http://127.0.0.1:3000/api',
        SOURCE_API_URL: 'http://43.248.185.248:9763'
    },
    production: {
        API_URL: 'https://cyber-music-project-icrxwgwfc-lavendergongs-projects.vercel.app/api',
        SOURCE_API_URL: 'http://43.248.185.248:9763'
    }
};

// 获取当前环境
const currentEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'development' : 'production';

// 确保 window.AppConfig 存在
window.AppConfig = window.AppConfig || {};

// 扩展配置
Object.assign(window.AppConfig, {
    // API基础地址
    API_BASE_URL: 'https://cyber-music-project-icrxwgwfc-lavendergongs-projects.vercel.app',
    
    // API端点
    ENDPOINTS: {
        SONGLIST: 'api/songs',
        SONG_SEARCH: 'api/songs/search',
        SONG_BY_ID: 'api/songs',
        SONGS: 'api/songs'
    },
    
    // 获取完整的API URL
    getApiUrl(endpoint) {
        return `${this.API_BASE_URL}/${endpoint}`;
    },
    
    // 获取音源API URL
    getSourceApiUrl: () => {
        return ENV[currentEnv].SOURCE_API_URL;
    },
    
    // 获取资源URL（如图片、音频等）
    getResourceUrl(path) {
        return `${this.API_BASE_URL}/${path}`;
    },
    
    // 获取当前环境
    getEnvironment() {
        return this.isDevelopment() ? 'development' : 'production';
    },
    
    // 检查是否是开发环境
    isDevelopment() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    },
    
    // 是否为生产环境
    isProduction: () => currentEnv === 'production'
}); 
