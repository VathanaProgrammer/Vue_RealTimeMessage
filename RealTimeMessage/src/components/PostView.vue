<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-900">Create a New Post</h2>

    <form @submit.prevent="submitPost" class="space-y-6">
      <div>
        <label for="description" class="block mb-2 font-semibold text-gray-700">Description</label>
        <input
          id="description"
          type="text"
          v-model="des"
          placeholder="Enter your post description..."
          class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label class="block mb-2 font-semibold text-gray-700">Upload Images</label>
        <div
          @dragover.prevent
          @drop.prevent="handleDrop"
          class="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
          @click="$refs.fileInput.click()"
        >
          <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
          <p class="text-gray-500">Click or drag and drop files here</p>
          <p class="text-xs text-gray-400 mt-1">Supported: SVG, PNG, JPG, GIF (Max size: 5MB each)</p>
          <input
            type="file"
            multiple
            ref="fileInput"
            class="hidden"
            @change="handleFileChange"
            accept="image/*"
          />
        </div>

        <div v-if="images.length" class="mt-4 flex flex-wrap gap-3">
          <div v-for="(img, index) in images" :key="index" class="relative w-24 h-24 rounded overflow-hidden border border-gray-300">
            <img :src="img.preview" alt="Preview" class="object-cover w-full h-full" />
            <button
              type="button"
              @click="removeImage(index)"
              class="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 text-white flex items-center justify-center hover:bg-red-700"
              aria-label="Remove image"
            >
              &times;
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="!des.trim() && images.length === 0"
        class="w-full bg-blue-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
      >
        Post
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createPost } from '@/axios'

const des = ref('')
const images = ref([])

const storeUser = JSON.parse(localStorage.getItem('user') || '{}')
const userId = storeUser.id || null

// Convert file to preview URL
const toPreview = (file) => {
  return {
    file,
    preview: URL.createObjectURL(file),
  }
}

const handleFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files).map(toPreview)
  images.value.push(...selectedFiles)
}

const handleDrop = (event) => {
  const droppedFiles = Array.from(event.dataTransfer.files).map(toPreview)
  images.value.push(...droppedFiles)
}

const removeImage = (index) => {
  URL.revokeObjectURL(images.value[index].preview) // revoke to free memory
  images.value.splice(index, 1)
}

const submitPost = async () => {
  if (!userId) {
    alert('User not logged in!')
    return
  }

  const formData = new FormData()
  formData.append('userId', userId)
  formData.append('description', des.value)

  images.value.forEach(({ file }) => {
    formData.append('imageFiles[]', file)
  })

  try {
    const response = await createPost(formData)
    console.log('Post created:', response.data)
    des.value = ''
    images.value.forEach(img => URL.revokeObjectURL(img.preview))
    images.value = []
    alert('Post created successfully!')
  } catch (error) {
    console.error(error)
    alert('Failed to create post.')
  }
}
</script>

<style scoped>
/* add custom scrollbar to image previews if needed */
</style>
