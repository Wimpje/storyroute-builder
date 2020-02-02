import Vue from 'vue'
import Router from 'vue-router'
import fb from '@/plugins/firebase'

import Login from '@/components/auth/Login.vue'
import Home from '@/views/Home.vue'
import Points from '@/views/Points.vue'
import Routes from '@/views/Routes.vue'
import Help from '@/views/Help.vue'

Vue.use(Router)

const r = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/user',
      name: 'Login',
      component: Login
    },
    {
      path: '/routes',
      name: 'Routes',
      component: Routes,
      meta: {
        requiresAuth: true
     }
    },
    {
      path: '/points',
      name: 'Points',
      component: Points,
      meta: {
        requiresAuth: true
     }
    },
    {
      path: '/help',
      name: 'Help',
      component: Help
    }
  ]
})

r.beforeEach((to, from, next) => {
  const currentUser = fb.auth().currentUser;
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  console.log(`route change, user: ${currentUser}, requires auth: ${requiresAuth}` )

  if (requiresAuth && !currentUser) next('/user');
  else next();
});

export default r
