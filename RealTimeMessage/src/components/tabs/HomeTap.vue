<template>
  <div class="w-full container mx-auto p-4 space-y-6">
    <div
      v-for="post in posts"
      :key="post.id"
      class="border rounded-lg shadow-md p-4 bg-white dark:bg-gray-800"
    >
      <!-- User profile image, username, and timestamp side by side -->
      <div class="flex items-center mb-1 space-x-3">
        <img
          v-if="post.user && post.user.profileImage"
          :src="APT_BASE_URL + post.user.profileImage"
          class="w-10 h-10 rounded-full object-cover"
          alt="User profile image"
        />
        <div>
          <div class="text-sm font-semibold text-gray-700 dark:text-gray-200">
            {{ post.user ? post.user.username : 'Unknown User' }}
          </div>
          <div class="text-xs text-gray-500 dark:text-gray-400">
            {{ formatDateTime(post.createdAt) }}
          </div>
        </div>
      </div>

      <!-- Description -->
      <p class="text-gray-800 dark:text-gray-300 mb-3">
        {{ post.description }}
      </p>

      <!-- Media files (images/videos) -->
      <!-- Media files (images/videos) -->
      <div
        v-if="post.mediaFiles && post.mediaFiles.length"
        :class="getGridClass(post.mediaFiles.length)"
        class="gap-2 mb-3"
      >
        <div v-for="(media, index) in post.mediaFiles" :key="index">
          <img
            v-if="media.type === 'image'"
            :src="APT_BASE_URL + media.url"
            class="w-full h-auto max-h-96 object-cover rounded-lg cursor-pointer"
            alt="Post image"
            @click="openImagePopup(APT_BASE_URL + media.url)"
          />
          <video
            v-else-if="media.type === 'video'"
            controls
            class="w-full h-auto max-h-96 rounded-lg object-cover"
            :src="APT_BASE_URL + media.url"
          ></video>
        </div>
      </div>


      <!-- Like and Comment Buttons -->
      <div class="flex items-center space-x-6 mb-3">
        <!-- Like button -->
        <button
          class="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
          @click="handleLike(post)"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            :fill="post.likedByCurrentUser ? 'currentColor' : 'none'"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42
                 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5
                 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55
                 11.54L12 21.35z"
            />
          </svg>
          <span>{{ post.likeCount }}</span>
        </button>

        <!-- Comment button -->
        <button
          class="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition"
          @click="toggleCommentInput(post.id)"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 8h2a2 2 0 0 1 2
                 2v7a2 2 0 0 1-2 2H7l-4
                 4V10a2 2 0 0 1 2-2h2m10-4H7a2
                 2 0 0 0-2 2v12l4-4h8a2 2 0 0 0
                 2-2v-6a2 2 0 0 0-2-2z"
            />
          </svg>
          <span>{{ post.comments.length }}</span>
        </button>
      </div>

      <!-- Comment Input Area (toggle per post) -->
      <div v-if="commentVisible[post.id]" class="mb-3">
        <textarea
          v-model="commentText[post.id]"
          rows="2"
          placeholder="Write a comment..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
        ></textarea>
        <div class="flex justify-end mt-2">
          <button
            @click="submitComment(post)"
            class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
            :disabled="!commentText[post.id]?.trim()"
          >
            Sent
          </button>
        </div>
      </div>

      <!-- Comments list -->
      <div v-if="post.comments && post.comments.length" class="space-y-2">
        <div class="text-sm text-gray-600 dark:text-gray-300 font-medium">Comments:</div>
        <div
          v-for="(comment, idx) in post.comments"
          :key="idx"
          class="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm text-gray-800 dark:text-gray-200"
        >
          <span class="font-semibold">{{ comment.user?.username || 'Anonymous' }}:</span>
          <span class="ml-1">{{ comment.content }}</span>
        </div>
      </div>
    </div>

    <!-- Image Popup Modal -->
    <div
      v-if="imagePopupUrl"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      @click.self="closeImagePopup"
    >
      <div class="relative max-w-3xl max-h-full p-4">
        <button
          @click="closeImagePopup"
          class="absolute -top-6 right-4 text-white text-3xl font-bold hover:text-red-500"
          aria-label="Close image popup"
        >
          &times;
        </button>
        <img :src="imagePopupUrl" class="max-w-full max-h-[90vh] rounded-lg shadow-lg" alt="Full post image" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { onMounted, reactive, ref } from 'vue'
import axios from 'axios'
import { getAllPost } from '@/axios'
import API_BASE_URL from '@/api'
import { isLogin } from '../../authState';

const router = useRouter()

const APT_BASE_URL = API_BASE_URL
const posts = ref([])

const api = axios.create({
  baseURL: API_BASE_URL + "/api",
  withCredentials: true,   // send cookie
})

const checkLogin = async () => {
  try {
    const res = await api.get('/users/me')
    if (res.data.success) {
      isLogin.value = true
    }
  } catch (err) {
    console.error("Login check failed")
  }
}
const getGridClass = (count) => {
  if (count === 1) return 'grid grid-cols-1';
  if (count === 2) return 'grid grid-cols-2';
  return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3';
}

// Reactive maps for comment input visibility and text
const commentVisible = reactive({})
const commentText = reactive({})

// New reactive ref for the image popup URL
const imagePopupUrl = ref(null)

const getAllPosts = async () => {
  try {
    const response = await getAllPost()
    console.log("Posts fetched:", response.data)
    // Initialize each post’s comment visibility and like state
    posts.value = response.data.map(p => ({
      ...p,
      likedByCurrentUser: false  // you can set this based on your API
    }))
    posts.value.forEach(post => {
      commentVisible[post.id] = false
      commentText[post.id] = ''
    })
  } catch (err) {
    console.log(err)
  }
}

const formatDateTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleString()
}

// Toggle the comment input area for a given post
const toggleCommentInput = (postId) => {
  if (!isLogin.value) {
    Swal.fire({
      icon: 'warning',
      title: 'Not logged in',
      text: 'You need to login before commenting!',
      confirmButtonText: 'Go to Login',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
       router.push("/Talkify/login");
      }
    })
    return
  }

  // Toggle comment input visibility
  commentVisible[postId] = !commentVisible[postId]
  if (!commentVisible[postId]) {
    commentText[postId] = ''
  }
}

// Handle “like” click
const handleLike = async (post) => {
  try {
    await axios.post(`${APT_BASE_URL}/api/likes`, 
      { postId: post.id }, 
      {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true // Ensure cookies are sent for auth
      }
    )

    // Toggle local like state
    if (post.likedByCurrentUser) {
      post.likeCount--
    } else {
      post.likeCount++
    }
    post.likedByCurrentUser = !post.likedByCurrentUser

  } catch (err) {
    console.error('Failed to like post:', err.response?.data || err.message)
  }
}



// Submit a new comment for a given post
const submitComment = async (post) => {
  const content = commentText[post.id]?.trim()
  if (!content) return

  try {
    const response = await axios.post(`${APT_BASE_URL}/api/comments/add`, {
      postId: post.id,
      text: content,
    },
    { withCredentials: true }) // Ensure cookies are sent for auth
    // Assuming the API returns the created comment object { id, content, user: { username,... }, createdAt }
    post.comments.push(response.data)
    commentText[post.id] = ''
    commentVisible[post.id] = false
  } catch (err) {
    console.error('Failed to submit comment:', err)
  }
}

// Open image popup modal with the selected image URL
const openImagePopup = (url) => {
  imagePopupUrl.value = url
}

// Close image popup modal
const closeImagePopup = () => {
  imagePopupUrl.value = null
}

onMounted(() => {
  getAllPosts()
  checkLogin()
})
</script>
