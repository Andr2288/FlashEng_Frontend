import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import EditProfileForm from "../components/EditProfileForm.jsx";
import ChangePasswordForm from "../components/ChangePasswordForm.jsx";
import { User, Mail, Phone, Edit, Key, Loader, AlertCircle, Calendar, Shield } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { authUser, updateProfile, logout } = useAuthStore();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Fetch profile data з FlashEng Users API
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!authUser?.id) {
                throw new Error("No authenticated user");
            }

            // ВИПРАВЛЕНО: використовуємо Users API замість /profile
            const response = await axiosInstance.get(`/users/${authUser.id}`);
            setProfileData({
                id: response.data.userId,
                name: response.data.fullName,
                email: response.data.email,
                phone: response.data.phone || null,
                role: response.data.role,
                isActive: response.data.isActive,
                createdAt: response.data.createdAt
            });
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            setError("Failed to load profile data");
            if (error.response?.status === 401) {
                toast.error("Session expired. Please login again.");
                logout();
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authUser) {
            fetchProfile();
        }
    }, [authUser]);

    // ВИПРАВЛЕНО: адаптуємо під FlashEng API
    const handleProfileUpdate = async (updateData) => {
        try {
            if (!authUser?.id) {
                throw new Error("No authenticated user");
            }

            // ВИПРАВЛЕНО: UpdateUserDto підтримує тільки FullName, Role, IsActive
            await axiosInstance.put(`/users/${authUser.id}`, {
                fullName: updateData.name,
                role: profileData.role || 'User', // Зберігаємо існуючу роль
                isActive: profileData.isActive !== false // Зберігаємо існуючий статус
            });

            // TODO: Email і Phone потребують окремих endpoints або розширення DTO
            if (updateData.email !== profileData.email) {
                console.log("Email change requested but not supported yet:", updateData.email);
                toast.error("Email change not supported yet");
            }

            if (updateData.phone !== profileData.phone) {
                console.log("Phone change requested but not supported yet:", updateData.phone);
                toast.error("Phone change not supported yet");
            }

            // Оновлюємо локальні дані
            await fetchProfile();

            // Оновлюємо authUser в store
            await updateProfile({ name: updateData.name });

            setIsEditModalOpen(false);
            toast.success("Profile name updated successfully!");
        } catch (error) {
            console.error("Profile update failed:", error);
            const errorMessage = error.response?.data?.message || "Failed to update profile";
            toast.error(errorMessage);
            throw error;
        }
    };

    // TODO: Змінити пароль (поки що заглушка)
    const handlePasswordChange = async (passwordData) => {
        try {
            // TODO: Реалізувати коли буде endpoint для зміни пароля
            console.log("Password change requested:", passwordData);
            toast.success("Password change feature coming soon!");
            setIsPasswordModalOpen(false);
        } catch (error) {
            console.error("Password change failed:", error);
            toast.error("Failed to change password");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex items-center space-x-3">
                    <Loader className="animate-spin h-6 w-6 text-blue-600" />
                    <span className="text-gray-600">Loading profile...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
                    <div className="flex items-center space-x-3 text-red-600 mb-4">
                        <AlertCircle className="h-6 w-6" />
                        <h2 className="text-xl font-semibold">Error</h2>
                    </div>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={fetchProfile}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!profileData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Profile data not available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your FlashEng account settings</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                                        {profileData.name ? profileData.name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                </div>
                                <h2 className="text-xl font-semibold text-gray-900 mt-4 text-center break-words">
                                    {profileData.name}
                                </h2>
                                <p className="text-gray-600 text-center break-all">{profileData.email}</p>
                                {profileData.role === 'Admin' && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                        <Shield className="w-3 h-3 mr-1" />
                                        Administrator
                                    </span>
                                )}
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                                    profileData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                    {profileData.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Edit className="h-4 w-4" />
                                    <span>Edit Profile</span>
                                </button>

                                <button
                                    onClick={() => setIsPasswordModalOpen(true)}
                                    className="w-full flex items-center justify-center space-x-2 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors"
                                >
                                    <Key className="h-4 w-4" />
                                    <span>Change Password</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>

                            <div className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
                                        <User className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-900 break-words">{profileData.name || 'Not provided'}</span>
                                    </div>
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
                                        <Mail className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-900 break-all">{profileData.email}</span>
                                    </div>
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
                                        <Phone className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-900 break-all">{profileData.phone || 'Not provided'}</span>
                                    </div>
                                </div>

                                {/* Role */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Role</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
                                        <Shield className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-900">{profileData.role || 'User'}</span>
                                    </div>
                                </div>

                                {/* Member Since */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
                                        <Calendar className="h-5 w-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-900">
                                            {new Date(profileData.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">FlashEng Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center p-4 bg-blue-50 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">-</div>
                                    <div className="text-sm text-gray-600">Flashcards Created</div>
                                </div>
                                <div className="text-center p-4 bg-green-50 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">-</div>
                                    <div className="text-sm text-gray-600">Cards Studied</div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-4 text-center">
                                Statistics coming soon!
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <EditProfileForm
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSubmit={handleProfileUpdate}
                    initialData={profileData}
                />
            )}

            {/* Change Password Modal */}
            {isPasswordModalOpen && (
                <ChangePasswordForm
                    isOpen={isPasswordModalOpen}
                    onClose={() => setIsPasswordModalOpen(false)}
                    onSubmit={handlePasswordChange}
                />
            )}
        </div>
    );
};

export default ProfilePage;