<template>
    <div class="volume-control">
        <i class="fas fa-volume-up volume-icon" @click="toggleMute"></i>
        <input 
            type="range" 
            class="volume-slider" 
            min="0" 
            max="100" 
            :value="volume"
            @input="onVolumeChange"
        >
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    volume: {
        type: Number,
        default: 70
    }
});

const emit = defineEmits(['volumeChange']);
const previousVolume = ref(props.volume);
const isMuted = ref(false);

const onVolumeChange = (event) => {
    const newVolume = parseInt(event.target.value);
    emit('volumeChange', newVolume);
    isMuted.value = newVolume === 0;
};

const toggleMute = () => {
    if (isMuted.value) {
        emit('volumeChange', previousVolume.value);
        isMuted.value = false;
    } else {
        previousVolume.value = props.volume;
        emit('volumeChange', 0);
        isMuted.value = true;
    }
};
</script>

<style scoped>
.volume-control {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1rem auto;
    width: 100%;
    max-width: 600px;
}

.volume-icon {
    color: var(--primary-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;
    width: 24px;
    flex-shrink: 0;
    display: flex;
    justify-content: center;
}

.volume-icon:hover {
    color: var(--secondary-color);
    transform: scale(1.1);
}

.volume-slider {
    width: 100%;
    height: 6px;
    -webkit-appearance: none;
    background: rgba(var(--primary-color), 0.1);
    border-radius: 3px;
    outline: none;
    cursor: pointer;
    box-shadow: 0 0 5px var(--primary-color);
    transition: background 0.3s;
}

.volume-slider:hover {
    background: rgba(var(--primary-color), 0.2);
}

.volume-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: linear-gradient(45deg, var(--secondary-color), var(--primary-color));
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 0 10px var(--secondary-color);
    transition: transform 0.3s;
}

.volume-slider::-webkit-slider-thumb:hover {
    transform: scale(1.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
    .volume-control {
        max-width: 300px;
    }
    
    .volume-slider {
        height: 4px;
    }
    
    .volume-slider::-webkit-slider-thumb {
        width: 14px;
        height: 14px;
    }
    
    .volume-icon {
        font-size: 1rem;
        width: 20px;
    }
}
</style>