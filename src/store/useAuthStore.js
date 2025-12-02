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
            const token = localStorage.getItem("token");
            if (!token) {
                console.log("No token found, user not authenticated");
                set({authUser: null, isCheckingAuth: false});
                return;
            }

            console.log("Checking auth with token:", token?.substring(0, 20) + "...");

            const res = await axiosInstance.get("/auth/check");

            console.log("Auth check response RAW:", res);
            console.log("Auth check response DATA:", res.data);
            console.log("Auth check response isAdmin field:", res.data.isAdmin);
            console.log("Type of isAdmin:", typeof res.data.isAdmin);
            console.log("JSON stringify:", JSON.stringify(res.data));

            // ВИПРАВЛЕННЯ: Backend повертає "admin" замість "isAdmin"
            set({
                authUser: {
                    name: res.data.name,
                    email: res.data.email,
                    phone: res.data.phone || null, // phone може не повертатися з /auth/check
                    isAdmin: Boolean(res.data.admin || res.data.isAdmin) // Перевіряємо обидва поля
                },
                isCheckingAuth: false
            });

            console.log("Auth check successful, user authenticated with isAdmin:", Boolean(res.data.admin || res.data.isAdmin));
        }
        catch (error) {
            console.log("Error in checkAuth:", error.response?.status, error.response?.data);
            localStorage.removeItem("token");
            set({authUser: null, isCheckingAuth: false});
        }
    },

    signup: async (userData) => {
        set({isSigningUp: true});
        try {
            console.log("Signing up user:", userData.name);

            const res = await axiosInstance.post("/auth/register", userData);

            console.log("Signup response:", res.data);

            // Store JWT token
            localStorage.setItem("token", res.data.token);

            // Set user data
            set({
                authUser: {
                    name: res.data.name,
                    email: res.data.email,
                    phone: userData.phone, // Беремо з запиту, бо backend не повертає
                    isAdmin: Boolean(res.data.admin || res.data.isAdmin) // Backend повертає "admin"
                },
                isSigningUp: false
            });

            console.log("Signup successful, user:", res.data.name, "isAdmin:", Boolean(res.data.admin || res.data.isAdmin));
            toast.success("Account created successfully!");
        } catch (error) {
            console.log("Signup error:", error.response?.data);
            set({isSigningUp: false});
            const errorMessage = error.response?.data?.message || "Registration failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    login: async (credentials) => {
        set({isLoggingIn: true});
        try {
            console.log("Logging in user:", credentials.email);

            const res = await axiosInstance.post("/auth/login", credentials);

            console.log("Login response RAW:", res);
            console.log("Login response DATA:", res.data);
            console.log("Login response isAdmin field:", res.data.isAdmin);
            console.log("Type of isAdmin:", typeof res.data.isAdmin);
            console.log("JSON stringify:", JSON.stringify(res.data));

            // Store JWT token
            localStorage.setItem("token", res.data.token);

            // Set user data
            set({
                authUser: {
                    name: res.data.name,
                    email: res.data.email,
                    phone: res.data.phone || null, // Login може не повертати phone
                    isAdmin: Boolean(res.data.admin || res.data.isAdmin) // Backend повертає "admin"
                },
                isLoggingIn: false
            });

            console.log("Login successful, user:", res.data.name, "isAdmin:", Boolean(res.data.admin || res.data.isAdmin));
            toast.success(`Welcome back, ${res.data.name}!`);
        } catch (error) {
            console.log("Login error:", error.response?.data);
            set({isLoggingIn: false});
            const errorMessage = error.response?.data?.message || "Login failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    },

    logout: () => {
        localStorage.removeItem("token");
        set({authUser: null});
        toast.success("Logged out successfully");
    },

    updateProfile: async (userData) => {
        set({isUpdatingProfile: true});
        try {
            const res = await axiosInstance.put("/profile", userData);

            set({
                authUser: {
                    ...get().authUser,
                    ...res.data
                },
                isUpdatingProfile: false
            });

            toast.success("Profile updated successfully!");
        } catch (error) {
            set({isUpdatingProfile: false});
            const errorMessage = error.response?.data?.message || "Profile update failed";
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}));