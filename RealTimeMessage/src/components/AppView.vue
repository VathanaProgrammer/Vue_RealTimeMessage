<template>
  <div class="flex h-screen">
    <!-- Left Side: Scrollable content -->
    <div :class="{'w-full': isSmallScreen, 'w-4/6': !isSmallScreen}" class="flex flex-col overflow-y-auto">
      <div class="p-4 border-b flex space-x-6">
        <button @click="activeTab = 'home'" :class="tabClass('home')">Home</button>
        <button @click="activeTab = 'addFriend'" :class="tabClass('addFriend')">Friend</button>
      </div>
      <div class="lg:p-4 flex-1 overflow-y-auto">
        <component :is="currentComponent" />
      </div>
    </div>

    <!-- Right Side: Fixed messages (only visible on large screens) -->
    <div v-show="!isSmallScreen" class="w-2/6 p-4 h-screen border-l bg-white">
      <div class="sticky top-0">
        <MessageTab />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import HomeTab from './tabs/HomeTap.vue'
import AddFriendTab from './tabs/AddFriendTab.vue'
import MessageTab from './tabs/MessageTab.vue'

const isSmallScreen = ref(window.innerWidth < 1200)
const activeTab = ref('home')

const tabClass = (tab) => {
  return activeTab.value === tab
    ? 'text-blue-600 font-bold border-b-2 border-blue-600 text-xl font-bold'
    : 'text-gray-600 hover:text-blue-600 text-lg'
}

const currentComponent = computed(() => {
  return activeTab.value === 'home' ? HomeTab : AddFriendTab
})

onMounted(() => {
  window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth < 1200
  })
})
</script>
