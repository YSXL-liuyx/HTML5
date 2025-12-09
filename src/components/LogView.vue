<script setup>
import { useStore } from '../store/store';
import { computed } from 'vue';

const { state, MOODS } = useStore();

// 反转历史记录，让最新的记录排在最前面
const reversedHistory = computed(() => [...state.historyRecords].reverse());
</script>

<template>
    <div class="p-6 flex-col flex-grow bg-gray-50">
        <h2 class="text-xl font-bold mb-4 text-purple-700">心情记录日志</h2>
        <div id="history-list" class="space-y-3 overflow-y-auto log-container flex-grow max-h-full">
            <template v-if="reversedHistory.length > 0">
                <div v-for="record in reversedHistory" :key="record.date"
                     :class="[MOODS[record.mood]?.color || MOODS.UNKNOWN.color, 'p-3 rounded-xl flex items-center shadow-md']">
                    <span class="text-3xl mr-4">{{ MOODS[record.mood]?.emoji || MOODS.UNKNOWN.emoji }}</span>
                    <div>
                        <p class="font-bold text-lg">{{ MOODS[record.mood]?.cn || MOODS.UNKNOWN.cn }}</p>
                        <p class="text-sm opacity-80">{{ record.date }}</p>
                    </div>
                </div>
            </template>
            <p v-else class="text-center text-gray-500 mt-8">还没有记录呢，快去记录第一条心情吧！</p>
        </div>
    </div>
</template>