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
    // API端点
    ENDPOINTS: {
        SONGS: '/songs',
        PLAYLISTS: '/playlists',
        UPLOAD: '/upload',
        SEARCH: '/search'
    },
    
    // 获取API URL
    getApiUrl: (endpoint) => {
        return `${ENV[currentEnv].API_URL}${endpoint}`;
    },
    
    // 获取音源API URL
    getSourceApiUrl: () => {
        return ENV[currentEnv].SOURCE_API_URL;
    },
    
    // 获取资源URL（如图片、音频等）
    getResourceUrl: (path) => {
        return `${ENV[currentEnv].API_URL}${path}`;
    },
    
    // 获取当前环境
    getCurrentEnv: () => currentEnv,
    
    // 是否为开发环境
    isDevelopment: () => currentEnv === 'development',
    
    // 是否为生产环境
    isProduction: () => currentEnv === 'production'
}); 
