<!-- HomeView.vue -->
<template>
    <div class="flex h-screen">
      <!-- Left Side 75% -->
      <div class="w-3/4 border-r p-4">
        <div class="flex space-x-6 border-b pb-2">
          <button @click="activeTab = 'home'" :class="tabClass('home')">Home</button>
          <button @click="activeTab = 'addFriend'" :class="tabClass('addFriend')">Add Friend</button>
        </div>
        <div class="mt-4">
          <component :is="currentComponent" />
        </div>
      </div>
  
      <!-- Right Side 25% -->
      <div class="w-1/4 p-4 h-screen overflow-y-auto">
        <MessageTab />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import HomeTab from './tabs/HomeTap.vue'
  import AddFriendTab from './tabs/AddFriendTab.vue'
  import MessageTab from './tabs/MessageTab.vue'
  
  const activeTab = ref('home')
  
  const tabClass = (tab) => {
    return activeTab.value === tab
      ? 'text-blue-600 font-bold border-b-2 border-blue-600 text-xl font-bold'
      : 'text-gray-600 hover:text-blue-600 text-lg';
  }
  
  const currentComponent = computed(() => {
    return activeTab.value === 'home' ? HomeTab : AddFriendTab
  })
  </script>
  