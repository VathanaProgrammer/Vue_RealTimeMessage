// stores/userStore.js
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,     // Will hold the currently logged‐in user object (including profileImage)
  }),
  actions: {
    setUser(data) {
      this.user = data
    },
    clearUser() {
      this.user = null
    }
  },
  persist: true,     // so it survives page refresh
})
