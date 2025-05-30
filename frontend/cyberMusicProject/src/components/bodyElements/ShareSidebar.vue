<template>
    <div class="share-sidebar" :class="{ 'show': isVisible }" ref="shareSidebarRef">
        <div class="share-content">
            <div class="share-header">
                <h3>分享</h3>
                <button class="close-btn" @click="onClose">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="share-options">
                <button class="share-option wechat" @click="shareToWeChat">
                    <i class="fab fa-weixin"></i>
                    <span>微信</span>
                </button>
                <button class="share-option qq" @click="shareToQQ">
                    <i class="fab fa-qq"></i>
                    <span>QQ</span>
                </button>
                <button class="share-option weibo" @click="shareToWeibo">
                    <i class="fab fa-weibo"></i>
                    <span>微博</span>
                </button>
                <button class="share-option copy-link" @click="copyLink">
                    <i class="fas fa-link"></i>
                    <span>复制链接</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
    isVisible: {
        type: Boolean,
        default: false
    },
    currentSong: {
        type: Object,
        required: true
    }
});

const emit = defineEmits(['close']);
const shareSidebarRef = ref(null);

const onClose = () => {
    emit('close');
};

// 处理点击外部区域
const handleClickOutside = (event) => {
    // 如果点击的是分享按钮，不处理
    if (event.target.closest('.share-btn')) {
        return;
    }
    
    if (props.isVisible && 
        shareSidebarRef.value && 
        !shareSidebarRef.value.contains(event.target)) {
        onClose();
    }
};

onMounted(() => {
    // 使用 mousedown 而不是 click 事件，这样可以避免与按钮点击冲突
    document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside);
});

// 显示提示信息
const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'share-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 2000);
};

// 分享到微信
const shareToWeChat = () => {
    showToast('请截图后分享到微信');
    onClose();
};

// 分享到QQ
const shareToQQ = () => {
    const shareUrl = `http://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(props.currentSong.songName)}&desc=${encodeURIComponent('正在收听: ' + props.currentSong.songName + ' - ' + props.currentSong.singer)}`;
    window.open(shareUrl, '_blank');
    onClose();
};

// 分享到微博
const shareToWeibo = () => {
    const shareUrl = `http://service.weibo.com/share/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent('正在收听: ' + props.currentSong.songName + ' - ' + props.currentSong.singer)}`;
    window.open(shareUrl, '_blank');
    onClose();
};

// 复制链接
const copyLink = async () => {
    const shareText = `${props.currentSong.songName} - ${props.currentSong.singer}\n${window.location.href}`;
    
    try {
        await navigator.clipboard.writeText(shareText);
        showToast('链接已复制到剪贴板');
    } catch (err) {
        const textarea = document.createElement('textarea');
        textarea.value = shareText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('链接已复制到剪贴板');
    }
    
    onClose();
};
</script>

<style scoped>
.share-sidebar {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100vh;
    background: var(--surface-color);
    box-shadow: -5px 0 15px rgba(0, 0, 0, 0.3);
    transition: transform 0.3s ease;
    z-index: 99999;
    transform: translateX(0);
}

.share-sidebar.show {
    transform: translateX(-400px);
}

.share-content {
    padding: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--surface-color);
    overflow-y: auto;
}

.share-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.share-header h3 {
    color: var(--primary-color);
    margin: 0;
    font-size: 1.5rem;
}

.close-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 0.5rem;
    transition: all 0.3s ease;
}

.close-btn:hover {
    color: var(--secondary-color);
    transform: rotate(90deg);
}

.share-options {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.share-option {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    border: none;
    border-radius: 0.5rem;
    background: rgba(var(--primary-color), 0.1);
    color: var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease;
}

.share-option:hover {
    background: rgba(var(--secondary-color), 0.2);
    transform: translateX(10px);
}

.share-option i {
    font-size: 1.5rem;
}

.share-option span {
    font-size: 1rem;
}

.share-toast {
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 1rem 2rem;
    border-radius: 0.5rem;
    z-index: 10000;
    animation: fadeInOut 2s ease;
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 20px); }
    15% { opacity: 1; transform: translate(-50%, 0); }
    85% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -20px); }
}

/* 移动端适配 */
@media (max-width: 768px) {
    .share-sidebar {
        width: 100%;
        right: -100%;
        transform: translateX(0);
    }
    
    .share-sidebar.show {
        transform: translateX(-100%);
    }
}
</style> 