import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Cars from '../views/Cars.vue'
import Customers from '../views/Customers.vue'
import Rentals from '../views/Rentals.vue'

const routes = [
  { path: '/', name: 'Dashboard', component: Dashboard },
  { path: '/cars', name: 'Cars', component: Cars },
  { path: '/customers', name: 'Customers', component: Customers },
  { path: '/rentals', name: 'Rentals', component: Rentals },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
