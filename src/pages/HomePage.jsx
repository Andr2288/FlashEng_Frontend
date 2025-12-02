import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import ArticleCard from "../components/ArticleCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import Filters from "../components/Filters.jsx";
import Pagination from "../components/Pagination.jsx";
import { Loader, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const HomePage = () => {
    const { authUser, logout } = useAuthStore();

    const [articles, setArticles] = useState([]);
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
        minPrice: null,
        maxPrice: null,
        sortBy: "name",
        sortDir: "asc"
    });


    const fetchArticles = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.pageSize.toString(),
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            });

            if (search) params.append("search", search);
            if (filters.minPrice !== null) params.append("minPrice", filters.minPrice.toString());
            if (filters.maxPrice !== null) params.append("maxPrice", filters.maxPrice.toString());

            const response = await axiosInstance.get(`/articles?${params}`);

            setArticles(response.data.content);
            setPagination({
                currentPage: response.data.number,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                pageSize: response.data.size
            });

        } catch (error) {
            console.error("Failed to fetch articles:", error);
            setError("Failed to load products. Please try again.");
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [search, filters, pagination.pageSize]);


    useEffect(() => {
        fetchArticles(0);
    }, [search, filters]);


    const handleSearch = useCallback((searchValue) => {
        setSearch(searchValue);
    }, []);


    const handleFiltersChange = useCallback((newFilters) => {
        setFilters(newFilters);
    }, []);


    const handleFiltersClear = useCallback(() => {
        setFilters({
            minPrice: null,
            maxPrice: null,
            sortBy: "name",
            sortDir: "asc"
        });
        setSearch("");
    }, []);


    const handlePageChange = useCallback((page) => {
        fetchArticles(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchArticles]);

    const handleLogout = () => {
        logout();
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="flex flex-col items-center justify-center h-96">
                            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                            <p className="text-gray-600 mb-4">{error}</p>
                            <button
                                onClick={() => fetchArticles(0)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome to Our Store!
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Hello, {authUser?.name}! Browse our product catalog.
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-300 rounded-md hover:bg-red-100 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Search products by name..."
                            />
                        </div>
                        <div>
                            <Filters
                                onFiltersChange={handleFiltersChange}
                                onClear={handleFiltersClear}
                            />
                        </div>
                    </div>

                    {/* Loading State */}
                    {loading && (
                        <div className="flex justify-center items-center h-96">
                            <Loader className="h-8 w-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading products...</span>
                        </div>
                    )}

                    {/* No Products */}
                    {!loading && articles.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-96">
                            <Package className="h-16 w-16 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                            <p className="text-gray-600 mb-4">
                                {search || filters.minPrice || filters.maxPrice
                                    ? "Try adjusting your search or filters"
                                    : "No products available at the moment"
                                }
                            </p>
                            {(search || filters.minPrice || filters.maxPrice) && (
                                <button
                                    onClick={handleFiltersClear}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Products Grid */}
                    {!loading && articles.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                                {articles.map((article) => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>

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
        </div>
    );
};

export default HomePage;