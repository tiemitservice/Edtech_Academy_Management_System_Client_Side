import axios from "axios";

const instance = axios.create({
    // baseURL: "http://139.59.101.247:5000",
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
