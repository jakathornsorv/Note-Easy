import Login from '@/views/Login.vue';
import NoteList from '@/views/NoteList.vue';

import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Login',
      component: Login,
    },
    {
      path: '/NoteList',
      name: 'NoteList',
      component: NoteList,
      meta: { requiresAuth: true }, 
    },
  ],
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('userId'); 

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'Login' }); 
  } else {
    next(); 
  }
});

export default router;
