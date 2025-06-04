<template>
  <div class="w-2/2 md:w-1/2 mx-auto mt-10 p-6 bg-white">
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
          class="w-full border border-gray-300 rounded-lg text-black  px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
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
          class="w-full border border-gray-300 rounded text-black px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
        />
        <span v-if="errorMessage" class="text-red-600 text-sm mt-1 block">{{ errorMessage }}</span>
      </div>

      <div class="w-full flex justify-between items-center">
        <button
          type="submit"
          class="bg-blue-600 text-white py-2 px-5 font-bold rounded hover:bg-blue-700 transition text-lg"
        >
          Login
        </button>
        <RouterLink to="/register" class="text-blue-700 text-sm  md:text-lg hover:border-b-2 border-blue-600 p-0 outline-none cursor-pointer">
          Don't have an account?
        </RouterLink>
      </div>
    </form>
  </div>
</template>


<script setup>
import axios from 'axios'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import API_BASE_URL from '@/api';

console.log("API_BASE_URL: ", API_BASE_URL);
const userStoer = useUserStore();
const router = useRouter()
const email = ref('')
const password = ref('')
const errorMessage = ref('');

console.log("API_BASE_URL: ", API_BASE_URL + "/api");
const api = axios.create({
  baseURL: API_BASE_URL + "/api",
  withCredentials: true,   // send cookie
})

async function submitLogin() {
  try {
    // 1️⃣ Authenticate — sets HttpOnly cookie
    await api.post('/auth/login', {
      email: email.value,
      password: password.value
    });

    // 2️⃣ Fetch user from cookie
    const res = await api.get('/users/me');
    if (res.data.success) {
      userStoer.setUser(res.data.data)
      router.push('/');
    } else {
      // unlikely, but handle gracefully
      alert(res.data.message);
    }
  } catch (err) {
    // err.response.data is an ApiResponse on 401 or 500
   const msg = err.response?.data?.message || 'Login failed';
  errorMessage.value = msg;
  }
}

</script>