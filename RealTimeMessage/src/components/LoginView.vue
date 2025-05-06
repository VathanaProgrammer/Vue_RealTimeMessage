<template>
    <div class="w-1/2 mx-auto mt-10 p-6 bg-white">
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900">Login your account</h2>
      <form @submit.prevent="submitLogin" class="space-y-4">
        <div>
          <label for="email" class="block mb-1 font-medium text-gray-700 text-lg">Email</label>
          <input
            type="email"
            v-model="email"
            id="email"
            required
            placeholder="Enter your email"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
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
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 placeholder-gray-400"
          />
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg"
        >
          Login
        </button>
      </form>
    </div>
  </template>
  
  <script setup>
  import axios from 'axios'
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { setUser } from '@/stores/userStore';
  const router = useRouter()
  const email = ref('')
  const password = ref('')
  
  // Create an axios instance for JSON requests
const apiJson = axios.create({
  baseURL: 'http://localhost:9200/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const submitLogin = async () => {
  const loginData = {
    email: email.value,   // Send email instead of username
    password: password.value,  // Send password as usual
  }
  try {
    const response = await apiJson.post('/users/login', loginData)  // POST request to login
        // Save user data to localStorage after successful registration
        localStorage.setItem('user', JSON.stringify({
      username: response.data.username,
      profileImage: response.data.profileImage, // Assuming profile image is part of the response
    }));
    setUser({
  username: response.data.username,
  profileImage: response.data.profileImage,
})
    console.log(response.data)
    router.push('/')  // Redirect to home or another page
  } catch (err) {
    console.error('Login error:', err.response ? err.response.data : err)
  }
}


  
  </script>
  