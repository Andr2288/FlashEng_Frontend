// FlashEng API Base URL
export const FLASHENG_API_BASE = 'http://localhost:5058/api';

// Update axios baseURL for FlashEng
export const updateAxiosConfig = (axiosInstance) => {
  axiosInstance.defaults.baseURL = FLASHENG_API_BASE;
  
  // Add request interceptor for FlashEng
  axiosInstance.interceptors.request.use(
    (config) => {
      // Add any FlashEng specific headers if needed
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor for FlashEng error handling
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle FlashEng specific errors
      if (error.response?.status === 404) {
        console.log('FlashEng resource not found');
      }
      return Promise.reject(error);
    }
  );
};
