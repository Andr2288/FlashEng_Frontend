import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader, Brain, BookOpen, Check } from "lucide-react";

const SignUpPage = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});

    const { signup, isSigningUp } = useAuthStore();

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
            newErrors.name = "Name must be at least 2 characters";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email format is invalid";
        }

        if (formData.phone && !/^\+?[1-9]\d{8,14}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = "Phone format is invalid (e.g., +380501234567)";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = "Please confirm your password";
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            const signupData = {
                name: formData.name.trim(),
                email: formData.email,
                phone: formData.phone || null,
                password: formData.password
            };
            await signup(signupData);
        } catch (error) {
            setErrors({ general: error.message || "Registration failed" });
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

    const getPasswordStrength = () => {
        const password = formData.password;
        if (password.length === 0) return { strength: 0, label: "" };
        if (password.length < 6) return { strength: 25, label: "Weak" };
        if (password.length < 8) return { strength: 50, label: "Fair" };
        if (password.length < 12 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return { strength: 75, label: "Good" };
        }
        if (password.length >= 12 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
            return { strength: 100, label: "Strong" };
        }
        return { strength: 60, label: "Fair" };
    };

    const passwordStrength = getPasswordStrength();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center px-4 py-8">
            <div className="max-w-md w-full space-y-8">
                {/* Logo and Header */}
                <div className="text-center">
                    <div className="flex justify-center items-center mb-6">
                        <div className="bg-purple-600 p-4 rounded-full shadow-lg">
                            <Brain className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Join FlashEng</h1>
                    <p className="text-xl text-gray-600 mb-8">Start mastering English today</p>
                    <h2 className="text-2xl font-bold text-gray-900">Create Your Account</h2>
                    <p className="text-gray-600">Begin your English learning adventure</p>
                </div>

                {/* Registration Form */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* General Error */}
                        {errors.general && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Name Field */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your full name"
                                />
                            </div>
                            {errors.name && (
                                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                            )}
                        </div>

                        {/* Email Field */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address *
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
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter your email"
                                />
                            </div>
                            {errors.email && (
                                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                            )}
                        </div>

                        {/* Phone Field */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                Phone Number <span className="text-gray-500">(optional)</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="+380501234567"
                                />
                            </div>
                            {errors.phone && (
                                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                            )}
                        </div>

                        {/* Password Field */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
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
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.password ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Create a strong password"
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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center space-x-2">
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-300 ${
                                                    passwordStrength.strength <= 25 ? 'bg-red-500' :
                                                        passwordStrength.strength <= 50 ? 'bg-orange-500' :
                                                            passwordStrength.strength <= 75 ? 'bg-yellow-500' : 'bg-green-500'
                                                }`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 min-w-0 flex-shrink-0">
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {errors.password && (
                                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password *
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors ${
                                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                    placeholder="Confirm your password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                    )}
                                </button>

                                {/* Password Match Indicator */}
                                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <div className="absolute inset-y-0 right-12 flex items-center pr-3">
                                        <Check className="h-5 w-5 text-green-500" />
                                    </div>
                                )}
                            </div>
                            {errors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSigningUp}
                            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSigningUp ? (
                                <>
                                    <Loader className="animate-spin h-5 w-5 mr-2" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <BookOpen className="h-5 w-5 mr-2" />
                                    Create FlashEng Account
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign In Link */}
                <div className="text-center">
                    <p className="text-gray-600">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-medium text-purple-600 hover:text-purple-500 transition-colors"
                        >
                            Sign in to FlashEng
                        </Link>
                    </p>
                </div>

                {/* Benefits */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                        What You'll Get
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">Personalized learning experience</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">Create unlimited custom flashcards</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">Track your learning progress</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-1.5 rounded-full">
                                <Check className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">Access to premium content</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;