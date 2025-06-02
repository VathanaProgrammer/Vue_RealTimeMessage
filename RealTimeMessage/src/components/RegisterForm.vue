<template>
  <div class="w-2/2 md:w-1/2 mx-auto mt-10 p-6 bg-white">
    <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">Register a new account</h2>
    <form @submit.prevent="submitForm" class="space-y-4">
      <div>
        <label for="username" class="block mb-1 font-medium text-gray-700 text-lg">Username</label>
        <input
          type="text"
          v-model="username"
          id="username"
          required
          placeholder="Enter your name"
          class="w-full border text-gray-800 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
      </div>
      <div>
        <label for="email" class="block mb-1 font-medium text-gray-700 text-lg">Email</label>
        <input
          type="email"
          v-model="email"
          id="email"
          required
          placeholder="Enter your email"
          class="w-full border text-gray-800 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
      </div>
      <div>
        <label for="password" class="block mb-1 font-medium text-gray-700 text-lg">Password</label>
        <input
          type="password"
          v-model="password"
          id="password"
          required
          placeholder="Enter your password"
          class="w-full text-gray-800 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
      </div>

      <div class="h-full w-full">
    <label for="file_input" class="block mb-1 font-medium text-gray-700 text-lg">Profile Image</label>
    <input
      id="file_input"
      type="file"
      v-on:change="handleFileChange"
      class="w-full border h-full border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
    />
    <span v-if="errorMessage" class="text-red-600 text-sm mt-1 block">{{ errorMessage }}</span>
  </div>


      <button
        type="submit"
        class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg"
      >
        Register
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { registerUser } from '@/axios'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const image = ref(null)
const errorMessage = ref('')
const userStore = useUserStore()

const handleFileChange = (event) => {
  image.value = event.target.files[0]
  // console.log('Selected image:', image.value) 
}

const submitForm = async () => {
  const formData = new FormData()
  formData.append('username', username.value)
  formData.append('email', email.value)
  formData.append('password', password.value)
  if (image.value) formData.append('profileImage', image.value)

  try {
    const response = await registerUser(formData)
    // console.log('User registered:', response.data)  // Check what response.data contains
    // console.log('Profile image URL:', response.data.profileImage)  // Ensure the image URL is correct
    userStore.setUser(response.data.data)
    
    router.push('/')
  } catch (err) {
    // 6️⃣ Axios throws for any status >= 300
    //    err.response.data should be { success:false, message:"Email is already in use" }
    if (err.response && err.response.status === 409) {
      // Email conflict
      errorMessage.value = err.response.data?.message || 'Email conflict'
    } else {
      // Other errors
      errorMessage.value = err.response?.data?.message || 'Registration failed'
    }
  }
}

</script>
