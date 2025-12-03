import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { useCartStore } from "../store/useCartStore.js";
import {
    ShoppingCart,
    User,
    Menu,
    X,
    LogOut,
    Home,
    BookOpen,
    Shield,
    RotateCcw,
    Users,
    ChevronDown,
    Settings,
    Brain
} from "lucide-react";

const Navbar = () => {
    const { authUser, logout } = useAuthStore();
    const { totalItems } = useCartStore();
    const location = useLocation();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        setIsMenuOpen(false);
        setIsAdminDropdownOpen(false);
        setIsUserDropdownOpen(false);
    };

    const closeMenus = () => {
        setIsMenuOpen(false);
        setIsAdminDropdownOpen(false);
        setIsUserDropdownOpen(false);
    };

    if (!authUser) return null;

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/home" onClick={closeMenus} className="flex items-center space-x-2">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Brain className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">FlashEng</span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex md:items-center md:space-x-4">
                        {/* Regular Navigation */}
                        <div className="flex items-center space-x-1">
                            <Link
                                to="/home"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === "/home"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <Home className="h-4 w-4 mr-2" />
                                Home
                            </Link>

                            <Link
                                to="/flashcards"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === "/flashcards"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Practice Cards
                            </Link>

                            <Link
                                to="/orders"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    location.pathname === "/orders"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                My Practice
                            </Link>

                            <Link
                                to="/cart"
                                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors relative ${
                                    location.pathname === "/cart"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                }`}
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Practice Queue
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems > 99 ? "99+" : totalItems}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Admin Dropdown */}
                        {authUser.isAdmin && (
                            <div className="relative">
                                <button
                                    onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
                                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        location.pathname.startsWith("/admin")
                                            ? "bg-purple-100 text-purple-700"
                                            : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                    }`}
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    Admin
                                    <ChevronDown className="h-4 w-4 ml-1" />
                                </button>

                                {isAdminDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                        <div className="py-1">
                                            <Link
                                                to="/admin/flashcards"
                                                onClick={closeMenus}
                                                className={`flex items-center px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                                                    location.pathname === "/admin/flashcards"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                <BookOpen className="h-4 w-4 mr-2" />
                                                Manage Flashcards
                                            </Link>
                                            <Link
                                                to="/admin/orders"
                                                onClick={closeMenus}
                                                className={`flex items-center px-4 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 transition-colors ${
                                                    location.pathname === "/admin/orders"
                                                        ? "bg-purple-100 text-purple-700"
                                                        : "text-gray-700"
                                                }`}
                                            >
                                                <Users className="h-4 w-4 mr-2" />
                                                View Practice Sessions
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
                            >
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <User className="h-4 w-4 text-blue-600" />
                                </div>
                                <span className="text-sm font-medium">{authUser.name}</span>
                                <ChevronDown className="h-4 w-4" />
                            </button>

                            {isUserDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                                    <div className="py-1">
                                        <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                                            <div className="font-medium text-gray-900">{authUser.name}</div>
                                            <div className="text-xs">{authUser.email}</div>
                                            {authUser.isAdmin && (
                                                <div className="text-xs text-purple-600 font-medium mt-1">Administrator</div>
                                            )}
                                        </div>
                                        <Link
                                            to="/profile"
                                            onClick={closeMenus}
                                            className={`flex items-center px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                                location.pathname === "/profile"
                                                    ? "bg-blue-100 text-blue-700"
                                                    : "text-gray-700"
                                            }`}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            My Profile
                                        </Link>
                                        <hr className="border-gray-200" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:text-red-700 hover:bg-red-50 transition-colors"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-md"
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
                            <Link
                                to="/home"
                                onClick={closeMenus}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === "/home"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                <Home className="h-5 w-5 mr-3" />
                                Home
                            </Link>

                            <Link
                                to="/flashcards"
                                onClick={closeMenus}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === "/flashcards"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                <BookOpen className="h-5 w-5 mr-3" />
                                Practice Cards
                            </Link>

                            <Link
                                to="/orders"
                                onClick={closeMenus}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === "/orders"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                <RotateCcw className="h-5 w-5 mr-3" />
                                My Practice
                            </Link>

                            <Link
                                to="/cart"
                                onClick={closeMenus}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium relative ${
                                    location.pathname === "/cart"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                <ShoppingCart className="h-5 w-5 mr-3" />
                                Practice Queue
                                {totalItems > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                        {totalItems > 99 ? "99+" : totalItems}
                                    </span>
                                )}
                            </Link>

                            <Link
                                to="/profile"
                                onClick={closeMenus}
                                className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                    location.pathname === "/profile"
                                        ? "bg-blue-100 text-blue-700"
                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                                }`}
                            >
                                <Settings className="h-5 w-5 mr-3" />
                                My Profile
                            </Link>

                            {/* Admin Section - Mobile */}
                            {authUser.isAdmin && (
                                <>
                                    <div className="border-t border-gray-200 pt-3 mt-3">
                                        <div className="px-3 py-2 text-xs font-semibold text-purple-600 uppercase tracking-wider">
                                            Admin Panel
                                        </div>
                                    </div>
                                    <Link
                                        to="/admin/flashcards"
                                        onClick={closeMenus}
                                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                            location.pathname === "/admin/flashcards"
                                                ? "bg-purple-100 text-purple-700"
                                                : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        }`}
                                    >
                                        <BookOpen className="h-5 w-5 mr-3" />
                                        Manage Flashcards
                                    </Link>

                                    <Link
                                        to="/admin/orders"
                                        onClick={closeMenus}
                                        className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                                            location.pathname === "/admin/orders"
                                                ? "bg-purple-100 text-purple-700"
                                                : "text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                        }`}
                                    >
                                        <Users className="h-5 w-5 mr-3" />
                                        Practice Sessions
                                    </Link>
                                </>
                            )}

                            {/* User Info & Logout - Mobile */}
                            <div className="border-t border-gray-200 pt-3 mt-3">
                                <div className="flex items-center px-3 py-2">
                                    <div className="bg-blue-100 p-2 rounded-full mr-3">
                                        <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-base font-medium text-gray-900">
                                            {authUser.name}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {authUser.email}
                                        </div>
                                        {authUser.isAdmin && (
                                            <div className="text-sm text-purple-600 font-medium">
                                                Administrator
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleLogout}
                                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                >
                                    <LogOut className="h-5 w-5 mr-3" />
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Close dropdowns when clicking outside */}
            {(isAdminDropdownOpen || isUserDropdownOpen) && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => {
                        setIsAdminDropdownOpen(false);
                        setIsUserDropdownOpen(false);
                    }}
                ></div>
            )}
        </nav>
    );
};

export default Navbar;