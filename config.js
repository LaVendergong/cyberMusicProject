// 环境配置
const ENV = {
    development: {
        API_URL: 'http://localhost:3000',
        SOURCE_API_URL: 'http://localhost:3000'
    },
    production: {
        API_URL: 'https://cyber-music-project-icrxwgwfc-lavendergongs-projects.vercel.app',
        SOURCE_API_URL: 'https://cyber-music-project-icrxwgwfc-lavendergongs-projects.vercel.app'
    }
};

// 确定当前环境
const currentEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'development' : 'production';

// 确保 window.AppConfig 存在
window.AppConfig = window.AppConfig || {};

// 使用 Object.assign 扩展配置
Object.assign(window.AppConfig, {
    ENV: ENV,
    currentEnv: currentEnv,
    ENDPOINTS: {
        SONGLIST: '/api/songlist',
        SONG_SEARCH: '/api/songs/search',
        SONG_BY_ID: '/api/songs',
        SONGS: '/api/songs'
    },
    getApiUrl: function(endpoint) {
        return `${ENV[currentEnv].API_URL}${endpoint}`;
    },
    getSourceApiUrl: function(endpoint) {
        return `${ENV[currentEnv].SOURCE_API_URL}${endpoint}`;
    },
    getResourceUrl: function(path) {
        return `${ENV[currentEnv].API_URL}${path}`;
    },
    isDevelopment: function() {
        return currentEnv === 'development';
    },
    getEnvironment: function() {
        return currentEnv;
    }
}); 
