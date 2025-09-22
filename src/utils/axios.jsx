import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://apexai-backend.onrender.com",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosInstance;
