import type {RouteRecordRaw} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';
import {trackPageView} from '/@/utils/telemetry';


const routes: RouteRecordRaw[] = [
  {path: '/', name: 'Home', component: () => import('/@/components/Home.vue')},
  {path: '/options/', name: 'Options', component: () => import('/@/components/OptionsPage.vue')},
  {
    path: '/watch/:seriesId(\\d+)/:episodeNum(\\d+)?/:translationId(\\d+)?/',
    name: 'Watch',
    component: () => import('/@/components/WatchPage/WatchPageWrapper.vue'),
    props: true,
  },
];


const router = createRouter({
  routes,
  history: createWebHistory('/'),
});

router.afterEach((to, from) => {
  if (from.path !== to.path) {
    trackPageView({
      name: typeof to.name === 'string' ? to.name : undefined,
      uri: to.path,
    });
  }
});

export default router;
