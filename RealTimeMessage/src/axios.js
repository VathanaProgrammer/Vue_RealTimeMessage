import axios from 'axios'

// Create an axios instance
const api = axios.create({
  baseURL: 'http://localhost:9200/api', //172.20.10.2 // 192.168.18.61
  headers: {
    'Content-Type': 'multipart/form-data',
  },
})

// Register user function
export const registerUser = (formData) => {
  return api.post('users/register', formData);
}

// Example: Login user
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

export const sendFriendRequest = (senderId, receiverId) => {
  return api.post("/friend-requests/send", {
    senderId,
    receiverId,
    status: "pending"
  });
}

export const getFriendsOfUser = (UserId) =>{
  return api.get("/users/getUserFriends", {
    params: {
      UserId
    }
  })
}

export const getNoFriendOfUser = (UserId) =>{
  return api.get("/users/getNoUserFriends", {
    params: {
      UserId
    }
  })
}
export default api
