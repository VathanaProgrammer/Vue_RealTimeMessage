<script setup>
import { ref, computed, onMounted , onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'
import MessageTab from '@/components/tabs/MessageTab.vue'
import { isLogin } from './authState' 

const APT_BASE_URL = 'http://localhost:9200'
const router = useRouter()
const userStore = useUserStore()

// ---- Reactive state ----
const showMenu = ref(false)
const showNotification = ref(false)
const showMessages = ref(false)
const friendRequests = ref([])
const isSmallScreen = ref(window.innerWidth < 1200)

function handleResize() {
  isSmallScreen.value = window.innerWidth < 1200
}

// We no longer need a separate `userProfileImage` ref—derive it:
const profileImageUrl = computed(() => {
  const u = userStore.user
  if (u && u.profileImage) {
    // Append a timestamp to bust cache
    return `${APT_BASE_URL}${u.profileImage}?t=${Date.now()}`
  }
  // default.png if no user or no profileImage
  return `${APT_BASE_URL}/upload/default.png?t=${Date.now()}`
})

const isLoggedIn = computed(() => !!userStore.user)

// ---- Axios instance (automatically sends HttpOnly cookie) ----
const api = axios.create({
  baseURL: `${APT_BASE_URL}/api`,
  withCredentials: true, // send the HttpOnly cookie
})

// ---- Fetch current user ----
async function fetchCurrentUser() {
  try {
    const res = await api.get('/users/me')
    console.log('Current user:', res.data)
    if (res.data.success) {
      // store entire user object, including .profileImage
      userStore.setUser(res.data.data)
    } else {
      userStore.clearUser()
    }
  } catch {
    userStore.clearUser()
  }
}

// ---- Fetch all pending friend requests ----
async function fetchPendingRequests() {
  try {
    const res = await api.get('/friend-requests/pending')
    friendRequests.value = res.data
    console.log('Pending requests:', friendRequests.value)
  } catch (err) {
    console.error('Failed to fetch pending requests:', err)
  }
}

// ---- Accept & Reject handlers ----
async function acceptRequest(requestId) {
  try {
    await api.post(`/friend-requests/accept/${requestId}`)
    friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
  } catch (err) {
    console.error('Error accepting request:', err)
  }
}

async function rejectRequest(requestId) {
  try {
    await api.post(`/friend-requests/reject/${requestId}`)
    friendRequests.value = friendRequests.value.filter(r => r.id !== requestId)
  } catch (err) {
    console.error('Error rejecting request:', err)
  }
}

// ---- Toggle panels ----
function toggleNotification() {
  showNotification.value = !showNotification.value
}
function toggleMessages() {
  showMessages.value = !showMessages.value
}

// ---- Logout ----
async function logout() {
  try {
    await api.post('/auth/logout')
    userStore.clearUser()
    isLogin.value = false
    router.push('/')
  } catch (err) {
    console.error('Logout failed:', err)
    alert('Logout failed. Please try again.')
  }
}

// ---- onMounted: load current user, then pending requests ----
onMounted(async () => {
  await fetchCurrentUser()
  if (userStore.user) {
    await fetchPendingRequests()
  } 
   window.addEventListener('resize', handleResize)
  handleResize() // Initial check

})
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

</script>

<template>
  <div>
    <header class="bg-gray-800 text-white shadow">
      <nav class="container mx-auto flex items-center justify-between px-4 py-3">
        <!-- Logo -->
        <div class="text-xl font-semibold">
          <RouterLink to="/" class="hover:text-blue-400 text-3xl font-bold">Talkify</RouterLink>
        </div>

        <div class="space-x-4 flex items-center">
          <!-- Comment Icon -->
          <div v-show="isSmallScreen">
            <font-awesome-icon 
              class="cursor-pointer" 
              icon="comment" 
              @click="toggleMessages" 
            />
          </div>

          <!-- Notification Icon -->
          <div class="relative">
            <button 
              @click="toggleNotification" 
              class="relative p-2 rounded-full hover:bg-gray-700"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 
                     0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 
                     2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 
                     .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 
                     0 11-6 0v-1m6 0H9" />
              </svg>
              <span 
                v-if="friendRequests.length > 0" 
                class="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full"
              ></span>
            </button>

            <!-- Notification Panel -->
            <div 
              v-if="showNotification" 
              class="absolute right-0 mt-2 w-80 z-20 bg-white dark:bg-gray-800 p-4 rounded shadow-lg"
            >
              <div class="flex items-center mb-3">
                <span class="text-sm font-semibold text-gray-900 dark:text-white">
                  Friend Requests
                </span>
                <button 
                  @click="toggleNotification" 
                  class="ml-auto text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                          d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Pending friend requests -->
              <div v-if="friendRequests.length > 0">
                <div 
                  v-for="request in friendRequests" 
                  :key="request.id" 
                  class="flex space-x-3 mb-4"
                >
                  <img 
                    class="w-10 h-10 rounded-full" 
                    :src="`${APT_BASE_URL}${request.sender.profileImage}`" 
                    :alt="request.sender.username" 
                  />
                  <div class="flex-1">
                    <div class="text-sm text-gray-700 dark:text-gray-300">
                      <div class="font-semibold">
                        {{ request.sender.username }} sent you a friend request
                      </div>
                      <span class="text-xs text-blue-500 dark:text-blue-400">just now</span>
                    </div>
                    <div class="mt-2 flex space-x-2">
                      <button 
                        @click="acceptRequest(request.id)"
                        class="px-3 py-1 text-xs font-medium text-white bg-green-500 rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button 
                        @click="rejectRequest(request.id)"
                        class="px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- No pending requests -->
              <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                No new friend requests.
              </div>
            </div>
          </div>

          <!-- Profile Image -->
          <RouterLink class="inline-flex items-center">
            <img 
              :src="profileImageUrl" 
              alt="User Profile" 
              class="rounded-full h-10 w-10 object-cover border-2" 
            />
          </RouterLink>

          <!-- Dropdown Menu -->
          <div class="relative">
            <button 
              @click="showMenu = !showMenu" 
              class="p-2 rounded-full hover:bg-gray-700"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 5.5a1.5 1.5 0 110-3 
                         1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 
                         1.5 1.5 0 010 3zm0 6a1.5 1.5 0 110-3 
                         1.5 1.5 0 010 3z" />
              </svg>
            </button>

            <div v-if="showMenu" class="absolute right-0 mt-2 w-48 bg-gray-200 shadow-2xl rounded z-50 text-black">
              <div class="flex flex-col">
                <RouterLink 
                  to="/Talkify/post" 
                  class="px-4 py-2 text-lg font-semibold hover:bg-gray-100"
                >Post</RouterLink>
                <RouterLink 
                  v-show="!isLoggedIn" 
                  to="/Talkify/login" 
                  class="px-4 py-2 text-lg font-semibold hover:bg-gray-100"
                >Login</RouterLink>
                <RouterLink 
                  to="/Talkify/profile" 
                  class="px-4 py-2 text-lg font-semibold hover:bg-gray-100"
                >Settings</RouterLink>
                <button 
                  v-if="isLoggedIn" 
                  @click="logout" 
                  class="px-4 py-2 text-start text-lg font-semibold hover:bg-gray-100 cursor-pointer"
                >Logout</button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>

    <main class="container mx-auto mt-6 lg:px-4">
      <div v-if="showMessages" class=" z-50 relative w-full">
        <MessageTab />
      </div>
      <RouterView />
    </main>
  </div>
</template>
