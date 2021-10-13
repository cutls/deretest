import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Home from '../views/Home.vue'
import Print from '../views/Print.vue'
import Make from '../views/Make.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
	{
		path: '/q/:id',
		name: 'Home',
		component: Home,
	},
	{
		path: '/p/:id',
		name: 'Print',
		component: Print,
	},
	{
		path: '/make',
		name: 'Make',
		component: Make,
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes,
})

export default router
