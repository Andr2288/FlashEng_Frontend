import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import OrderDetails from "../components/OrderDetails.jsx";
import {
    Loader,
    Package,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff
} from "lucide-react";
import toast from "react-hot-toast";

const OrdersHistoryPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthStore();

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
        startDate: "",
        endDate: "",
        orderId: ""
    });

    // Expanded order details
    const [expandedOrders, setExpandedOrders] = useState(new Set());

    // Fetch orders with filters and pagination
    const fetchOrders = useCallback(async (page = 0) => {
        try {
            setLoading(true);
            setError(null);

            const params = new URLSearchParams({
                page: page.toString(),
                size: pagination.pageSize.toString()
            });

            if (filters.startDate) params.append("startDate", filters.startDate);
            if (filters.endDate) params.append("endDate", filters.endDate);
            if (filters.orderId) params.append("orderId", filters.orderId);

            const response = await axiosInstance.get(`/orders/my?${params}`);

            setOrders(response.data.content);
            setPagination({
                currentPage: response.data.number,
                totalPages: response.data.totalPages,
                totalElements: response.data.totalElements,
                pageSize: response.data.size
            });

        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setError("Failed to load order history. Please try again.");

            if (error.response?.status === 401) {
                toast.error("Please log in again");
                navigate("/login");
            } else {
                toast.error("Failed to load order history");
            }
        } finally {
            setLoading(false);
        }
    }, [filters, pagination.pageSize, navigate]);

    // Load orders on component mount and when filters change
    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    // Filter change handlers - auto apply filters with debounce
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
        // Reset to first page when filters change
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    };

    // Reset filters
    const resetFilters = () => {
        setFilters({
            startDate: "",
            endDate: "",
            orderId: ""
        });
        setPagination(prev => ({ ...prev, currentPage: 0 }));
    };

    // Pagination handlers
    const handlePageChange = (newPage) => {
        fetchOrders(newPage);
    };

    // Toggle order details
    const toggleOrderDetails = (orderId) => {
        setExpandedOrders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(orderId)) {
                newSet.delete(orderId);
            } else {
                newSet.add(orderId);
            }
            return newSet;
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("uk-UA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading && orders.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-center h-64">
                        <Loader className="h-8 w-8 animate-spin text-blue-600" />
                        <span className="ml-3 text-lg text-gray-600">Loading orders...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                    <p className="text-gray-600">
                        Track and review your past orders
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Start Date */}
                        <div>
                            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                id="startDate"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange("startDate", e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                id="endDate"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange("endDate", e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Order ID */}
                        <div>
                            <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                                Order ID
                            </label>
                            <input
                                type="number"
                                id="orderId"
                                placeholder="Enter order ID"
                                value={filters.orderId}
                                onChange={(e) => handleFilterChange("orderId", e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        {/* Reset Button only */}
                        <div className="flex items-end">
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={() => fetchOrders(pagination.currentPage)}
                            className="mt-2 text-red-600 hover:text-red-700 font-medium"
                        >
                            Try again
                        </button>
                    </div>
                )}

                {/* Orders List */}
                {orders.length === 0 && !loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                        <p className="text-gray-600 mb-6">
                            You haven't made any orders yet or no orders match your filters.
                        </p>
                        <button
                            onClick={() => navigate("/home")}
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Order Summary */}
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Order #{order.orderId}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(order.orderDate)}
                                                </p>
                                            </div>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {order.status}
                                            </span>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold text-gray-900">
                                                {order.totalPrice} {order.currency}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {order.totalItems} items
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            <p>Ship to: {order.deliveryInfo.deliveryName}</p>
                                            <p>{order.deliveryInfo.deliveryCity}, {order.deliveryInfo.deliveryState}</p>
                                        </div>

                                        <button
                                            onClick={() => toggleOrderDetails(order.orderId)}
                                            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            {expandedOrders.has(order.orderId) ? (
                                                <>
                                                    <EyeOff className="h-4 w-4 mr-2" />
                                                    Hide Details
                                                </>
                                            ) : (
                                                <>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    View Details
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Order Details */}
                                {expandedOrders.has(order.orderId) && (
                                    <OrderDetails order={order} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="mt-8 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Showing {pagination.currentPage * pagination.pageSize + 1} to{" "}
                            {Math.min(
                                (pagination.currentPage + 1) * pagination.pageSize,
                                pagination.totalElements
                            )}{" "}
                            of {pagination.totalElements} orders
                        </div>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 0}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Previous
                            </button>

                            {/* Page Numbers */}
                            {[...Array(pagination.totalPages)].map((_, index) => {
                                const pageNum = index;
                                const isCurrentPage = pageNum === pagination.currentPage;

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => handlePageChange(pageNum)}
                                        className={`px-3 py-2 text-sm font-medium rounded-md ${
                                            isCurrentPage
                                                ? "bg-blue-600 text-white"
                                                : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNum + 1}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage >= pagination.totalPages - 1}
                                className="flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersHistoryPage;