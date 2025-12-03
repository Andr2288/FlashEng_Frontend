import {create} from "zustand"
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
    authUser: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const token = localStorage.getItem("flasheng_token");
            if (!token) {
                console.log("No FlashEng token found, user not authenticated");
                set({authUser: null, isCheckingAuth: false});
                return;
            }

            console.log("Checking FlashEng auth with token:", token?.substring(0, 20) + "...");

            // Set Authorization header
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            const res = await axiosInstance.get("/auth/check");

            console.log("FlashEng auth check response:", res.data);

            set({
                authUser: {
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    isAdmin: Boolean(res.data.isAdmin)
                },
                isCheckingAuth: false
            });

            console.log("FlashEng auth check successful, user:", res.data.name, "isAdmin:", res.data.isAdmin);
        }
        catch (error) {
            console.log("FlashEng auth check failed:", error.response?.status, error.response?.data);
            localStorage.removeItem("flasheng_token");
            delete axiosInstance.defaults.headers.common['Authorization'];
            set({authUser: null, isCheckingAuth: false});
        }
    },

    signup: async (userData) => {
        set({isSigningUp: true});
        try {
            console.log("FlashEng signup for user:", userData.name);

            // Map frontend form data to FlashEng API format
            const signupData = {
                name: userData.name,
                email: userData.email,
                password: userData.password,
                phone: userData.phone
            };

            const res = await axiosInstance.post("/auth/register", signupData);

            console.log("FlashEng signup response:", res.data);

            // Store FlashEng JWT token
            const token = res.data.token;
            localStorage.setItem("flasheng_token", token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Set user data
            set({
                authUser: {
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    isAdmin: Boolean(res.data.isAdmin)
                },
                isSigningUp: false
            });

            console.log("FlashEng signup successful for:", res.data.name, "isAdmin:", res.data.isAdmin);
            toast.success(`Welcome to FlashEng, ${res.data.name}!`);
        } catch (error) {
            console.log("FlashEng signup error:", error.response?.data);
            set({isSigningUp: false});
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    login: async (credentials) => {
        set({isLoggingIn: true});
        try {
            console.log("FlashEng login for user:", credentials.email);

            const res = await axiosInstance.post("/auth/login", credentials);

            console.log("FlashEng login response:", res.data);

            // Store FlashEng JWT token
            const token = res.data.token;
            localStorage.setItem("flasheng_token", token);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Set user data
            set({
                authUser: {
                    id: res.data.id,
                    name: res.data.name,
                    email: res.data.email,
                    isAdmin: Boolean(res.data.isAdmin)
                },
                isLoggingIn: false
            });

            console.log("FlashEng login successful for:", res.data.name, "isAdmin:", res.data.isAdmin);
            toast.success(`Welcome back to FlashEng, ${res.data.name}!`);
        } catch (error) {
            console.log("FlashEng login error:", error.response?.data);
            set({isLoggingIn: false});
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    logout: async () => {
        try {
            // Try to call logout endpoint
            await axiosInstance.post("/auth/logout");
        } catch (error) {
            console.log("Logout endpoint call failed:", error);
            // Continue with local logout even if API call fails
        }

        // Clear local storage and auth state
        localStorage.removeItem("flasheng_token");
        delete axiosInstance.defaults.headers.common['Authorization'];
        set({authUser: null});
        toast.success("Logged out from FlashEng successfully");
    },

    updateProfile: async (userData) => {
        set({isUpdatingProfile: true});
        try {
            const currentUser = get().authUser;
            if (!currentUser) {
                throw new Error("No authenticated user");
            }

            // Use Users API to update profile
            const res = await axiosInstance.put(`/users/${currentUser.id}`, {
                fullName: userData.name || userData.fullName,
                email: userData.email
            });

            // Refresh user data
            await get().checkAuth();

            set({isUpdatingProfile: false});
            toast.success("FlashEng profile updated successfully!");
        } catch (error) {
            set({isUpdatingProfile: false});
            const errorMessage = error.response?.data?.message || "Profile update failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    // Helper method to get current user ID
    getCurrentUserId: () => {
        const authUser = get().authUser;
        return authUser?.id || null;
    },

    // Helper method to check if user is admin
    isUserAdmin: () => {
        const authUser = get().authUser;
        return authUser?.isAdmin || false;
    }
}));

// Set up axios interceptor to automatically include auth token
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("flasheng_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Set up response interceptor for auth errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem("flasheng_token");
            delete axiosInstance.defaults.headers.common['Authorization'];
            useAuthStore.getState().set({ authUser: null });

            // Redirect to login if not already there
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);