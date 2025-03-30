import { ref, computed, watch } from 'vue';
import url from './api'; // Assuming you have a file to manage the base URL
import axios from 'axios';

export default function useAuth() {
    const user = ref(JSON.parse(localStorage.getItem('authUser')) || null); // Retrieve user from localStorage
    const token = ref(localStorage.getItem('authToken') || null); // Retrieve token from localStorage

    const loading = ref(false);
    const error = ref(null);

    const isAuthenticated = computed(() => !!token.value);

    // Watch for changes in token and user to update localStorage
    watch([token, user], () => {
        if (token.value) {
            localStorage.setItem('authToken', token.value);
        } else {
            localStorage.removeItem('authToken');
        }

        if (user.value) {
            localStorage.setItem('authUser', JSON.stringify(user.value));
        } else {
            localStorage.removeItem('authUser');
        }
    }, { immediate: true });

    // Fetch user data
    const fetchUser = async () => {
        if (!isAuthenticated.value) return;

        loading.value = true;
        try {
            const response = await axios.get(`${url}/current-user`, {
                headers: {
                    Authorization: `Bearer ${token.value}`,
                },
            });
            user.value = response.data;
            console.log('User:', user.value);
        } catch (err) {
            error.value = 'Failed to fetch user data';
        } finally {
            loading.value = false;
        }
    };

    // Logout function
    const logout = () => {
        token.value = null;
        user.value = null;
    };

    return {
        user,
        token,
        isAuthenticated,
        loading,
        error,
        logout,
        fetchUser,
    };
}
