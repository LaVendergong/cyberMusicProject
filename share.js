// 分享功能管理
class ShareManager {
    constructor() {
        this.modal = document.querySelector('.share-modal');
        this.shareBtn = document.querySelector('.share-btn');
        this.closeBtn = document.querySelector('.close-share');
        this.initializeEvents();
    }

    initializeEvents() {
        // 打开分享弹窗
        this.shareBtn.addEventListener('click', () => this.openShareModal());
        
        // 关闭分享弹窗
        this.closeBtn.addEventListener('click', () => this.closeShareModal());
        
        // 点击弹窗外部关闭
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeShareModal();
            }
        });

        // 绑定分享选项事件
        document.querySelector('.share-option.wechat').addEventListener('click', () => this.shareToWeChat());
        document.querySelector('.share-option.qq').addEventListener('click', () => this.shareToQQ());
        document.querySelector('.share-option.weibo').addEventListener('click', () => this.shareToWeibo());
        document.querySelector('.share-option.copy-link').addEventListener('click', () => this.copyLink());
    }

    openShareModal() {
        this.modal.style.display = 'flex';
    }

    closeShareModal() {
        this.modal.style.display = 'none';
    }

    // 获取当前播放歌曲信息
    getCurrentSongInfo() {
        const songName = document.querySelector('.track-title').textContent;
        const artist = document.querySelector('.artist').textContent;
        return {
            title: songName,
            artist: artist,
            url: window.location.href
        };
    }

    // 显示提示信息
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'share-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // 2秒后自动移除提示
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 2000);
    }

    // 分享到微信
    shareToWeChat() {
        const songInfo = this.getCurrentSongInfo();
        // 这里可以集成微信分享SDK
        // 由于需要微信开发者账号，这里只显示提示
        this.showToast('请截图后分享到微信');
        this.closeShareModal();
    }

    // 分享到QQ
    shareToQQ() {
        const songInfo = this.getCurrentSongInfo();
        const shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(songInfo.url)}&title=${encodeURIComponent(songInfo.title)}&desc=${encodeURIComponent('正在收听: ' + songInfo.title + ' - ' + songInfo.artist)}`;
        window.open(shareUrl, '_blank');
        this.closeShareModal();
    }

    // 分享到微博
    shareToWeibo() {
        const songInfo = this.getCurrentSongInfo();
        const shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(songInfo.url)}&title=${encodeURIComponent('正在收听: ' + songInfo.title + ' - ' + songInfo.artist)}`;
        window.open(shareUrl, '_blank');
        this.closeShareModal();
    }

    // 复制链接
    async copyLink() {
        const songInfo = this.getCurrentSongInfo();
        const shareText = `${songInfo.title} - ${songInfo.artist}\n${songInfo.url}`;
        
        try {
            await navigator.clipboard.writeText(shareText);
            this.showToast('链接已复制到剪贴板');
        } catch (err) {
            // 如果clipboard API不可用，使用传统方法
            const textarea = document.createElement('textarea');
            textarea.value = shareText;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('链接已复制到剪贴板');
        }
        
        this.closeShareModal();
    }
}

// 初始化分享管理器
document.addEventListener('DOMContentLoaded', () => {
    window.shareManager = new ShareManager();
}); 