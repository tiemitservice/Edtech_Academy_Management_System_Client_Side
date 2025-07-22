import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import '@/assets/styles.scss';
import { createPinia } from 'pinia';
import Tooltip from 'primevue/tooltip';
import i18n from './i18n';
const app = createApp(App);
const pinia = createPinia();
app.use(pinia); // ✅ Install Pinia first

// ✅ Now it's safe to use the store
import { useUserStore } from './store/useUserStore';
app.directive('tooltip', Tooltip); // <-- Register the directive
const userStore = useUserStore();
const savedUser = localStorage.getItem('authUser');
if (savedUser) {
    userStore.setUser(JSON.parse(savedUser));
}

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: {
            ...Aura,
            semantic: {
                ...Aura.semantic,
                primary: {
                    // 50: '#0A008E',
                    100: '#47AE6A',
                    200: '#0A008E',
                    300: '#8660e6',
                    400: '#0071BC',
                    500: '#0A008E',
                    600: '#0A008E',
                    700: '#0071BC',
                    800: '#9f1239',
                    900: '#881337',
                    950: '#4c0519'
                }
            }
        },
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(i18n);
app.use(ToastService);
app.use(ConfirmationService);
app.mount('#app');
