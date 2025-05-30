// 环境配置
const ENV = {
    development: {
        API_URL: 'https://cyber-music-project-llfbko1k8-lavendergongs-projects.vercel.app/api',
        SOURCE_API_URL: 'https://cyber-music-project-llfbko1k8-lavendergongs-projects.vercel.app/api'
    },
    production: {
        API_URL: 'https://cyber-music-project-llfbko1k8-lavendergongs-projects.vercel.app/api',
        SOURCE_API_URL: 'https://cyber-music-project-llfbko1k8-lavendergongs-projects.vercel.app/api'
    }
};

// 确定当前环境
const currentEnv = 'development';

// 确保 window.AppConfig 存在
window.AppConfig = window.AppConfig || {};

// 使用 Object.assign 扩展配置
Object.assign(window.AppConfig, {
    ENV: ENV,
    currentEnv: currentEnv,
    ENDPOINTS: {
        SONGLIST: '/songlist',
        SONG_SEARCH: '/songs/search',
        SONG_BY_ID: '/songs',
        SONGS: '/songs'
    },
    getApiUrl: function(endpoint) {
        const baseUrl = ENV[currentEnv].API_URL;
        return `${baseUrl}${endpoint}`;
    },
    getSourceApiUrl: function(endpoint) {
        const baseUrl = ENV[currentEnv].SOURCE_API_URL;
        return `${baseUrl}${endpoint}`;
    },
    getResourceUrl: function(path) {
        const baseUrl = ENV[currentEnv].API_URL;
        return `${baseUrl}${path}`;
    },
    isDevelopment: function() {
        return true;
    },
    getEnvironment: function() {
        return 'development';
    }
}); 
