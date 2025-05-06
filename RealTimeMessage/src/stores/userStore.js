// src/stores/userStore.js
import { ref } from 'vue'

export const user = ref(null)

export const setUser = (userData) => {
  user.value = userData
}

export const clearUser = () => {
  user.value = null
}
