<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { user, clearUser } from '@/stores/userStore'

const router = useRouter()

const userProfileImage = ref('./images/OIP.jpg')
const isLoggedIn = ref(false)
const showNotification = ref(false)

const friendRequests = ref([]) // 📌 store requests

 const toggleNotification = async () => {
  console.log("toggle is work!")
  showNotification.value = !showNotification.value
  if (showNotification.value && user.value?.id) {
    try {
      const res = await axios.get(`http://localhost:9200/api/friend-requests/pending?receiverId=${user.value.id}`)
      friendRequests.value = res.data
      console.log(friendRequests.value);
    } catch (error) {
      console.error('Failed to fetch friend requests', error)
    }
  }
}

watchEffect(() => {
  if (user.value && user.value.profileImage) {
    userProfileImage.value = `http://localhost:9200${user.value.profileImage}`
    isLoggedIn.value = true
  } else {
    userProfileImage.value = './images/OIP.jpg'
    isLoggedIn.value = false
  }
})

onMounted(() => {
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    user.value = storedUser
  }
  console.log(user.value)
})

const logout = () => {
  localStorage.removeItem('user')
  clearUser()
  router.push('/Talkify/login')
}

const acceptRequest = async (id) => {
  try {
    await axios.post(`http://localhost:9200/api/friend-requests/respond`, null, {
      params: { requestId: id,
        status: "accepted"
       }
    })
    friendRequests.value = friendRequests.value.filter(r => r.id !== id)
  } catch (err) {
    console.error('Accept failed', err)
  }
}

const rejectRequest = async (id) => {
  try {
    await axios.post(`http://localhost:9200/api/friend-requests/respond`, null, {
      params: { requestId: id,
        status: "rejected"
       }
    })
    friendRequests.value = friendRequests.value.filter(r => r.id !== id)
  } catch (err) {
    console.error('Reject failed', err)
  }
}
</script>



<template>
  <div>
    <!-- Header -->
    <header class="bg-gray-800 text-white shadow">
      <nav class="container mx-auto flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <div class="text-xl font-semibold">
          <RouterLink to="/" class="hover:text-blue-400 text-3xl font-bold">Talkify</RouterLink>
        </div>

        <!-- Navigation Links -->
        <div class="space-x-4 flex items-center">
          <RouterLink to="/" class="hover:text-blue-400">Home</RouterLink>
          <RouterLink to="/register" class="hover:text-blue-400">Register</RouterLink>
          <RouterLink to="/Talkify/post" class="hover:text-blue-400">Post</RouterLink>

          <!-- Authenticated User Section -->
          <template v-if="isLoggedIn">
            <!-- Notification Icon -->
            <div class="relative">
              <button @click="toggleNotification" class="relative p-2 rounded-full hover:bg-gray-700">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span class="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"></span>
              </button>

              <!-- Notification Panel -->
              <div v-if="showNotification" class="absolute right-0 mt-2 w-80 z-20 bg-white dark:bg-gray-800 p-4 rounded shadow-lg">
                <!-- Header with Close Button -->
                <div class="flex items-center mb-3">
                  <span class="text-sm font-semibold text-gray-900 dark:text-white">New Notification</span>
                  <button @click="toggleNotification" class="ml-auto text-gray-400 hover:text-gray-900 dark:hover:text-white">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>

                <!-- Friend Requests List -->
                <div v-if="friendRequests.length > 0">
                  <div v-for="request in friendRequests" :key="request.id" class="flex space-x-3 mb-4">
                    <!-- Profile Image -->
                    <img class="w-10 h-10 rounded-full" :src="`http://localhost:9200${request.sender.profileImage}`" alt="Profile" />
                    
                    <!-- Message and Buttons -->
                    <div class="flex-1">
                      <div class="text-sm text-gray-700 dark:text-gray-300">
                        <div class="font-semibold">{{ request.sender.username }} sent you a friend request</div>
                        <span class="text-xs text-blue-500 dark:text-blue-400">a few seconds ago</span>
                      </div>
                      <div class="mt-2 flex space-x-2">
                        <button
                          @click="acceptRequest(request.id)"
                          class="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600">
                          Accept
                        </button>
                        <button
                          @click="rejectRequest(request.id)"
                          class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600">
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Requests -->
                <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                  No new friend requests.
                </div>
              </div>
            </div>

            <!-- Profile Picture -->
            <RouterLink class="inline-flex items-center">
              <img :src="userProfileImage" alt="User Profile" class="rounded-full h-10 w-10 object-cover border-2" />
            </RouterLink>

            <!-- Logout Button -->
            <button @click="logout" class="hover:text-red-400 font-medium">Logout</button>
          </template>

          <!-- Guest User -->
          <template v-else>
            <RouterLink to="/Talkify/login" class="hover:text-blue-400">Login</RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto mt-6 px-4">
      <RouterView />
    </main>
  </div>
</template>
