import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { Eye, EyeOff, Mail, Lock, Loader, Brain, BookOpen } from "lucide-react";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { login, isLoggingIn } = useAuthStore();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email format is invalid";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            await login(formData);
        } catch (error) {
            setErrors({ general: error.message || "Login failed" });
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <div className="bg-blue-600 p-4 rounded-full shadow-lg">
                            <Brain className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">FlashEng</h1>
                    <p className="text-xl text-gray-600 mb-8">Master English with Smart Flashcards</p>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back!</h2>
                    <p className="text-gray-600">Sign in to continue your learning journey</p>
                </div>

                {/* Login Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoggingIn}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isLoggingIn ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Sign In to FlashEng
                                </>
                            )}
                        </button>

                        {/* Demo Accounts */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-blue-900 mb-2">Demo Accounts:</h4>
                            <div className="text-xs text-blue-700 space-y-1">
                                <p><strong>User:</strong> user@flasheng.com / password123</p>
                                <p><strong>Admin:</strong> admin@flasheng.com / admin123</p>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Sign Up Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                            Create your FlashEng account
                        </Link>
                    </p>
                </div>

                {/* Features */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        Why Choose FlashEng?
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-full">
                                <BookOpen className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">Interactive flashcard learning</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-purple-100 p-2 rounded-full">
                                <Brain className="h-4 w-4 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-700">Spaced repetition algorithm</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-700">Progress tracking & statistics</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;