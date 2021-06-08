import {createApp} from 'vue';
import App from '/@/App.vue';
import router from '/@/router';
import * as Sentry from '@sentry/browser';
import {RewriteFrames as RewriteFramesIntegration, Vue as VueIntegration} from '@sentry/integrations';
import './styles/index.scss';


const app = createApp(App)
  .use(router);


if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    debug: import.meta.env.MODE === 'development',
    dsn: import.meta.env.VITE_SENTRY_DSN,
    release: 'v' + import.meta.env.VITE_APP_VERSION,
    environment: import.meta.env.MODE,
    integrations: [
      new RewriteFramesIntegration({
        iteratee: (frame) => {
          if (frame.filename) {
            frame.filename = frame.filename.replace('anime-lib://.', '/renderer/dist');
          }
          return frame;
        },
      }),


      // @ts-expect-error Sentry ожидает Vue 2 но я передаю Vue 3. Это каким-то образом работает
      new VueIntegration({Vue: app, logErrors: true}),
    ],
  });
}

app.mount('#app-root');
