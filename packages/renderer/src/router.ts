import type {RouteRecordRaw} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';
import {trackPageView} from '/@/utils/telemetry';
import {nextTick} from 'vue';


const routes: RouteRecordRaw[] = [
  {path: '/', name: 'Home', component: () => import('/@/components/Home.vue')},
  {path: '/options/', name: 'Options', component: () => import('/@/pages/Options/Options.vue')},
  {
    path: '/watch/:seriesId(\\d+)/:episodeNum(\\d+)?/:translationId(\\d+)?/',
    name: 'Watch',
    component: () => import('/@/components/WatchPage/WatchPage.vue'),
    props: true,
  },
];


const router = createRouter({
  routes,
  history: createWebHistory('/'),
});

router.afterEach((to, from) => {
  if (from.matched.length === 0 || from.path !== to.path) {
    nextTick(() => trackPageView());
  }
});

export default router;
