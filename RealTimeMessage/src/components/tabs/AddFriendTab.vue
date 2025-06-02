<template>
  <div class="w-full max-w-screen-lg mx-auto p-4 space-y-12">
    <!-- Friends Section -->
    <section v-if="friendUsers.length">
      <h2 class="text-2xl font-bold text-black mb-6">Your Friends</h2>
      <div class="flex flex-wrap gap-6 justify-start">
        <div
          v-for="user in friendUsers"
          :key="user.id"
          class="w-64 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex flex-col items-center p-6">
            <img
              class="w-24 h-24 mb-4 rounded-full shadow-lg"
              :src="APT_BASE_URL + user.profileImage"
              :alt="user.username"
            />
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ user.username }}
            </h5>
          </div>
        </div>
      </div>
    </section>

    <!-- Not Friends Section -->
    <section v-if="otherUsers.length">
      <h2 class="text-2xl font-bold text-black mb-6">People You May Know</h2>
      <div class="flex flex-wrap gap-6 justify-start">
        <div
          v-for="user in otherUsers"
          :key="user.id"
          class="w-64 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="flex flex-col items-center p-6">
            <img
              class="w-24 h-24 mb-4 rounded-full shadow-lg"
              :src="APT_BASE_URL + user.profileImage"
              :alt="user.username"
            />
            <h5 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ user.username }}
            </h5>
            <div class="flex mt-4">
              <button
                @click="handleAddFriend(user.id)"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800"
              >
                Add friend
              </button>
              <button
                class="ml-2 px-4 py-2 text-sm font-medium bg-white border border-gray-200 text-gray-900 rounded-lg hover:bg-gray-100"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getCurrentUser, getFriendsOfUser, getNoFriendOfUser, sendFriendRequest } from "@/axios"

const APT_BASE_URL = "http://localhost:9200"
const friendUsers = ref([])
const otherUsers = ref([])
const currentUserId = ref(null)

const loadFriends = async () => {
  try {
    const [friendsRes, nonFriendsRes] = await Promise.all([
      getFriendsOfUser(),        // backend should detect user by cookie
      getNoFriendOfUser()        // same — get list of not-friends
    ])
    friendUsers.value = friendsRes.data
    otherUsers.value = nonFriendsRes.data
  } catch (err) {
    console.error("Failed to fetch friends/non-friends", err)
  }
}

const handleAddFriend = async (receiverId) => {
  try {
    await sendFriendRequest(receiverId)   // only send receiverId, backend knows who is sender
    alert("Friend request sent!")
    await loadFriends()                   // Refresh both lists
  } catch (err) {
    console.error("Failed to send request:", err)
    alert("Failed to send request.")
  }
}

// When component loads, get current user info and then fetch friends
onMounted(async () => {
  try {
    const res = await getCurrentUser()
    currentUserId.value = res.data.id     // for local use if needed
    await loadFriends()
  } catch (err) {
    console.error("User not logged in or failed to get profile:", err)
  }
})
</script>

