import type {RouteLocation} from 'vue-router';
import {createRouter, createWebHashHistory} from 'vue-router';
import Home from '/@/components/Home.vue';

const routes = [
  {path: '/', name: 'Home', component: Home},
  {
    path: '/watch/:seriesId(\\d+)/:episodeNum(\\d+)?/:translationId(\\d+)?',
    name: 'Watch',
    component: () => import('/@/components/Watch.vue'),
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
  }, // Lazy load route component
];

export default createRouter({
  routes,
  history: createWebHashHistory(),
});
