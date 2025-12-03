import { useState } from "react";
import { Filter, X, ChevronDown } from "lucide-react";

const FLASHCARD_CATEGORIES = [
    'Animals', 'Food', 'Travel', 'Technology', 'Business', 'Health',
    'Education', 'Sports', 'Nature', 'Science', 'Art', 'Music',
    'History', 'Geography', 'Literature', 'Movies'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const SORT_OPTIONS = [
    { value: 'englishWord_asc', label: 'English Word (A-Z)', sortBy: 'englishWord', sortDir: 'asc' },
    { value: 'englishWord_desc', label: 'English Word (Z-A)', sortBy: 'englishWord', sortDir: 'desc' },
    { value: 'translation_asc', label: 'Translation (A-Z)', sortBy: 'translation', sortDir: 'asc' },
    { value: 'translation_desc', label: 'Translation (Z-A)', sortBy: 'translation', sortDir: 'desc' },
    { value: 'category_asc', label: 'Category (A-Z)', sortBy: 'category', sortDir: 'asc' },
    { value: 'createdAt_desc', label: 'Newest First', sortBy: 'createdAt', sortDir: 'desc' },
    { value: 'createdAt_asc', label: 'Oldest First', sortBy: 'createdAt', sortDir: 'asc' }
];

// Legacy sort options for articles (fallback)
const ARTICLE_SORT_OPTIONS = [
    { value: 'name_asc', label: 'Name (A-Z)', sortBy: 'name', sortDir: 'asc' },
    { value: 'name_desc', label: 'Name (Z-A)', sortBy: 'name', sortDir: 'desc' },
    { value: 'price_asc', label: 'Price (Low to High)', sortBy: 'price', sortDir: 'asc' },
    { value: 'price_desc', label: 'Price (High to Low)', sortBy: 'price', sortDir: 'desc' },
    { value: 'createdAt_desc', label: 'Newest First', sortBy: 'createdAt', sortDir: 'desc' },
    { value: 'createdAt_asc', label: 'Oldest First', sortBy: 'createdAt', sortDir: 'asc' }
];

const Filters = ({
                     filters,
                     onChange,
                     onClear,
                     type = "flashcards",
                     categories = FLASHCARD_CATEGORIES,
                     className = ""
                 }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const isFlashcards = type === "flashcards";
    const sortOptions = isFlashcards ? SORT_OPTIONS : ARTICLE_SORT_OPTIONS;

    const getCurrentSortValue = () => {
        if (isFlashcards) {
            return `${filters.sortBy}_${filters.sortDir}`;
        } else {
            return `${filters.sortBy}_${filters.sortDir}`;
        }
    };

    const handleSortChange = (value) => {
        const option = sortOptions.find(opt => opt.value === value);
        if (option) {
            onChange({
                ...filters,
                sortBy: option.sortBy,
                sortDir: option.sortDir
            });
        }
    };

    const handleCategoryChange = (category) => {
        onChange({
            ...filters,
            category: category
        });
    };

    const handleDifficultyChange = (difficulty) => {
        onChange({
            ...filters,
            difficulty: difficulty
        });
    };

    // Legacy price filter handlers
    const handlePriceChange = (field, value) => {
        const numValue = value === "" ? null : parseFloat(value);
        onChange({
            ...filters,
            [field]: numValue
        });
    };

    const hasActiveFilters = () => {
        if (isFlashcards) {
            return filters.category || filters.difficulty;
        } else {
            return filters.minPrice !== null || filters.maxPrice !== null;
        }
    };

    const getActiveFiltersCount = () => {
        if (isFlashcards) {
            let count = 0;
            if (filters.category) count++;
            if (filters.difficulty) count++;
            return count;
        } else {
            let count = 0;
            if (filters.minPrice !== null) count++;
            if (filters.maxPrice !== null) count++;
            return count;
        }
    };

    return (
        <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900">
                        Filters
                        {hasActiveFilters() && (
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                {getActiveFiltersCount()}
                            </span>
                        )}
                    </h3>
                </div>

                <div className="flex items-center space-x-2">
                    {hasActiveFilters() && (
                        <button
                            onClick={onClear}
                            className="text-sm text-gray-500 hover:text-red-600 transition-colors flex items-center"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Clear All
                        </button>
                    )}

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                        <ChevronDown
                            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                </div>
            </div>

            <div className={`mt-4 space-y-4 md:space-y-0 md:grid md:grid-cols-4 md:gap-4 ${isExpanded ? 'block' : 'hidden md:grid'}`}>

                {/* FlashCard Filters */}
                {isFlashcards && (
                    <>
                        {/* Category Filter */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                value={filters.category || ''}
                                onChange={(e) => handleCategoryChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Difficulty Filter */}
                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                                Difficulty
                            </label>
                            <select
                                id="difficulty"
                                value={filters.difficulty || ''}
                                onChange={(e) => handleDifficultyChange(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">All Levels</option>
                                {DIFFICULTY_LEVELS.map((level) => (
                                    <option key={level} value={level}>
                                        {level}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {/* Legacy Article Filters */}
                {!isFlashcards && (
                    <>
                        {/* Price Range */}
                        <div>
                            <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Min Price
                            </label>
                            <input
                                type="number"
                                id="minPrice"
                                min="0"
                                step="0.01"
                                value={filters.minPrice ?? ''}
                                onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                                placeholder="Min"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-2">
                                Max Price
                            </label>
                            <input
                                type="number"
                                id="maxPrice"
                                min="0"
                                step="0.01"
                                value={filters.maxPrice ?? ''}
                                onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                                placeholder="Max"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </>
                )}

                {/* Sort By */}
                <div className={isFlashcards ? "md:col-span-2" : ""}>
                    <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                    </label>
                    <select
                        id="sortBy"
                        value={getCurrentSortValue()}
                        onChange={(e) => handleSortChange(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {sortOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters() && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-2">
                        <span className="text-sm text-gray-500">Active filters:</span>

                        {isFlashcards && (
                            <>
                                {filters.category && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Category: {filters.category}
                                        <button
                                            onClick={() => handleCategoryChange('')}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.difficulty && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Difficulty: {filters.difficulty}
                                        <button
                                            onClick={() => handleDifficultyChange('')}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </>
                        )}

                        {!isFlashcards && (
                            <>
                                {filters.minPrice !== null && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        Min: ${filters.minPrice}
                                        <button
                                            onClick={() => handlePriceChange('minPrice', '')}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}

                                {filters.maxPrice !== null && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Max: ${filters.maxPrice}
                                        <button
                                            onClick={() => handlePriceChange('maxPrice', '')}
                                            className="ml-1 text-green-600 hover:text-green-800"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Filters;