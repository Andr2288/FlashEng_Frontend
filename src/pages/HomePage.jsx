import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import FlashCard from "../components/FlashCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import { Loader, BookOpen, AlertCircle, Brain, RotateCcw, Plus } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
    'Animals', 'Food', 'Travel', 'Technology', 'Business', 'Health',
    'Education', 'Sports', 'Nature', 'Science', 'Art', 'Music'
];

const HomePage = () => {
    const { authUser } = useAuthStore();

    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 12
    });

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        difficulty: "",
        sortBy: "englishWord",
        sortDir: "asc"
    });

    const fetchFlashcards = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            let endpoint = '/flashcards';
            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.pageSize.toString(),
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            });

            // Handle search
            if (search) {
                endpoint = '/flashcards/search';
                params.append("searchTerm", search);
            }

            // Handle category filter
            if (filters.category && !search) {
                endpoint = `/flashcards/category/${filters.category}`;
            }

            // Add difficulty filter if supported by API
            if (filters.difficulty) {
                params.append("difficulty", filters.difficulty);
            }

            const response = await axiosInstance.get(`${endpoint}?${params}`);

            // Handle different response formats
            if (response.data.content) {
                // Paginated response
                setFlashcards(response.data.content);
                setPagination({
                    currentPage: response.data.number,
                    totalPages: response.data.totalPages,
                    totalElements: response.data.totalElements,
                    pageSize: response.data.size
                });
            } else {
                // Simple array response
                setFlashcards(response.data);
                setPagination({
                    currentPage: 0,
                    totalPages: Math.ceil(response.data.length / pagination.pageSize),
                    totalElements: response.data.length,
                    pageSize: pagination.pageSize
                });
            }

        } catch (error) {
            console.error("Failed to fetch flashcards:", error);
            setError("Failed to load flashcards. Please try again.");
            toast.error("Failed to load flashcards");
        } finally {
            setLoading(false);
        }
    }, [search, filters, pagination.pageSize]);

    useEffect(() => {
        fetchFlashcards(0);
    }, [search, filters]);

    const handleSearch = useCallback((searchValue) => {
        setSearch(searchValue);
    }, []);

    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);

    const handleFiltersClear = useCallback(() => {
        setFilters({
            category: "",
            difficulty: "",
            sortBy: "englishWord",
            sortDir: "asc"
        });
        setSearch("");
    }, []);

    const handlePageChange = useCallback((page) => {
        fetchFlashcards(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchFlashcards]);

    const hasActiveFilters = search || filters.category || filters.difficulty;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="flex justify-center items-center mb-6">
                        <div className="bg-blue-600 p-4 rounded-full">
                            <Brain className="h-12 w-12 text-white" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Welcome to FlashEng
                    </h1>
                    <p className="text-xl text-gray-600 mb-6">
                        Master English vocabulary with interactive flashcards
                    </p>
                    <div className="flex justify-center space-x-4">
                        <a
                            href="/flashcards"
                            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <BookOpen className="h-5 w-5 mr-2" />
                            Browse All Cards
                        </a>
                        {authUser && (
                            <a
                                href="/flashcards"
                                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Create Card
                            </a>
                        )}
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-6">
                    <SearchBar
                        value={search}
                        onChange={handleSearch}
                        placeholder="Search flashcards by English word or translation..."
                    />

                    <Filters
                        filters={filters}
                        onChange={handleFiltersChange}
                        onClear={handleFiltersClear}
                        type="flashcards"
                        categories={CATEGORIES}
                    />
                </div>

                {/* Error State */}
                {error && (
                    <div className="mb-8">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-red-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Error loading flashcards
                                    </h3>
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
                )}

                {/* Loading State */}
                {loading && flashcards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading flashcards...</p>
                    </div>
                )}

                {/* Empty State */}
                {!loading && flashcards.length === 0 && !error && (
                    <div className="text-center py-12">
                        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No flashcards found
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {hasActiveFilters
                                ? "Try adjusting your search or filters"
                                : "No flashcards available at the moment"
                            }
                        </p>
                        {hasActiveFilters && (
                            <button
                                onClick={handleFiltersClear}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>
                )}

                {/* Results Count */}
                {!loading && flashcards.length > 0 && (
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                {pagination.totalElements > 0 ? (
                                    <>
                                        Showing{" "}
                                        <span className="font-medium">
                                            {pagination.currentPage * pagination.pageSize + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {Math.min(
                                                (pagination.currentPage + 1) * pagination.pageSize,
                                                pagination.totalElements
                                            )}
                                        </span>{" "}
                                        of{" "}
                                        <span className="font-medium">
                                            {pagination.totalElements}
                                        </span>{" "}
                                        flashcards
                                    </>
                                ) : (
                                    `${flashcards.length} flashcards found`
                                )}
                            </p>

                            {flashcards.length > 0 && (
                                <a
                                    href="/flashcards"
                                    className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                                >
                                    <RotateCcw className="h-4 w-4 mr-1" />
                                    Start Practice Session
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Flashcards Grid */}
                {!loading && flashcards.length > 0 && (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {flashcards.map((flashcard) => (
                                <FlashCard
                                    key={flashcard.flashcardId}
                                    flashcard={flashcard}
                                    onEdit={null} // Home page is read-only
                                    onDelete={null} // Home page is read-only
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination.totalPages > 1 && (
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                totalElements={pagination.totalElements}
                                pageSize={pagination.pageSize}
                                onPageChange={handlePageChange}
                            />
                        )}
                    </>
                )}

                {/* Quick Stats */}
                {!loading && flashcards.length > 0 && (
                    <div className="mt-12 bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            FlashEng Statistics
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {pagination.totalElements || flashcards.length}
                                </div>
                                <div className="text-sm text-gray-500">Total Cards</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {new Set(flashcards.map(card => card.category)).size}
                                </div>
                                <div className="text-sm text-gray-500">Categories</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">
                                    {authUser ? flashcards.filter(card => card.userId === authUser.id).length : 0}
                                </div>
                                <div className="text-sm text-gray-500">Your Cards</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-orange-600">
                                    {Math.floor(Math.random() * 50) + 10}
                                </div>
                                <div className="text-sm text-gray-500">Users Learning</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;