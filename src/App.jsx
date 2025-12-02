import {Routes, Route, Navigate} from "react-router-dom";

import Navbar from "./components/Navbar.jsx";

import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import BasketPage from "./pages/BasketPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersHistoryPage from "./pages/OrdersHistoryPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import AdminArticlesPage from "./pages/AdminArticlesPage.jsx";
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

                {/* Protected routes - redirect to login if not authenticated */}
                <Route
                    path="/home"
                    element={authUser ? <HomePage /> : <Navigate to="/login" />}
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
                    path="/admin/articles"
                    element={
                        authUser
                            ? authUser.isAdmin
                                ? <AdminArticlesPage />
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

                {/* Default redirects */}
                <Route
                    path="/"
                    element={<Navigate to={authUser ? "/home" : "/login"} />}
                />

                {/* Catch all unknown routes */}
                <Route
                    path="*"
                    element={<Navigate to={authUser ? "/home" : "/login"} />}
                />
            </Routes>
        </div>
    )
}

export default App