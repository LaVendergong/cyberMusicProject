const playbtn = document.querySelector('.play-btn')
const audio = document.querySelector('#audio-player')

playbtn.addEventListener('click', () => {
    playbtn.classList.toggle('playing')
    
    if (playbtn.classList.contains('playing')) {
        audio.play() 
        
        playbtn.innerHTML = '<i class="fas fa-pause"></i>'
        if (!audioCtx) initAudioAnalyser()
    } else {
        audio.pause() // 暂停音频
        playbtn.innerHTML = '<i class="fas fa-play"></i>'
         // 恢复播放按钮的初始状态，显示播放符号
    }
    
}) 
export {controller}