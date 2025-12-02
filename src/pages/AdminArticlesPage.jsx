import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import ArticleForm from "../components/ArticleForm.jsx";
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
    Package,
    AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

const AdminArticlesPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    // Redirect if not admin
    useEffect(() => {
        if (authUser && !authUser.isAdmin) {
            toast.error("Access denied. Admin privileges required.");
            navigate("/home");
        }
    }, [authUser, navigate]);

    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 12
    });

    // Filter state
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        minPrice: null,
        maxPrice: null,
        sortBy: "name",
        sortDir: "asc"
    });

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch articles with filters and pagination
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

            const response = await axiosInstance.get(`/admin/articles?${params}`);

            setArticles(response.data.content);
            setPagination({
                currentPage: response.data.number,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                pageSize: response.data.size
            });

        } catch (error) {
            console.error("Failed to fetch articles:", error);
            
            if (error.response?.status === 403) {
                toast.error("Access denied. Admin privileges required.");
                navigate("/home");
            } else {
                setError("Failed to load articles. Please try again.");
                toast.error("Failed to load articles");
            }
        } finally {
            setLoading(false);
        }
    }, [search, filters, pagination.pageSize, navigate]);

    // Initial load
    useEffect(() => {
        if (authUser?.isAdmin) {
            fetchArticles(0);
        }
    }, [search, filters, authUser, fetchArticles]);

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
            minPrice: null,
            maxPrice: null,
            sortBy: "name",
            sortDir: "asc"
        });
        setSearch("");
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        fetchArticles(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [fetchArticles]);

    // Create article
    const handleCreateArticle = async (articleData) => {
        try {
            await axiosInstance.post("/admin/articles", articleData);
            toast.success("Article created successfully!");
            setIsCreateModalOpen(false);
            fetchArticles(pagination.currentPage);
        } catch (error) {
            console.error("Error creating article:", error);
            const errorMessage = error.response?.data?.message || "Failed to create article";
            toast.error(errorMessage);
        }
    };

    // Update article
    const handleUpdateArticle = async (articleData) => {
        try {
            await axiosInstance.put(`/admin/articles/${selectedArticle.id}`, articleData);
            toast.success("Article updated successfully!");
            setIsEditModalOpen(false);
            setSelectedArticle(null);
            fetchArticles(pagination.currentPage);
        } catch (error) {
            console.error("Error updating article:", error);
            const errorMessage = error.response?.data?.message || "Failed to update article";
            toast.error(errorMessage);
        }
    };

    // Delete article
    const handleDeleteArticle = async (article) => {
        if (!window.confirm(`Are you sure you want to delete "${article.name}"? This action cannot be undone.`)) {
            return;
        }

        setIsDeleting(true);
        try {
            await axiosInstance.delete(`/admin/articles/${article.id}`);
            toast.success("Article deleted successfully!");
            fetchArticles(pagination.currentPage);
        } catch (error) {
            console.error("Error deleting article:", error);
            const errorMessage = error.response?.data?.message || "Failed to delete article";
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    // Open edit modal
    const openEditModal = (article) => {
        setSelectedArticle(article);
        setIsEditModalOpen(true);
    };

    // View article details
    const viewArticle = (article) => {
        // Simple alert with article details for now
        alert(`Article Details:\n\nName: ${article.name}\nDescription: ${article.description}\nPrice: ${article.price} ${article.currency}\nStock: ${article.availableQuantity}\nCreated: ${new Date(article.createdAt).toLocaleDateString()}`);
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
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                                <Shield className="h-8 w-8 mr-3 text-blue-600" />
                                Admin - Articles Management
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Manage your store's product catalog
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0">
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-5 w-5 mr-2" />
                                Add New Article
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <SearchBar
                                onSearch={handleSearch}
                                placeholder="Search articles by name..."
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
                            <span className="ml-2 text-gray-600">Loading articles...</span>
                        </div>
                    )}

                    {/* No Articles */}
                    {!loading && articles.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-96">
                            <Package className="h-16 w-16 text-gray-400 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No articles found</h2>
                            <p className="text-gray-600 mb-4">
                                {search || filters.minPrice || filters.maxPrice
                                    ? "Try adjusting your search or filters"
                                    : "Create your first article to get started"
                                }
                            </p>
                            {(search || filters.minPrice || filters.maxPrice) ? (
                                <button
                                    onClick={handleFiltersClear}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="h-5 w-5 mr-2" />
                                    Add New Article
                                </button>
                            )}
                        </div>
                    )}

                    {/* Articles Table */}
                    {!loading && articles.length > 0 && (
                        <>
                            <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Article
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Price
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Stock
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Created
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {articles.map((article) => (
                                                <tr key={article.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-12 w-12">
                                                                <img
                                                                    className="h-12 w-12 rounded-lg object-cover"
                                                                    src={article.imageUrl || "data:image/png;base64,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"}
                                                                    alt={article.name}
                                                                    onError={(e) => {
                                                                        e.target.src = "data:image/png;base64,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";
                                                                    }}
                                                                />
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {article.name}
                                                                </div>
                                                                <div className="text-sm text-gray-500 max-w-xs truncate">
                                                                    {article.description}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900 font-medium">
                                                            {article.price} {article.currency}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                            article.availableQuantity > 10
                                                                ? "bg-green-100 text-green-800"
                                                                : article.availableQuantity > 0
                                                                    ? "bg-yellow-100 text-yellow-800"
                                                                    : "bg-red-100 text-red-800"
                                                        }`}>
                                                            {article.availableQuantity} units
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(article.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex items-center justify-end space-x-2">
                                                            <button
                                                                onClick={() => viewArticle(article)}
                                                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                                                title="View Details"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => openEditModal(article)}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                                                title="Edit Article"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteArticle(article)}
                                                                disabled={isDeleting}
                                                                className="text-red-600 hover:text-red-900 p-1 rounded disabled:opacity-50"
                                                                title="Delete Article"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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

            {/* Create Article Modal */}
            {isCreateModalOpen && (
                <ArticleForm
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateArticle}
                    title="Create New Article"
                    mode="create"
                />
            )}

            {/* Edit Article Modal */}
            {isEditModalOpen && selectedArticle && (
                <ArticleForm
                    isOpen={isEditModalOpen}
                    onClose={() => {
                        setIsEditModalOpen(false);
                        setSelectedArticle(null);
                    }}
                    onSubmit={handleUpdateArticle}
                    initialData={selectedArticle}
                    title="Edit Article"
                    mode="edit"
                />
            )}
        </div>
    );
};

export default AdminArticlesPage;
