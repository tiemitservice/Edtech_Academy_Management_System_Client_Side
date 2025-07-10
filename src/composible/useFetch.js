// composable/useFetch.js
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import io from 'socket.io-client';
import useAuth from './useAuth';

const { user } = useAuth();
const API_URL = 'http://localhost:5000';
// const API_URL = 'https://edtech-academy-management-system-server.onrender.com';

export function useFetch(collection) {
    const data = ref([]);
    const loading = ref(false);
    const error = ref(null);
    let socket = null;

    const fetchData = async (filters = {}) => {
        loading.value = true;
        error.value = null;
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await axios.get(`${API_URL}/api/${collection}${queryString ? `?${queryString}` : ''}`);
            data.value = response.data.data || response.data;
        } catch (err) {
            error.value = err.message || 'An error occurred while fetching data.';
            console.error('Error fetching data:', err);
        } finally {
            loading.value = false;
        }
    };

    const postData = async (payload) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`${API_URL}/api/${collection}`, payload, {
                headers: {
                    'Content-Type': payload instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        } catch (err) {
            error.value = err.message || 'An error occurred while posting data.';
            console.error('Error posting data:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const updateData = async (payload, id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.patch(`${API_URL}/api/${collection}/${id}`, payload, {
                headers: {
                    'Content-Type': payload instanceof FormData ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        } catch (err) {
            error.value = err.message || 'An error occurred while updating data.';
            console.error('Error updating data:', err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const deleteData = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.delete(`${API_URL}/api/${collection}/${id}`);
            return response.data;
        } catch (err) {
            error.value = err.message || 'Error deleting data';
            console.error(`Error deleting ${collection}:`, err);
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const resetPassword = async (token, payload) => {
        try {
            const response = await axios.patch(`${API_URL}/api/reset-password/${token}`, payload);
            return response.data;
        } catch (err) {
            console.error('ResetPassword Error:', err.response?.data || err.message);
            throw err;
        }
    };

    onMounted(() => {
        socket = io(API_URL);
        socket.on('connect', () => {
            console.log(`Socket.IO connected for ${collection}`);
            socket.emit('join', collection);
        });

        socket.on(`${collection}_created`, (newData) => {
            console.log(`${collection}_created received:`, newData);
            if (Array.isArray(data.value)) {
                data.value.push(newData);
                data.value = [...data.value]; // Ensure reactivity
            }
        });

        socket.on(`${collection}_updated`, (updatedData) => {
            console.log(`${collection}_updated received:`, updatedData);
            if (Array.isArray(data.value)) {
                const index = data.value.findIndex((item) => item._id === updatedData._id);
                if (index !== -1) {
                    data.value[index] = { ...data.value[index], ...updatedData };
                } else {
                    data.value.push(updatedData);
                }
                data.value = [...data.value]; // Ensure reactivity
            }
        });

        socket.on(`${collection}_deleted`, (deletedItem) => {
            console.log(`${collection}_deleted received:`, deletedItem);
            data.value = data.value.filter((item) => item._id !== deletedItem._id);
            data.value = [...data.value]; // Trigger reactivity
        });
    });

    onUnmounted(() => {
        if (socket) {
            socket.emit('leave', collection);
            socket.disconnect();
            console.log(`Socket.IO disconnected for ${collection}`);
        }
    });

    return { data, loading, error, fetchData, postData, updateData, deleteData, resetPassword };
}
