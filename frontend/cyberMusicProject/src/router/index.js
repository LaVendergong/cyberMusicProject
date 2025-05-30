import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ExploreView from '../views/ExploreView.vue';
import PlaylistsView from '../views/PlaylistsView.vue';
import LabView from '../views/LabView.vue';

const routes = [
    {
        path: '/',
        name: 'home',
        component: HomeView
    },
    {
        path: '/explore',
        name: 'explore',
        component: ExploreView
    },
    {
        path: '/playlists',
        name: 'playlists',
        component: PlaylistsView
    },
    {
        path: '/lab',
        name: 'lab',
        component: LabView
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router; 