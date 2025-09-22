import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://apexai-backend.onrender.com",
    headers: {
        "Content-Type": "application/json"
    }
});

export default axiosInstance;
