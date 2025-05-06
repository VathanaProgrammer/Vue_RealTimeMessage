<template>
  <div class="w-1/2 mx-auto mt-10 p-6 bg-white">
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
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
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

      <div class="h-full w-full">
    <label for="file_input" class="block mb-1 font-medium text-gray-700 text-lg">Profile Image</label>
    <input
      id="file_input"
      type="file"
      v-on:change="handleFileChange"
      class="w-full border h-full border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
    />
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
import { useRouter } from 'vue-router'

const router = useRouter()
const username = ref('')
const email = ref('')
const password = ref('')
const image = ref(null)

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
        // Save user data to localStorage after successful registration
        localStorage.setItem('user', JSON.stringify({
      username: response.data.username,
      profileImage: response.data.profileImage, // Assuming profile image is part of the response
    }));
    router.push('/')
  } catch (err) {
    console.error('Registration error:', err)
  }
}

</script>
