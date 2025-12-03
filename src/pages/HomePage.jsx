import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import FlashCard from "../components/FlashCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { Loader, BookOpen, AlertCircle, Brain, RotateCcw, Plus, Filter } from "lucide-react";
import toast from "react-hot-toast";

const CATEGORIES = [
    'Animals', 'Food', 'Travel', 'Technology', 'Business', 'Health',
    'Education', 'Sports', 'Nature', 'Science', 'Art', 'Music'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const HomePage = () => {
    const { authUser } = useAuthStore();

    const [allFlashcards, setAllFlashcards] = useState([]); // ВСІ картки з серверу
    const [filteredFlashcards, setFilteredFlashcards] = useState([]); // Відфільтровані картки
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        category: "",
        difficulty: "",
        sortBy: "englishWord",
        sortDir: "asc"
    });

    // ЗАВАНТАЖУЄМО ВСІ КАРТКИ ОДИН РАЗ
    const fetchAllFlashcards = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axiosInstance.get('/flashcards');
            setAllFlashcards(response.data);
            setFilteredFlashcards(response.data);
        } catch (error) {
            console.error("Failed to fetch flashcards:", error);
            setError("Failed to load flashcards. Please try again.");
            toast.error("Failed to load flashcards");
        } finally {
            setLoading(false);
        }
    }, []);

    // Завантажуємо картки один раз
    useEffect(() => {
        fetchAllFlashcards();
    }, [fetchAllFlashcards]);

    // ФІЛЬТРАЦІЯ НА КЛІЄНТІ
    useEffect(() => {
        let filtered = [...allFlashcards];

        // Пошук
        if (search.trim()) {
            const searchLower = search.toLowerCase().trim();
            filtered = filtered.filter(card =>
                card.englishWord.toLowerCase().includes(searchLower) ||
                card.translation.toLowerCase().includes(searchLower) ||
                (card.definition && card.definition.toLowerCase().includes(searchLower)) ||
                (card.exampleSentence && card.exampleSentence.toLowerCase().includes(searchLower)) ||
                card.category.toLowerCase().includes(searchLower)
            );
        }

        // Фільтр по категорії
        if (filters.category) {
            filtered = filtered.filter(card =>
                card.category.toLowerCase() === filters.category.toLowerCase()
            );
        }

        // Фільтр по складності
        if (filters.difficulty) {
            filtered = filtered.filter(card =>
                card.difficulty && card.difficulty.toLowerCase() === filters.difficulty.toLowerCase()
            );
        }

        // Сортування
        filtered.sort((a, b) => {
            let aValue = a[filters.sortBy] || '';
            let bValue = b[filters.sortBy] || '';

            if (typeof aValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }

            if (filters.sortDir === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });

        setFilteredFlashcards(filtered);
    }, [allFlashcards, search, filters]);

    const handleSearch = (searchTerm) => {
        setSearch(searchTerm);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    };

    const resetFilters = () => {
        setSearch("");
        setFilters({
            category: "",
            difficulty: "",
            sortBy: "englishWord",
            sortDir: "asc"
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <Loader className="size-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading flashcards...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 md:mb-0">
                            <div className="bg-blue-100 p-3 rounded-full">
                                <BookOpen className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">FlashEng</h1>
                                <p className="text-gray-600">Master English with interactive flashcards</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <div className="text-sm text-gray-500">
                                {search || filters.category || filters.difficulty ? (
                                    <>
                                        {filteredFlashcards.length} of {allFlashcards.length} cards
                                    </>
                                ) : (
                                    <>{allFlashcards.length} cards available</>
                                )}
                            </div>

                            {authUser && (
                                <a
                                    href='/flashcards'
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="mr-2" size={18} />
                                    Create Card
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="space-y-4">
                        {/* Search */}
                        <div>
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Search flashcards by word, translation, or category..."
                            />
                        </div>

                        {/* Filters Row */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category
                                </label>
                                <select
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange({ category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Categories</option>
                                    {CATEGORIES.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Difficulty Filter */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Difficulty
                                </label>
                                <select
                                    value={filters.difficulty}
                                    onChange={(e) => handleFilterChange({ difficulty: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">All Levels</option>
                                    {DIFFICULTY_LEVELS.map(level => (
                                        <option key={level} value={level}>{level}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Sort By */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sort By
                                </label>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="englishWord">English Word</option>
                                    <option value="translation">Translation</option>
                                    <option value="category">Category</option>
                                    <option value="difficulty">Difficulty</option>
                                    <option value="createdAt">Date Created</option>
                                </select>
                            </div>

                            {/* Sort Direction */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order
                                </label>
                                <select
                                    value={filters.sortDir}
                                    onChange={(e) => handleFilterChange({ sortDir: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="asc">A → Z</option>
                                    <option value="desc">Z → A</option>
                                </select>
                            </div>
                        </div>

                        {/* Active filters display and clear button */}
                        {(search || filters.category || filters.difficulty) && (
                            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Active filters:</span>
                                {search && (
                                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                        Search: "{search}"
                                    </span>
                                )}
                                {filters.category && (
                                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                        Category: {filters.category}
                                    </span>
                                )}
                                {filters.difficulty && (
                                    <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                        Level: {filters.difficulty}
                                    </span>
                                )}
                                <button
                                    onClick={resetFilters}
                                    className="flex items-center px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
                                >
                                    <RotateCcw size={14} className="mr-1" />
                                    Clear all
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                {error ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error Loading Flashcards</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchAllFlashcards}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredFlashcards.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                        <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                            {search || filters.category || filters.difficulty ?
                                "No flashcards found" :
                                "No flashcards available"
                            }
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {search || filters.category || filters.difficulty ?
                                "Try adjusting your search criteria or filters." :
                                "Get started by creating your first flashcard!"
                            }
                        </p>
                        {authUser && (
                            <a
                                href='/flashcards'
                                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Create Your First Card
                            </a>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {filteredFlashcards.map((flashcard) => (
                            <FlashCard
                                key={flashcard.flashcardId}
                                flashcard={flashcard}
                                showActions={false} // На домашній сторінці не показуємо кнопки редагування
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomePage;