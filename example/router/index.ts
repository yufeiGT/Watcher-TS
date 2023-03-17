import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import Home from '@/views/Home.vue';
import Example from '@/views/Example.vue';

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/example',
		name: 'Example',
		component: Example,
	},
];

const router = createRouter({
	history: createWebHashHistory(),
	routes,
});

export default router;
