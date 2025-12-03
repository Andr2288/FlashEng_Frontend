import {create} from "zustand";
import {axiosInstance} from "../lib/axios.js";
import toast from "react-hot-toast";

export const usePracticeQueueStore = create((set, get) => ({
    // Renamed from cart terminology to practice queue
    queueItems: [],
    totalPrice: 0, // Keep for compatibility, could represent "practice points" 
    totalItems: 0,
    currency: "PTS", // Practice Points instead of USD
    isLoading: false,
    isAddingToQueue: false,
    isUpdatingQueue: false,

    // Fetch practice queue
    fetchQueue: async () => {
        set({isLoading: true});
        try {
            // Try FlashEng API first, fallback to legacy cart API
            const res = await axiosInstance.get("/practice-queue").catch(async () => {
                // Fallback to legacy cart API
                return await axiosInstance.get("/cart");
            });
            
            set({
                queueItems: res.data.items || res.data || [],
                totalPrice: res.data.totalPrice || res.data.totalPoints || 0,
                totalItems: res.data.totalItems || (res.data.items?.length) || 0,
                currency: res.data.currency || "PTS",
                isLoading: false
            });
        } catch (error) {
            console.log("Error fetching practice queue", error);
            set({
                queueItems: [],
                totalPrice: 0,
                totalItems: 0,
                isLoading: false
            });
            toast.error("Failed to load practice queue");
        }
    },

    // Add flashcard to practice queue
    addToPractice: async (flashcardId, practiceCount = 1) => {
        set({isAddingToQueue: true});
        try {
            // Try FlashEng API first
            try {
                await axiosInstance.post("/practice-queue", {
                    flashcardId: flashcardId,
                    practiceCount: practiceCount
                });
            } catch (error) {
                // Fallback to legacy cart API with different payload
                await axiosInstance.post("/cart", {
                    articleId: flashcardId,
                    quantity: practiceCount
                });
            }

            // Refresh queue after adding
            await get().fetchQueue();

            toast.success(`Added to practice queue (${practiceCount}x)`);
        } catch (error) {
            console.log("Error adding to practice queue", error);
            const errorMessage = error.response?.data?.message || "Failed to add to practice queue";
            toast.error(errorMessage);
        } finally {
            set({isAddingToQueue: false});
        }
    },

    // Update practice count for flashcard
    updateQueueItem: async (queueItemId, practiceCount) => {
        set({isUpdatingQueue: true});
        try {
            try {
                await axiosInstance.put(`/practice-queue/${queueItemId}`, {
                    practiceCount: practiceCount
                });
            } catch (error) {
                // Fallback to legacy cart API
                await axiosInstance.put(`/cart/${queueItemId}`, {
                    quantity: practiceCount
                });
            }

            // Refresh queue after update
            await get().fetchQueue();

            toast.success("Practice queue updated");
        } catch (error) {
            console.log("Error updating queue item", error);
            const errorMessage = error.response?.data?.message || "Failed to update practice queue";
            toast.error(errorMessage);
        } finally {
            set({isUpdatingQueue: false});
        }
    },

    // Remove flashcard from practice queue
    removeFromQueue: async (queueItemId) => {
        try {
            try {
                await axiosInstance.delete(`/practice-queue/${queueItemId}`);
            } catch (error) {
                // Fallback to legacy cart API
                await axiosInstance.delete(`/cart/${queueItemId}`);
            }

            // Refresh queue after removal
            await get().fetchQueue();

            toast.success("Removed from practice queue");
        } catch (error) {
            console.log("Error removing from queue", error);
            const errorMessage = error.response?.data?.message || "Failed to remove from queue";
            toast.error(errorMessage);
        }
    },

    // Clear entire practice queue
    clearQueue: async () => {
        try {
            try {
                await axiosInstance.delete("/practice-queue/clear");
            } catch (error) {
                // Fallback to legacy cart API
                await axiosInstance.delete("/cart/clear");
            }

            set({
                queueItems: [],
                totalPrice: 0,
                totalItems: 0
            });

            toast.success("Practice queue cleared");
        } catch (error) {
            console.log("Error clearing queue", error);
            const errorMessage = error.response?.data?.message || "Failed to clear queue";
            toast.error(errorMessage);
        }
    },

    // Start practice session
    startPracticeSession: async (sessionConfig = {}) => {
        const { queueItems } = get();
        
        if (queueItems.length === 0) {
            toast.error("No flashcards in practice queue");
            return null;
        }

        try {
            const sessionData = {
                flashcardIds: queueItems.map(item => item.flashcardId || item.articleId),
                practiceConfig: {
                    mode: sessionConfig.mode || 'mixed', // 'mixed', 'definition', 'translation'
                    shuffleCards: sessionConfig.shuffle !== false,
                    repeatIncorrect: sessionConfig.repeatIncorrect !== false,
                    ...sessionConfig
                }
            };

            const response = await axiosInstance.post("/practice-sessions", sessionData);
            
            // Clear queue after starting session
            await get().clearQueue();
            
            toast.success("Practice session started!");
            return response.data;
            
        } catch (error) {
            console.log("Error starting practice session", error);
            toast.error("Failed to start practice session");
            return null;
        }
    },

    // Reset queue state (for logout)
    resetQueue: () => {
        set({
            queueItems: [],
            totalPrice: 0,
            totalItems: 0,
            currency: "PTS",
            isLoading: false,
            isAddingToQueue: false,
            isUpdatingQueue: false
        });
    },

    // Legacy compatibility methods
    get cartItems() { return get().queueItems; },
    get isAddingToCart() { return get().isAddingToQueue; },
    get isUpdatingCart() { return get().isUpdatingQueue; },
    
    fetchCart: () => get().fetchQueue(),
    addToCart: (id, quantity) => get().addToPractice(id, quantity),
    updateCartItem: (id, quantity) => get().updateQueueItem(id, quantity),
    removeFromCart: (id) => get().removeFromQueue(id),
    clearCart: () => get().clearQueue(),
    resetCart: () => get().resetQueue(),
}));

// Export both names for compatibility
export const useCartStore = usePracticeQueueStore;
export default usePracticeQueueStore;
