import { ref } from "vue";
import axios from "./apiUrl"; // Assuming the Axios instance is configured in this file
import url from "./api";

export function useFetch(collection) {
    const data = ref([]);
    const loading = ref(false); // Set to false initially for better UX
    const error = ref(null);
    const fetchData = async (filters = {}) => {
        loading.value = true;
        error.value = null;

        try {
            console.log(`Fetching data for collection: ${collection}`);

            const queryString = new URLSearchParams(filters).toString();
            const url = `/api/${collection}${queryString ? `?${queryString}` : ""}`;

            const response = await axios.get(url);
            console.log("Response data:", response.data);
            data.value = response.data;
        } catch (err) {
            error.value = err.message || "An error occurred while fetching data.";
            console.error("Error fetching data:", err);
        } finally {
            loading.value = false;
        }
    };


    // Post data to the server
    const postData = async (payload) => {
        loading.value = true;
        error.value = null;
        try {
            const response = await axios.post(`${url}/api/${collection}`, payload);
            console.log("Response data:", response.data);
            data.value.push(response.data);
        } catch (err) {
            error.value = err.message || "An error occurred while posting data.";
            console.error("Error posting data:", err);
        } finally {
            loading.value = false;
        }
    };
    // update data to the server
    const updateData = async (payload, id) => {
        loading.value = true;
        error.value = null;
        try {
            console.log(`Updating data for collection: ${collection}`, payload);

            const response = await axios.patch(`/api/${collection}/${id}`, payload, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Ensure the request is treated as FormData
                },
            });

            console.log("Response data:", response.data);
        } catch (err) {
            error.value = err.message || "An error occurred while updating data.";
            console.error("Error updating data:", err);
        } finally {
            loading.value = false;
        }
    };


    // use delete data
    const deleteData = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            console.log(`Deleting data for collection: ${collection}`, id);
            const response = await axios.delete(`/api/${collection}/${id}`);
            console.log("Response data:", response.data);
            data.value = data.value.filter(item => item._id !== id);
        } catch (err) {
            error.value = err.message || "An error occurred while deleting data.";
            console.error("Error deleting data:", err);
        } finally {
            loading.value = false;
        }
    }

    // user delete
    const deleteUser = async (id) => {
        loading.value = true;
        error.value = null;
        try {
            console.log(`Deleting data for collection: ${collection}`, id);
            const response = await axios.delete(`/api/${collection}/${id}`);
            console.log("Response data:", response.data);
            data.value = data.value.filter(item => item._id !== id);
        } catch (err) {
            error.value = err.message || "An error occurred while deleting data.";
            console.error("Error deleting data:", err);
        } finally {
            loading.value = false;
        }
    };

    // use create user

    const getToken = () => localStorage.getItem("token");
    const createUser = async (payload) => {

        loading.value = true;
        error.value = null;
        try {
            const token = getToken();
            const response = await axios.post(`/api/${collection}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });
            data.value.push(response.data);
            console.log('response', response.data);
        } catch (err) {
            error.value = err.message || "An error occurred while posting data.";
            console.error("Error posting data:", err);
        } finally {
            loading.value = false;
        }
    }

    const updateUser = async (payload, id) => {
        loading.value = true;
        error.value = null;
        try {
            const token = getToken();
            const response = await axios.patch(`/api/${collection}/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // Check if data.value is an array before calling findIndex
            if (Array.isArray(data.value)) {
                const index = data.value.findIndex((item) => item._id === id);
                if (index !== -1) {
                    data.value[index] = response.data;
                }
            } else {
                // If data.value is not an array, just update it directly
                data.value = response.data;
            }

            console.log('response', response.data);

        } catch (err) {
            error.value = err.message || "An error occurred while updating data.";
            console.error("Error updating data:", err);
        } finally {
            loading.value = false;
        }
    };


    return { data, loading, error, fetchData, postData, updateData, createUser, updateUser, deleteUser, deleteData };
}
