import {Routes, Route, Navigate} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import BasketPage from "./pages/BasketPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersHistoryPage from "./pages/OrdersHistoryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import FlashCardsPage from "./pages/FlashCardsPage.jsx";
import AdminFlashcardsPage from "./pages/AdminFlashcardsPage.jsx";
import AdminOrdersPage from "./pages/AdminOrdersPage.jsx";

import {useAuthStore} from "./store/useAuthStore.js";
import {useEffect} from "react";

import {Loader} from "lucide-react";

const App = () => {

    const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    console.log({authUser});

    if (isCheckingAuth && !authUser) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-10 animate-spin" />
            </div>
        )
    }

    return (
        <div>
            <Navbar />

            <Routes>
                {/* Public routes - redirect to home if already authenticated */}
                <Route
                    path="/login"
                    element={!authUser ? <LoginPage /> : <Navigate to="/home" />}
                />
                <Route
                    path="/register"
                    element={!authUser ? <SignUpPage /> : <Navigate to="/home" />}
                />

                {/* Root redirect */}
                <Route
                    path="/"
                    element={authUser ? <Navigate to="/home" /> : <Navigate to="/login" />}
                />

                {/* Protected routes - redirect to login if not authenticated */}
                <Route
                    path="/home"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/flashcards"
                    element={authUser ? <FlashCardsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/cards"
                    element={authUser ? <FlashCardsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/cart"
                    element={authUser ? <BasketPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/checkout"
                    element={authUser ? <CheckoutPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/orders"
                    element={authUser ? <OrdersHistoryPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/profile"
                    element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
                />

                {/* Admin routes - redirect to login if not authenticated, to home if not admin */}
                <Route
                    path="/admin/flashcards"
                    element={
                        authUser
                            ? authUser.isAdmin
                                ? <AdminFlashcardsPage />
                                : <Navigate to="/home" />
                            : <Navigate to="/login" />
                    }
                />
                <Route
                    path="/admin/orders"
                    element={
                        authUser
                            ? authUser.isAdmin
                                ? <AdminOrdersPage />
                                : <Navigate to="/home" />
                            : <Navigate to="/login" />
                    }
                />

                {/* Legacy routes - redirect for compatibility */}
                <Route
                    path="/admin/articles"
                    element={<Navigate to="/admin/flashcards" replace />}
                />
                <Route
                    path="/articles"
                    element={<Navigate to="/flashcards" replace />}
                />

                {/* Catch-all route - redirect to home or login */}
                <Route
                    path="*"
                    element={authUser ? <Navigate to="/home" /> : <Navigate to="/login" />}
                />
            </Routes>
        </div>
    )
}

export default App;