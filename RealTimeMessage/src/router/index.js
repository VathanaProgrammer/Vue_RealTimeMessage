import { createRouter, createWebHistory } from 'vue-router'
import RegisterForm from '../components/RegisterForm.vue' // path might vary
import AppView from '../components/AppView.vue';
import App from '@/App.vue';
import PostView from "../components/PostView.vue";
import LoginView from '../components/LoginView.vue';
import ProfileView from '../components/ProfileView.vue';
const routes = [
  {
    path: '/register',
    component: RegisterForm
  },
  {
    path: '/',
    component: AppView
  },
  {
    path: "/Talkify/post",
    component: PostView
  },
  {
    path: "/Talkify/login",
    component: LoginView
  },
  {
    path: '/Talkify/profile',
    component: ProfileView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router;

