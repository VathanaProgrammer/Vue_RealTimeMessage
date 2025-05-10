<template>
  <div class="w-full container mx-auto p-4 space-y-6">
    <div
      v-for="post in posts"
      :key="post.id"
      class="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800"
    >
      <!-- User Info -->
      <div class="flex items-center mb-4">
        <img
          :src="'http://192.168.18.61:9200' + post.user.profileImage"
          class="w-10 h-10 rounded-full object-cover"
          alt="User profile image"
        />
        <div class="ml-3 text-sm text-gray-700 dark:text-gray-200">
          {{ post.user.username }}
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-800 dark:text-gray-300 mb-3">{{ post.description }}</p>
  
      <!-- Images -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <img
          v-for="(img, index) in post.images"
          :key="index"
          :src="'http://192.168.18.61:9200' + img.url"
          class="w-full h-48 object-cover rounded-lg"
          alt="Post image"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getAllPost } from '@/axios'

const posts = ref([])

const getAllPosts = async () => {
  try {
    const response = await getAllPost()
    posts.value = response.data
    console.log(posts.value)
  } catch (err) {
    console.log(err)
  }
}

onMounted(() => {
  getAllPosts()
})
</script>
