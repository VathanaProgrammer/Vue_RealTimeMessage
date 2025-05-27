<template>
  <div
  :class="isSmallScreen ? 'absolute top-15 right-0 w-80 bg-white border rounded shadow-lg p-4' : 'sticky top-0'">
    <h2 class="text-xl text-black font-bold mb-4">Messages</h2>
    
    <!-- Show the list of friends when no conversation is open -->
    <div v-if="!selectedFriend" class="space-y-3 max-h-[calc(100vh-100px)] overflow-y-auto pr-2">
      <div
        v-for="user in friends"
        :key="user.id"
        class="flex items-center space-x-3 p-2 rounded hover:bg-gray-100 cursor-pointer transition"
        @click="selectConversation(user)"
      >
        <img
          :src="APT_BASE_URL + user.profileImage"
          alt="profile"
          class="rounded-full object-cover h-10 w-10 border-2"
        />
        <div class="text-gray-800 font-medium">{{ user.username }}</div>
      </div>
    </div>

    <!-- Show the conversation if a user is selected -->
    <MessageConversation 
      v-if="selectedFriend" 
      :friend="selectedFriend" 
      @closeConversation="closeConversation" 
    />
  </div>
</template>

<script setup>

import { ref, onMounted } from 'vue'
import { getFriendsOfUser } from '@/axios'
import MessageConversation from '../MessageConversation.vue'
const APT_BASE_URL = 'http://localhost:9200';
const friends = ref([])

const currentUser = JSON.parse(localStorage.getItem("user"))
const currentUserId = currentUser?.id
const selectedFriend = ref(null)
const isSmallScreen = ref( window.innerWidth < 1200);

const fetchFriends = async (userId) => {
  try {
    const response = await getFriendsOfUser(userId)
    friends.value = response.data
  } catch (err) {
    console.error("Failed to load friends:", err)
  }
}

const selectConversation = (friend) => {
  selectedFriend.value = friend // Select the clicked user and show the conversation
}

const closeConversation = () => {
  selectedFriend.value = null // Close the conversation and go back to the list
}

onMounted(() => {
  if (currentUserId) {
    fetchFriends(currentUserId)
  }
  window.addEventListener('resize', () => {
    isSmallScreen.value = window.innerWidth < 1200
  })
})
</script>
