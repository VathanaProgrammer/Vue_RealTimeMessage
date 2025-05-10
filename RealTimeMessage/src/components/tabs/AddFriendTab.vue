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
              :src="'http://192.168.18.61:9200' + user.profileImage"
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
              :src="'http://192.168.18.61:9200' + user.profileImage"
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
import { ref, onMounted } from "vue";
import { getFriendsOfUser, getNoFriendOfUser, sendFriendRequest } from "@/axios";

const currentUser = JSON.parse(localStorage.getItem("user"));
const currentUserId = currentUser?.id;

const friendUsers = ref([]);
const otherUsers = ref([]);

const getUserFriends_API = async (userId) => {
  try {
    const response = await getFriendsOfUser(userId);
    friendUsers.value = response.data;
  } catch (err) {
    console.error("Error while fetching friends:", err);
  }
};

const getNotFriendOfUser_API = async (userId) => {
  try {
    const response = await getNoFriendOfUser(userId);
    otherUsers.value = response.data;
  } catch (err) {
    console.error("Error while fetching non-friends:", err);
  }
};

const handleAddFriend = async (receiverId) => {
  try {
    await sendFriendRequest(currentUserId, receiverId);
    alert("Friend request sent!");
    await getUserFriends_API(currentUserId);     // Refresh list
    await getNotFriendOfUser_API(currentUserId); // Refresh list
  } catch (err) {
    console.error("Failed to send request:", err);
    alert("Failed to send request.");
  }
};

onMounted(() => {
  getUserFriends_API(currentUserId);
  getNotFriendOfUser_API(currentUserId);
});

</script>
