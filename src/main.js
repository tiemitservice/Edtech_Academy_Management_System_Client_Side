import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';

import '@/assets/styles.scss';

// Define your custom primary palette (initial palette)
const customPrimaryPalette = {
    50: '#0A008E',
    100: '#47AE6A',
    200: '#0071BC',
    300: '#8660e6', // Purple shade available for light mode
    400: '#0071BC',
    500: '#0A008E', // Deep blue as initial default
    600: '#0A008E',
    700: '#0071BC',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519'
};

// Extend the Aura preset with your custom primary palette
const customPreset = {
    ...Aura,
    semantic: {
        ...Aura.semantic,
        primary: customPrimaryPalette // Initial palette (will be overridden dynamically)
    }
};

const app = createApp(App);

app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: customPreset,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);

app.mount('#app');