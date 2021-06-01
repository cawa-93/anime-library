import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';
import * as Sentry from '@sentry/browser';
import { Vue as VueIntegration } from '@sentry/integrations';



const app = createApp(App)
  .use(router);


if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    // @ts-expect-error Sentry ожидает Vue 2 но я передаю Vue 3. Это каким-то образом работает
    integrations: [new VueIntegration({Vue: app, logErrors: true})],
    release: 'v' + import.meta.env.VITE_APP_VERSION,
  });
}

app.mount('#app-root');
