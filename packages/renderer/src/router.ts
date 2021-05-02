import type {RouteLocation} from 'vue-router';
import {createRouter, createWebHistory} from 'vue-router';

const routes = [
  {path: '/', name: 'Home', component: () => import('/@/components/Home.vue')},
  {
    path: '/watch/:seriesId(\\d+)/:episodeNum(\\d+)?/:translationId(\\d+)?/',
    name: 'Watch',
    component: () => import('/@/components/WatchPage/WatchPage.vue'),
    props: ({params}: RouteLocation) => Object.fromEntries(Object.entries(params).map(([k, v]) => {
      if (typeof v !== 'string' || !v) {
        return [k, 0];
      }

      const numValue = Number.parseInt(v);

      if (Number.isNaN(numValue)) {
        return [k, 0];
      }

      return [k, numValue];
    })),
  },
];

export default createRouter({
  routes,
  history: createWebHistory('/'),
});
