import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    cartItems: [],
    totalPrice: 0,
    totalItems: 0,
    currency: "USD",
    isLoading: false,
    isAddingToCart: false,
    isUpdatingCart: false,

    fetchCart: async () => {
        set({isLoading: true});
        try {
            const res = await axiosInstance.get("/cart");
            set({
                cartItems: res.data.items || [],
                totalPrice: res.data.totalPrice || 0,
                totalItems: res.data.totalItems || 0,
                currency: res.data.currency || "USD",
                isLoading: false
            });
        } catch (error) {
            console.log("Error fetching cart", error);
            set({
                cartItems: [],
                totalPrice: 0,
                totalItems: 0,
                isLoading: false
            });
            toast.error("Failed to load cart");
        }
    },

    addToCart: async (articleId, quantity = 1) => {
        set({isAddingToCart: true});
        try {
            await axiosInstance.post("/cart", {
                articleId: articleId,
                quantity: quantity
            });

            // Оновлюємо кошик після додавання
            await get().fetchCart();

            toast.success(`Added ${quantity} item(s) to cart`);
        } catch (error) {
            console.log("Error adding to cart", error);
            const errorMessage = error.response?.data?.message || "Failed to add item to cart";
            toast.error(errorMessage);
        } finally {
            set({isAddingToCart: false});
        }
    },

    updateCartItem: async (cartItemId, quantity) => {
        set({isUpdatingCart: true});
        try {
            await axiosInstance.put(`/cart/${cartItemId}`, {
                quantity: quantity
            });

            // Оновлюємо кошик після зміни
            await get().fetchCart();

            toast.success("Cart updated");
        } catch (error) {
            console.log("Error updating cart item", error);
            const errorMessage = error.response?.data?.message || "Failed to update cart";
            toast.error(errorMessage);
        } finally {
            set({isUpdatingCart: false});
        }
    },

    removeFromCart: async (cartItemId) => {
        try {
            await axiosInstance.delete(`/cart/${cartItemId}`);

            // Оновлюємо кошик після видалення
            await get().fetchCart();

            toast.success("Item removed from cart");
        } catch (error) {
            console.log("Error removing from cart", error);
            const errorMessage = error.response?.data?.message || "Failed to remove item";
            toast.error(errorMessage);
        }
    },

    clearCart: async () => {
        try {
            await axiosInstance.delete("/cart/clear");

            set({
                cartItems: [],
                totalPrice: 0,
                totalItems: 0
            });

            toast.success("Cart cleared");
        } catch (error) {
            console.log("Error clearing cart", error);
            const errorMessage = error.response?.data?.message || "Failed to clear cart";
            toast.error(errorMessage);
        }
    },

    // Очистити локальний стан кошика (при логауті)
    resetCart: () => {
        set({
            cartItems: [],
            totalPrice: 0,
            totalItems: 0,
            currency: "USD",
            isLoading: false,
            isAddingToCart: false,
            isUpdatingCart: false
        });
    }
}));