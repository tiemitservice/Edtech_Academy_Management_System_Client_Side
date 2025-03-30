/** @type {import('tailwindcss').Config} */
import PrimeUI from 'tailwindcss-primeui';

export default {
    darkMode: ['selector', '[class*="app-dark"]'],
    content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
    plugins: [PrimeUI],
    theme: {
        screens: {
            sm: '576px',
            md: '768px',
            lg: '992px',
            xl: '1200px',
            '2xl': '1920px'
        },
        extend: {
            colors: {
                primary: {
                    50: '#0A008E',
                    100: '#47AE6A',
                    200: '#0071BC',
                    300: '#8660e6',
                    400: '#0A008E',
                    500: '#0A008E',
                    600: '#0A008E',
                    700: '#be123c',
                    800: '#9f1239',
                    900: '#881337',
                    950: '#4c0519',
                    DEFAULT: '#0A008E',
                }
            }
        }
    }
};