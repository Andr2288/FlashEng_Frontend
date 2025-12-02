import { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";

const Filters = ({ onFiltersChange, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: "",
        maxPrice: "",
        sortBy: "name",
        sortDir: "asc"
    });

    useEffect(() => {
        // Apply filters after a short delay to avoid too many API calls
        const timer = setTimeout(() => {
            const filtersToApply = {
                minPrice: filters.minPrice ? parseFloat(filters.minPrice) : null,
                maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : null,
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            };
            onFiltersChange(filtersToApply);
        }, 300);

        return () => clearTimeout(timer);
    }, [filters, onFiltersChange]);

    const handleInputChange = (name, value) => {
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleClear = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            sortBy: "name",
            sortDir: "asc"
        });
        onClear();
    };

    const hasActiveFilters = filters.minPrice || filters.maxPrice || 
                           filters.sortBy !== "name" || filters.sortDir !== "asc";

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center space-x-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                    hasActiveFilters
                        ? "border-blue-500 text-blue-700 bg-blue-50"
                        : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                }`}
            >
                <Filter className="h-4 w-4" />
                <span>Filters</span>
                {hasActiveFilters && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Active
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {/* Price Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Price Range
                                    </label>
                                    <div className="flex space-x-2">
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Min"
                                                value={filters.minPrice}
                                                onChange={(e) => handleInputChange("minPrice", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <span className="flex items-center text-gray-500">to</span>
                                        <div className="flex-1">
                                            <input
                                                type="number"
                                                placeholder="Max"
                                                value={filters.maxPrice}
                                                onChange={(e) => handleInputChange("maxPrice", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Sort By */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => handleInputChange("sortBy", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="name">Name</option>
                                        <option value="price">Price</option>
                                        <option value="createdAt">Date Added</option>
                                        <option value="availableQuantity">Stock</option>
                                    </select>
                                </div>

                                {/* Sort Direction */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Sort Direction
                                    </label>
                                    <select
                                        value={filters.sortDir}
                                        onChange={(e) => handleInputChange("sortDir", e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="asc">Ascending</option>
                                        <option value="desc">Descending</option>
                                    </select>
                                </div>

                                {/* Clear Filters Button */}
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleClear}
                                        className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Filters;
