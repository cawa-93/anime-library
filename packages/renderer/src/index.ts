import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';
import {trackPageView} from '/@/utils/telemetry';

trackPageView();

createApp(App)
  .use(router)
  .mount('#app-root');


