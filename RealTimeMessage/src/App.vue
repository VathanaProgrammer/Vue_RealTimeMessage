<script setup>
import { ref, watchEffect, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { user, clearUser } from '@/stores/userStore'

const router = useRouter()

const userProfileImage = ref('./images/OIP.jpg')
const isLoggedIn = ref(false)

// Update profile image & login status when the shared user changes
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
  // Load user from localStorage on page load (e.g. after refresh)
  const storedUser = JSON.parse(localStorage.getItem('user'))
  if (storedUser) {
    user.value = storedUser // this will trigger watchEffect above
  }
})

const logout = () => {
  localStorage.removeItem('user')
  clearUser()
  router.push('/Talkify/login')
}
</script>

<template>
  <div>
    <header class="bg-gray-800 text-white shadow">
      <nav class="container mx-auto flex items-center justify-between px-4 py-3">
        <div class="text-xl font-semibold">
          <RouterLink to="/" class="hover:text-blue-400 text-3xl font-bold">Talkify</RouterLink>
        </div>
        <div class="space-x-4 flex items-center">
          <RouterLink to="/" class="hover:text-blue-400">Home</RouterLink>
          <RouterLink to="/register" class="hover:text-blue-400">Register</RouterLink>
          <RouterLink to="/Talkify/post" class="hover:text-blue-400">Post</RouterLink>
          
          <!-- If user is logged in -->
          <template v-if="isLoggedIn">
            <RouterLink class="inline-flex items-center">
              <img :src="userProfileImage" alt="User Profile" class="rounded-full h-10 w-10 object-cover border-2" />
            </RouterLink>
            <button @click="logout" class="hover:text-red-400 font-medium">Logout</button>
          </template>

          <!-- Else show login -->
          <template v-else>
            <RouterLink to="/Talkify/login" class="hover:text-blue-400">Login</RouterLink>
          </template>
        </div>
      </nav>
    </header>

    <main class="container mx-auto mt-6 px-4">
      <RouterView />
    </main>
  </div>
</template>
