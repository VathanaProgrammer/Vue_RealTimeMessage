<template>
  <div class="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md">
    <h2 class="text-2xl font-bold mb-6 text-gray-900">Create a New Post</h2>

    <form @submit.prevent="submitPost"  class="space-y-6">
      <!-- Description -->
      <div>
        <label for="description" class="block mb-2 font-semibold text-gray-700">
          Description
        </label>
        <input
          id="description"
          type="text"
          v-model="des"
          placeholder="Enter your post description..."
          class="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <!-- File Upload Area -->
      <div>
        <label class="block mb-2 font-semibold text-gray-700">Upload Images or Videos</label>
        <div
          @dragover.prevent
          @drop.prevent="handleDrop"
          class="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500"
          @click="$refs.fileInput.click()"
        >
          <svg
            class="w-12 h-12 mb-3 text-gray-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 4v16m8-8H4" />
          </svg>
          <p class="text-gray-500">Click or drag and drop files here</p>
          <p class="text-xs text-gray-400 mt-1">
            Supported: JPG, PNG, GIF, MP4 (Max 5MB each)
          </p>
          <input
            type="file"
            multiple
            ref="fileInput"
            class="hidden"
            @change="handleFileChange"
            accept="image/*,video/*,video/quicktime"
          />
        </div>

        <!-- Preview Thumbnails -->
        <div v-if="mediaFiles.length" class="mt-4 flex flex-wrap gap-3">
          <div
            v-for="(media, index) in mediaFiles"
            :key="index"
            class="relative w-24 h-24 rounded overflow-hidden border border-gray-300"
          >
            <template v-if="media.file.type.startsWith('image/')">
              <img :src="media.preview" alt="Preview" class="object-cover w-full h-full" />
            </template>
            <template v-else-if="media.file.type.startsWith('video/')">
              <video
                :src="media.preview"
                class="object-cover w-full h-full"
                muted
                loop
                playsinline
              ></video>
            </template>

            <button
              type="button"
              @click="removeMedia(index)"
              class="absolute top-1 right-1 bg-red-600 rounded-full w-5 h-5 text-white flex items-center justify-center hover:bg-red-700"
              aria-label="Remove file"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
      <!-- Status Message -->
        <p v-if="statusMessage" class="text-center mt-4 font-medium"
          :class="{
            'text-blue-600': isLoading,
            'text-green-600': statusMessage.includes('success'),
            'text-red-600': statusMessage.includes('Failed') || statusMessage.includes('not logged'),
          }">
          {{ statusMessage }}
        </p>


      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="!des.trim() && mediaFiles.length === 0"
        class="w-full bg-blue-600 text-white py-3 rounded-md font-semibold disabled:opacity-50 hover:bg-blue-700 transition"
      >
        Post
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { createPost } from '@/axios'

const statusMessage = ref('')
const isLoading = ref(false)

const des = ref('')
const mediaFiles = ref([]) // array of { file, preview }

const userStore = useUserStore()

const allowedTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'video/mp4',
  'video/quicktime' // ← this is what .MOV files usually use
]

const maxSizeMB = 100

const toPreview = (file) => ({
  file,
  preview: URL.createObjectURL(file),
})

// File input handler
const handleFileChange = (event) => {
  const files = Array.from(event.target.files)
  for (const file of files) {
    console.log('File:', file.name);
    console.log('Type:', file.type); // check MIME type here
  }
  addValidFiles(files)
}

// Drag & drop handler
const handleDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  addValidFiles(files)
}

// Validate and add files
const addValidFiles = (files) => {
  const validFiles = files.filter((file) => {
    const isValid = allowedTypes.includes(file.type) && file.size <= maxSizeMB * 1024 * 1024
    if (!isValid) {
      alert(`Invalid file: ${file.name}. Must be JPG, PNG, GIF, or MP4 under 100MB.`)
    }
    return isValid
  })

  const withPreview = validFiles.map(toPreview)
  mediaFiles.value.push(...withPreview)
}

// Remove a file
const removeMedia = (index) => {
  URL.revokeObjectURL(mediaFiles.value[index].preview)
  mediaFiles.value.splice(index, 1)
}

// Submit post
const submitPost = async () => {
  if (!userStore.user) {
    statusMessage.value = 'User not logged in!'
    return
  }

  const formData = new FormData()
  formData.append('description', des.value)

  mediaFiles.value.forEach(({ file }) => {
    formData.append('mediaFiles', file)
  })

  try {
    isLoading.value = true
    statusMessage.value = 'Posting... Please wait'

    const response = await createPost(formData)
    console.log('Post created:', response.data)

    des.value = ''
    mediaFiles.value.forEach((m) => URL.revokeObjectURL(m.preview))
    mediaFiles.value = []

    statusMessage.value = '✅ Post created successfully!'
  } catch (error) {
    console.error('Failed to create post:', error)
    statusMessage.value = '❌ Failed to create post.'
  } finally {
    isLoading.value = false
    setTimeout(() => (statusMessage.value = ''), 5000) // hide after 5s
  }
}

</script>

<style scoped>
/* Tailwind takes care of most styling */
</style>
