import axios from 'axios'

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:9200/api', //172.20.10.2 // 192.168.18.61
  withCredentials: true, // Allow cookies to be sent with requests
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Register user function
export const registerUser = (formData) => {
  return api.post('auth/register', formData);
}

export const loginUser = (data) => {
  return api.post('users/login', data);
}

export const createPost = (data) => {
    
    return api.post("posts/create", data);
}

export const getAllPost = () =>{
  return api.get("/posts");
}

export const getAllUsers = () =>{
  return api.get("/users");
}

// Get current logged-in user using cookie token
export const getCurrentUser = () => api.get("/users/me")

// These APIs should auto-detect logged-in user by token
export const getFriendsOfUser = () => api.get("/users/friends")
export const getNoFriendOfUser = () => api.get("/users/non-friends")

// Only receiverId needed, backend knows who sent the request
export const sendFriendRequest = (receiverId) =>
  api.post("/friend-requests/send", { receiverId })

export default api
