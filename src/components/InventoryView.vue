<script setup>
import { useStore } from '../store/store';
import { computed } from 'vue';

const { state, ANIMALS, equipAccessory, selectAnimal } = useStore();

// 动物列表 (用于 Animal Selection)
const animalList = computed(() => Object.values(ANIMALS));
</script>

<template>
  <div id="inventory-view" class="p-6 flex-col flex-grow bg-gray-50 overflow-y-auto">
    <div id="inventory-list" class="space-y-8 pb-4">

      <!-- 动物选择 -->
      <div class="mb-8 p-4 bg-white rounded-xl shadow-lg">
        <h3 class="text-xl font-extrabold mb-4 text-purple-700 border-b pb-2">更换你的小伴侣</h3>
        <div class="grid grid-cols-3 gap-4">
          <button v-for="animal in animalList" :key="animal.id"
                  @click="selectAnimal(animal.id)"
                  class="p-4 rounded-xl shadow-inner flex flex-col items-center justify-center transition-all duration-200 active:scale-95"
                  :class="{ 
                    'bg-purple-100 ring-2 ring-purple-500': animal.id === state.currentAnimalId, 
                    'bg-gray-50 hover:bg-gray-100': animal.id !== state.currentAnimalId 
                  }">
            <span class="text-4xl sm:text-5xl">{{ animal.emoji }}</span>
            <span class="text-xs font-semibold mt-2" 
                  :class="{ 'text-purple-700': animal.id === state.currentAnimalId, 'text-gray-700': animal.id !== state.currentAnimalId }">
              {{ animal.name }}
            </span>
            <span v-if="animal.id === state.currentAnimalId" class="text-[10px] text-purple-600 font-bold mt-1">当前</span>
          </button>
        </div>
      </div>

      <!-- 饰品仓库 -->
      <div class="p-4 bg-white rounded-xl shadow-lg">
        <h3 class="text-xl font-extrabold mb-4 text-purple-700 border-b pb-2">饰品仓库</h3>
        <p class="text-sm text-gray-500 mb-4">连续记录心情可解锁更多饰品哦！</p>
        <div id="accessory-list-container" class="space-y-4">

          <div v-for="acc in state.accessoryInventory" :key="acc.id"
               class="flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-md relative">

            <!-- 饰品信息 -->
            <div class="flex items-center">
              <span class="text-3xl mr-4">{{ acc.emoji }}</span>
              <div>
                <p class="font-bold text-gray-800">{{ acc.name }}</p>
                <p class="text-xs text-gray-500">用于 {{ ANIMALS[state.currentAnimalId]?.name }}</p>
              </div>
            </div>

            <!-- 饰品操作按钮 -->
            <div>
              <!-- 已解锁，可佩戴/卸下 -->
              <button v-if="acc.unlocked"
                      @click="equipAccessory(acc.id)"
                      :class="[ 
                        'px-4 py-2 text-sm font-semibold rounded-full transition-all transform active:scale-95 cursor-pointer',
                        acc.equipped ? 'bg-purple-600 text-white' : 'bg-green-500 text-white hover:bg-green-600'
                      ]">
                {{ acc.equipped ? '已佩戴' : '佩戴' }}
              </button>

              <!-- 未解锁 -->
              <button v-else disabled
                      class="px-4 py-2 text-sm font-semibold rounded-full bg-gray-300 text-gray-600 cursor-not-allowed">
                未解锁 ({{ acc.requiredDays }} 天)
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
/* 滚动条美化 */
#inventory-view::-webkit-scrollbar {
  width: 6px;
}
#inventory-view::-webkit-scrollbar-thumb {
  background: rgba(99, 102, 241, 0.5);
  border-radius: 3px;
}
</style>
