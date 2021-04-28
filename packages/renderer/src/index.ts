import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';

createApp(App)
  .use(router)
  .mount('#app');

if ('serviceWorker' in navigator) {
  // Use the window load event to keep the page load performant
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js');
  });
}
