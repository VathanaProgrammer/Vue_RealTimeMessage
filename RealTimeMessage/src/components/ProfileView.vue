<template>
  <div class="mt-6 w-full flex items-center justify-center h-full">
    <div class="bg-white w-full lg:w-[800px] rounded-md h-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-4">
      <div class="flex items-center">
        <img alt="userprofile" :src="previewImage" class="rounded-full w-24 h-24 object-cover">
        <input
          @change="onFileChange"
          type="file"
          class="hidden"
          ref="fileInput"
          accept="image/png, image/jpg, image/jpeg, image/gif"
        />
        <div class="flex flex-col gap-2 items-start justify-start ms-2">
          <button @click="triggerFileInput" class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-md">
            Upload New Photo
          </button>
          <p class="text-gray-700 text-sm font-medium text-opacity-70">
            Allowed JPG, GIF or PNG. Max size of 800KB
          </p>
        </div>
      </div>

      <!-- Feedback message -->
      <p v-if="message" :class="{'text-green-600': success, 'text-red-500': !success}" class="mt-4">
        {{ message }}
      </p>

      <form class="mt-10 w-full" @submit.prevent="updateUser">
        <div class="w-full flex md:flex-row flex-col justify-between gap-3 my-5">
          <div class="w-full">
            <label class="text-gray-500 font-sm block mb-1">Username</label>
            <input
              v-model="username"
              type="text"
              class="px-3 py-1 w-full text-gray-600 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg shadow-blue-500"
              required
            />
          </div>
          <div class="w-full">
            <label class="text-gray-500 font-sm block mb-1">Email</label>
            <input
              v-model="email"
              type="email"
              class="px-3 py-1 w-full text-gray-600 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg shadow-blue-500"
              required
            />
          </div>
        </div>

        <div class="w-full flex md:flex-row flex-col justify-between gap-3 my-5">
          <div class="w-full">
            <label class="text-gray-500 font-sm block mb-1">Current Password</label>
            <input
              v-model="currentPassword"
              type="password"
              class="px-3 py-1 w-full text-gray-600 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg shadow-blue-500"
              required
            />
          </div>
          <div class="w-full">
            <label class="text-gray-500 font-sm block mb-1">New Password</label>
            <input
              v-model="newPassword"
              type="password"
              class="px-3 py-1 w-full text-gray-600 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg shadow-blue-500"
            />
          </div>
        </div>

        <div class="w-full flex md:flex-row flex-col justify-between gap-3 my-5">
          <div class="w-full">
            <label class="text-gray-500 font-sm block mb-1">Confirm Password</label>
            <input
              v-model="confirmPassword"
              type="password"
              class="px-3 py-1 w-full text-gray-600 placeholder:text-gray-400 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:shadow-lg shadow-blue-500"
            />
          </div>
        </div>

        <div class="flex justify-start gap-3">
          <button
            type="submit"
            class="text-white bg-blue-500 px-4 py-2 rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.1)]"
          >
            Save Changes
          </button>
          <button type="button" @click="resetForm" class="text-gray-600 bg-gray-200 px-4 py-2 rounded-md">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useUserStore } from '@/stores/userStore';
import API_BASE_URL from '@/api';

const user = useUserStore();
const fileInput = ref(null);

const username = ref(user.user.username);
const email = ref(user.user.email);
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const previewImage = ref(API_BASE_URL + user.user.profileImage);
const profileFile = ref(null); // to store selected file

const message = ref('');
const success = ref(false);

function triggerFileInput() {
  fileInput.value.click();
}

function onFileChange(e) {
  const file = e.target.files[0];
  if (!file) return;

  profileFile.value = file;

  const reader = new FileReader();
  reader.onload = (event) => {
    previewImage.value = event.target.result;
  };
  reader.readAsDataURL(file);
}

async function updateUser() {
  if (newPassword.value !== confirmPassword.value) {
    message.value = "New passwords do not match.";
    success.value = false;
    return;
  }

  const formData = new FormData();
  formData.append('username', username.value);
  formData.append('email', email.value);
  formData.append('currentPassword', currentPassword.value);
  formData.append('newPassword', newPassword.value);
  if (profileFile.value) {
    formData.append('profileImage', profileFile.value);
  }

  try {
    const response = await axios.put(`${API_BASE_URL}/api/users/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      withCredentials: true, // for cookie-based auth
    });

    message.value = response.data;
    success.value = true;
    // user.ge // refresh store
  } catch (err) {
    console.error(err);
    message.value = err.response?.data || 'Something went wrong.';
    success.value = false;
  }
}

function resetForm() {
  username.value = user.user.username;
  email.value = user.user.email;
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  previewImage.value = API_BASE_URL + user.user.profileImage;
  profileFile.value = null;
  message.value = '';
}
</script>
