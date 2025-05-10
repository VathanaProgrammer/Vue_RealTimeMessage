<template>
    <div class="container mx-auto">
        <h2 class="font-bold text-2xl text-black ">Post</h2>
        <form class="space-y-4" action="" @submit.prevent="submitPost">
            <div class="">
                <label for="" class="block font-medium text-gray-700 text-lg ">Description</label>
                <input type="text"
                v-model="des"
                placeholder="Enter your description"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 text-gray-700 placeholder-gray-400">
            </div>
            <div class="">
                <div class="flex items-center justify-center w-full">
                    <label for="dropzone-file" class="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg class="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                            </svg>
                            <p class="mb-2 text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                        </div>
                        <input @change="handleFileChange" id="dropzone-file" type="file" multiple class="hidden" />
                    </label>
                </div> 
            </div>
            <button
        type="submit"
        class="w-40 float-end bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition text-lg"
      >
        Post
      </button>
        </form>
    </div>
</template>

<script setup>

import { ref } from "vue";
import { createPost } from "@/axios";
const des = ref('')
const images = ref([])
let userId = ref()
const storeUser = JSON.parse(localStorage.getItem("user"));
userId.value = storeUser.id;
console.log( "poster id : ",userId.value)
const handleFileChange = (event) => {
  const selectedFiles = Array.from(event.target.files);
  images.value.push(...selectedFiles); // append new files
};


const submitPost = async () => {
  const formData = new FormData();
  formData.append("userId", userId.value);
  formData.append("description", des.value);

  // ✅ Make sure to append multiple files correctly
  images.value.forEach((image) => {
    formData.append("imageFiles[]", image); // Append each file with the same name
  });

  try {
    const response = await createPost(formData);
    console.log(response.data);
  } catch (err) {
    console.log(err);
  }
};

</script>
