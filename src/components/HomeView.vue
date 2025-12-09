<script setup>
import { useStore } from '../store/store';
import { ref, computed } from 'vue';

const { 
    state, currentAnimal, todayMoodData, equippedAccessory, 
    recordMood, getAnimalDialogue, showFeedback, MOODS 
} = useStore();

// 动画相关状态
const isAnimating = ref(false);
const showReward = computed(() => state.feedbackMessage.includes("解锁新饰品"));

/** * 小动物点击互动逻辑 
 */
const animateAnimal = () => {
    if (isAnimating.value) return;

    const mood = state.todayMood in MOODS ? state.todayMood : 'UNKNOWN';
    let dialogue = getAnimalDialogue();

    // 1. 显示对话
    showFeedback(dialogue);
    
    // 2. 播放动画
    isAnimating.value = true;
    
    // 播放动画类
    const animalEl = document.getElementById('animal-display');
    let animationClass = '';
    let transformStyle = '';

    if (mood === 'HAPPY' || mood === 'EXCITED') {
        animationClass = 'animal-interact'; // 弹跳动画
    } else if (mood === 'TIRED' || mood === 'ANXIOUS') {
        transformStyle = 'translateY(5px) scale(0.98)'; // 轻微下沉
    } else {
        transformStyle = 'scale(1.05)'; // 放大
    }

    if (animationClass) {
        animalEl.classList.add(animationClass);
    } else if (transformStyle) {
        animalEl.style.transform = transformStyle;
    }


    // 3. 动画结束清理
    setTimeout(() => {
        isAnimating.value = false;
        if (animationClass) {
            animalEl.classList.remove(animationClass);
        }
        animalEl.style.transform = '';
    }, 800);
};
</script>

<template>
    <div class="p-6 bg-gradient-to-br from-purple-400 to-indigo-500 text-white shadow-lg">
        <div class="flex justify-between items-center mb-4">
            <h1 class="text-2xl font-extrabold">{{ currentAnimal.name }}陪伴</h1>
            <span :class="todayMoodData.color" class="px-3 py-1 rounded-full text-sm font-semibold shadow-inner">
                {{ todayMoodData.cn }}
            </span>
        </div>
        
        <div class="text-sm font-medium opacity-80 mb-2">
            连续记录: <span class="text-lg font-bold">{{ state.continuousDays }}</span> 天
        </div>
    </div>

    <div id="animal-area" class="flex-grow flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gray-100">
        <div id="accessory-icon" 
             class="absolute top-1/4 transform -translate-y-full text-6xl z-20 transition-all duration-300">
            {{ equippedAccessory ? equippedAccessory.emoji : '' }}
        </div>
        
        <div id="animal-display" 
             @click="animateAnimal"
             class="text-[120px] cursor-pointer active:scale-95 transform transition-transform animal-container">
            {{ currentAnimal.emoji }}
        </div>
        
        <div id="feedback-message" 
             class="mt-4 p-2 text-sm text-gray-600 bg-white rounded-lg transition-opacity duration-300 shadow"
             :class="{ 'opacity-100': state.feedbackMessage, 'opacity-0': !state.feedbackMessage }">
            {{ state.feedbackMessage || '点击小动物互动哦！' }}
        </div>
        
        <div id="reward-message" 
             class="absolute bottom-20 bg-yellow-100 text-yellow-800 p-3 rounded-xl shadow-lg font-bold transition-transform duration-500"
             :class="{ 'scale-100 opacity-100': showReward, 'scale-0 opacity-0': !showReward }">
            🎉 解锁新饰品！
        </div>
    </div>

    <div id="mood-panel" class="p-4 bg-white border-t border-gray-200 mood-selector">
        <h3 class="text-lg font-semibold mb-3 text-gray-700">记录今日心情</h3>
        <div class="grid grid-cols-5 gap-3">
            <button v-for="(moodData, moodKey) in MOODS" :key="moodKey" 
                    v-if="moodKey !== 'UNKNOWN'"
                    :data-mood="moodKey" 
                    :class="[moodData.color, 'flex flex-col items-center p-2 rounded-xl']"
                    @click="recordMood(moodKey)">
                <span class="text-2xl">{{ moodData.emoji }}</span>
                <span class="text-xs mt-1">{{ moodData.cn }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
/* 互动动画样式 (从原CSS移植) */
.mood-selector button {
    transition: all 0.2s ease-in-out;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
.mood-selector button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.animal-container {
    transition: transform 0.1s ease-out;
}
.animal-interact {
    animation: bounce-heart 0.8s ease-out;
}
@keyframes bounce-heart {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}
</style>