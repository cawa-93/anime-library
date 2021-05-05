import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';
// import {getSeries} from '/@/utils/videoProvider';

createApp(App)
  .use(router)
  .mount('#app-root');


// window.getAnimeById = getSeries;
