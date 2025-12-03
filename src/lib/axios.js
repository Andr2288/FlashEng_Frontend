// src/lib/axios.js - Updated for FlashEng API

import axios from "axios";

// FlashEng API Configuration
const FLASHENG_API_BASE = 'http://localhost:5058/api';

export const axiosInstance = axios.create({
    baseURL: FLASHENG_API_BASE,
    withCredentials: true,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        // Add any FlashEng specific headers if needed
        // For example, API version or client identifier
        config.headers['X-Client'] = 'FlashEng-Web';
        config.headers['X-API-Version'] = 'v1';

        return config;
    },
    (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor with FlashEng specific error handling
axiosInstance.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // FlashEng specific error handling
        if (error.response) {
            const { status, data } = error.response;

            switch (status) {
                case 401:
                    console.log('Unauthorized access - redirecting to login');
                    // Handle logout or redirect to login
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    console.log('Forbidden access');
                    break;

                case 404:
                    console.log('FlashEng resource not found');
                    break;

                case 422:
                    // Validation errors from FlashEng API
                    console.log('Validation error:', data.message || data.errors);
                    break;

                case 500:
                    console.log('FlashEng server error');
                    break;

                default:
                    console.log('FlashEng API error:', error.response);
            }
        } else if (error.request) {
            console.log('Network error - FlashEng API unreachable');
        } else {
            console.log('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;