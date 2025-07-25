import axios from "axios";

const instance = axios.create({
    // baseURL: "https://edtech-academy-management-system-server.onrender.com/",
    baseURL: "http://localhost:5000",

});
instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
export default instance;
