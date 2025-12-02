import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import EditProfileForm from "../components/EditProfileForm.jsx";
import ChangePasswordForm from "../components/ChangePasswordForm.jsx";
import { User, Mail, Phone, Camera, Edit, Key, Loader, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
    const { authUser, updateProfile, logout } = useAuthStore();

    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    // Fetch profile data
    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get("/profile");
            setProfileData(response.data);
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
        fetchProfile();
    }, []);

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please select a valid image file");
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        try {
            setIsUploadingAvatar(true);
            const formData = new FormData();
            formData.append('file', file);

            const response = await axiosInstance.post("/profile/image", formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Update profile data with new image URL
            setProfileData(prev => ({
                ...prev,
                imageUrl: response.data.imageUrl
            }));

            toast.success("Avatar updated successfully!");
        } catch (error) {
            console.error("Failed to upload avatar:", error);
            const errorMessage = error.response?.data?.error || "Failed to upload avatar";
            toast.error(errorMessage);
        } finally {
            setIsUploadingAvatar(false);
            // Clear the input
            e.target.value = '';
        }
    };

    const handleProfileUpdate = async (updateData) => {
        try {
            await updateProfile(updateData);
            await fetchProfile(); // Refresh profile data
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Profile update failed:", error);
        }
    };

    const handlePasswordChange = async () => {
        await fetchProfile(); // Refresh if needed
        setIsPasswordModalOpen(false);
        toast.success("Password changed successfully!");
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

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            {/* Avatar Section */}
                            <div className="flex flex-col items-center mb-6">
                                <div className="relative">
                                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                        {profileData.imageUrl ? (
                                            <img
                                                src={`http://localhost:8080${profileData.imageUrl}`}
                                                alt="Profile avatar"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="h-12 w-12 text-gray-400" />
                                        )}
                                    </div>

                                    {/* Upload button */}
                                    <label className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                                        <Camera className="h-4 w-4 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarUpload}
                                            className="hidden"
                                            disabled={isUploadingAvatar}
                                        />
                                    </label>

                                    {/* Loading overlay */}
                                    {isUploadingAvatar && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                            <Loader className="animate-spin h-6 w-6 text-white" />
                                        </div>
                                    )}
                                </div>

                                <h2 className="text-xl font-semibold text-gray-900 mt-4">{profileData.name}</h2>
                                <p className="text-gray-600 text-center break-all">{profileData.email}</p>
                                {authUser?.isAdmin && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                        Administrator
                                    </span>
                                )}
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
                                        <span className="text-gray-900 break-all">{profileData.name}</span>
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

                                {/* Member Since */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                                    <div className="flex items-center space-x-3 p-3 border border-gray-300 rounded-md bg-gray-50 w-full">
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