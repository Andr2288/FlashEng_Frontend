import axios from "axios";
import toast from "react-hot-toast";

export const axiosInstance = axios.create({
    baseURL: "http://localhost:8080/api",
    withCredentials: true
});

// Request interceptor - автоматично додає JWT токен в headers
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - обробляє помилки авторизації
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Токен недійсний або закінчився
            localStorage.removeItem("token");

            // Якщо не на сторінці логіну/реєстрації, показати помилку та перенаправити
            if (!window.location.pathname.includes("/login") &&
                !window.location.pathname.includes("/register")) {
                toast.error("Session expired. Please login again.");
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);