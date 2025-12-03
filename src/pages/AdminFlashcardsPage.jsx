import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import FlashcardForm from "../components/FlashcardForm.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import { 
    Plus, 
    Edit, 
    Trash2, 
    Eye, 
    Loader, 
    Shield,
    BookOpen,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const AdminFlashcardsPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    // Redirect if not admin
    useEffect(() => {
        if (authUser && !authUser.isAdmin) {
            toast.error("Access denied. Admin privileges required.");
            navigate("/home");
        }
    }, [authUser, navigate]);

    // State
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    // Form modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedFlashcard, setSelectedFlashcard] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        category: "",
        difficulty: "",
        sortBy: "englishWord",
        sortDir: "asc"
    });

    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 12
    });

    // Fetch flashcards
    const fetchFlashcards = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError("");

            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.pageSize.toString(),
                ...(search && { search }),
                ...(filters.category && { category: filters.category }),
                ...(filters.difficulty && { difficulty: filters.difficulty }),
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            });

            const response = await axiosInstance.get(`/api/flashcards?${params}`);
            
            setFlashcards(response.data.content || response.data);
            
            if (response.data.content) {
                setPagination({
                    currentPage: response.data.number,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                    pageSize: response.data.size
                });
            }

        } catch (error) {
            console.error("Error fetching flashcards:", error);
            if (error.response?.status === 403) {
                toast.error("Access denied. Admin privileges required.");
                navigate("/home");
            } else {
                setError("Failed to load flashcards. Please try again.");
                toast.error("Failed to load flashcards");
            }
        } finally {
            setLoading(false);
        }
    }, [search, filters, pagination.pageSize, navigate]);

    // Initial load
    useEffect(() => {
        if (authUser?.isAdmin) {
            fetchFlashcards(0);
        }
    }, [search, filters, authUser, fetchFlashcards]);

    // Handle search
    const handleSearch = useCallback((searchValue) => {
        setSearch(searchValue);
    }, []);

    // Handle filters change
    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    // Handle filters clear
    const handleFiltersClear = useCallback(() => {
        setFilters({
            category: "",
            difficulty: "",
            sortBy: "englishWord",
            sortDir: "asc"
        });
        setSearch("");
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        fetchFlashcards(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchFlashcards]);

    // Create flashcard
    const handleCreateFlashcard = async (flashcardData) => {
        try {
            await axiosInstance.post("/api/flashcards", {
                ...flashcardData,
                userId: authUser.id
            });
            toast.success("Flashcard created successfully!");
            setIsCreateModalOpen(false);
            fetchFlashcards(pagination.currentPage);
        } catch (error) {
            console.error("Error creating flashcard:", error);
            const errorMessage = error.response?.data?.message || "Failed to create flashcard";
            toast.error(errorMessage);
        }
    };

    // Update flashcard
    const handleUpdateFlashcard = async (flashcardData) => {
        try {
            await axiosInstance.put(`/api/flashcards/${selectedFlashcard.id}`, flashcardData);
            toast.success("Flashcard updated successfully!");
            setIsEditModalOpen(false);
            setSelectedFlashcard(null);
            fetchFlashcards(pagination.currentPage);
        } catch (error) {
            console.error("Error updating flashcard:", error);
            const errorMessage = error.response?.data?.message || "Failed to update flashcard";
            toast.error(errorMessage);
        }
    };

    // Delete flashcard
    const handleDeleteFlashcard = async (flashcard) => {
        if (!window.confirm(`Are you sure you want to delete "${flashcard.englishWord}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/api/flashcards/${flashcard.id}`);
            toast.success("Flashcard deleted successfully!");
            fetchFlashcards(pagination.currentPage);
        } catch (error) {
            console.error("Error deleting flashcard:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete flashcard";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // Open edit modal
    const openEditModal = (flashcard) => {
        setSelectedFlashcard(flashcard);
        setIsEditModalOpen(true);
    };

    // View flashcard details
    const viewFlashcard = (flashcard) => {
        alert(`Flashcard Details:\n\nEnglish Word: ${flashcard.englishWord}\nTranslation: ${flashcard.translation}\nCategory: ${flashcard.category}\nDefinition: ${flashcard.definition || 'N/A'}\nExample: ${flashcard.example || 'N/A'}\nCreated: ${new Date(flashcard.createdAt).toLocaleDateString()}`);
    };

    if (!authUser?.isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You need admin privileges to access this page.</p>
                    <button
                        onClick={() => navigate("/home")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Error loading flashcards</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            onClick={() => fetchFlashcards(pagination.currentPage)}
                                            className="bg-red-100 text-red-800 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-200 transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Header */}
                    <div className="border-b border-gray-200 pb-5 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-3 rounded-lg">
                                    <BookOpen className="h-8 w-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Admin Flashcards Panel</h1>
                                    <p className="text-gray-600">Manage FlashEng flashcards</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add Flashcard
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        <SearchBar
                            value={search}
                            onChange={handleSearch}
                            placeholder="Search flashcards by word or translation..."
                        />
                        <Filters
                            filters={filters}
                            onChange={handleFiltersChange}
                            onClear={handleFiltersClear}
                            type="flashcards"
                        />
                    </div>

                    {/* Loading */}
                    {loading && flashcards.length === 0 ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="flex items-center space-x-2">
                                <Loader className="h-8 w-8 animate-spin text-blue-600" />
                                <span className="text-lg font-medium text-gray-600">Loading flashcards...</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Results count */}
                            <div className="mb-4">
                                <p className="text-sm text-gray-700">
                                    {pagination.totalElements > 0 && (
                                        <>
                                            Showing {(pagination.currentPage * pagination.pageSize) + 1} to{' '}
                                            {Math.min((pagination.currentPage + 1) * pagination.pageSize, pagination.totalElements)} of{' '}
                                            {pagination.totalElements} flashcards
                                        </>
                                    )}
                                </p>
                            </div>

                            {/* Flashcards Grid */}
                            {flashcards.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">No flashcards found</h3>
                                    <p className="mt-1 text-gray-500">Get started by creating a new flashcard.</p>
                                    <div className="mt-6">
                                        <button
                                            onClick={() => setIsCreateModalOpen(true)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            New Flashcard
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                    {flashcards.map((flashcard) => (
                                        <div key={flashcard.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                                                <BookOpen className="text-blue-500" size={48} />
                                            </div>
                                            
                                            <div className="p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                        {flashcard.category}
                                                    </span>
                                                </div>
                                                
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{flashcard.englishWord}</h3>
                                                <p className="text-green-600 font-medium mb-2">{flashcard.translation}</p>
                                                
                                                {flashcard.definition && (
                                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{flashcard.definition}</p>
                                                )}
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => viewFlashcard(flashcard)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                            title="View details"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => openEditModal(flashcard)}
                                                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                                                            title="Edit flashcard"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteFlashcard(flashcard)}
                                                            disabled={isDeleting}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                            title="Delete flashcard"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(flashcard.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                totalElements={pagination.totalElements}
                                pageSize={pagination.pageSize}
                                onPageChange={handlePageChange}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Create Flashcard Modal */}
            {isCreateModalOpen && (
                <FlashcardForm
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateFlashcard}
                    title="Create New Flashcard"
                    mode="create"
                />
            )}

            {/* Edit Flashcard Modal */}
            {isEditModalOpen && selectedFlashcard && (
                <FlashcardForm
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedFlashcard(null);
                    }}
                    onSubmit={handleUpdateFlashcard}
                    initialData={selectedFlashcard}
                    title="Edit Flashcard"
                    mode="edit"
                />
            )}
        </div>
    );
};

export default AdminFlashcardsPage;
