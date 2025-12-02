import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import OrderFilters from "../components/OrderFilters.jsx";
import OrderTable from "../components/OrderTable.jsx";
import OrderDetailsModal from "../components/OrderDetailsModal.jsx";
import Pagination from "../components/Pagination.jsx";
import { 
    Shield,
    Package2,
    Users,
    DollarSign,
    TrendingUp,
    Calendar,
    Search,
    Filter,
    Eye,
    Download,
    RefreshCw,
    AlertCircle,
    Loader
} from "lucide-react";
import toast from "react-hot-toast";

const AdminOrdersPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

    // Redirect if not admin
    useEffect(() => {
        if (authUser && !authUser.isAdmin) {
            toast.error("Access denied. Admin privileges required.");
            navigate("/home");
            return;
        }
    }, [authUser, navigate]);

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalElements: 0,
        pageSize: 10
    });

    // Filter state
    const [filters, setFilters] = useState({
        customerName: "",
        startDate: "",
        endDate: "",
        orderId: "",
        sortBy: "createdAt",
        sortDir: "desc"
    });

    // Modal state
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Stats state
    const [stats, setStats] = useState({
        totalOrders: 0,
        totalRevenue: 0,
        uniqueCustomers: 0
    });

    // Fetch orders
    const fetchOrders = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.pageSize.toString(),
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            });

            if (filters.customerName) params.append("customerName", filters.customerName);
            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            if (filters.orderId) params.append("orderId", filters.orderId);

            const response = await axiosInstance.get(`/admin/orders?${params}`);

            setOrders(response.data.content);
            setPagination({
                currentPage: response.data.number,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                pageSize: response.data.size
            });

        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setError("Failed to load orders. Please try again.");
            
            if (error.response?.status === 403) {
                toast.error("Access denied. Admin privileges required.");
                navigate("/home");
            }
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageSize, navigate]);

    // Load orders on component mount and filter changes
    useEffect(() => {
        fetchOrders(0);
    }, [filters]);

    // Handle filter changes
    const handleFilterChange = useCallback((newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Handle page change
    const handlePageChange = useCallback((page) => {
        fetchOrders(page);
    }, [fetchOrders]);

    // Handle view order details
    const handleViewOrder = async (orderId) => {
        try {
            const response = await axiosInstance.get(`/admin/orders/${orderId}`);
            setSelectedOrder(response.data);
            setIsModalOpen(true);
        } catch (error) {
            console.error("Failed to fetch order details:", error);
            toast.error("Failed to load order details.");
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        fetchOrders(pagination.currentPage);
    };

    // Handle export (placeholder)
    const handleExport = () => {
        toast.success("Export functionality will be implemented soon!");
    };

    if (loading && orders.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="flex items-center space-x-2">
                    <Loader className="size-8 animate-spin text-blue-600" />
                    <span className="text-lg font-medium text-gray-600">Loading orders...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Shield className="h-8 w-8 text-purple-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Admin Orders Panel</h1>
                            <p className="text-gray-600">Manage and view all customer orders</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExport}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Package2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{pagination.totalElements}</p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg">
                            <DollarSign className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${orders.reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0).toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Unique Customers</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {new Set(orders.map(order => order.customerName)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <OrderFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    loading={loading}
                />
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-700">{error}</span>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">
                            Orders ({pagination.totalElements})
                        </h2>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Showing page {pagination.currentPage + 1} of {pagination.totalPages}</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2">
                            <Loader className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-gray-600">Loading orders...</span>
                        </div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-12">
                        <Package2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-500">Try adjusting your filters or check back later.</p>
                    </div>
                ) : (
                    <OrderTable
                        orders={orders}
                        onViewDetails={handleViewOrder}
                        loading={loading}
                    />
                )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={pagination.currentPage}
                        totalPages={pagination.totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedOrder(null);
                }}
            />
        </div>
    );
};

export default AdminOrdersPage;
