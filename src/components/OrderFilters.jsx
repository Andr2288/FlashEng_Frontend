import { useState } from "react";
import { Search, Calendar, Hash, Filter, X, RotateCcw } from "lucide-react";

const OrderFilters = ({ filters, onChange, loading }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleInputChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        
        // Apply filters immediately for text inputs
        if (field === 'customerName' || field === 'orderId') {
            onChange(newFilters);
        }
    };

    const handleDateChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const handleSortChange = (field, value) => {
        const newFilters = { ...localFilters, [field]: value };
        setLocalFilters(newFilters);
        onChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            customerName: "",
            startDate: "",
            endDate: "",
            orderId: "",
            sortBy: "createdAt",
            sortDir: "desc"
        };
        setLocalFilters(clearedFilters);
        onChange(clearedFilters);
    };

    const hasActiveFilters = () => {
        return localFilters.customerName || 
               localFilters.startDate || 
               localFilters.endDate || 
               localFilters.orderId ||
               localFilters.sortBy !== "createdAt" ||
               localFilters.sortDir !== "desc";
    };

    return (
        <div className="space-y-4">
            {/* Title */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Filter className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                </div>
                
                {hasActiveFilters() && (
                    <button
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Filter Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Customer Name Search */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Customer Name
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search customer..."
                            value={localFilters.customerName}
                            onChange={(e) => handleInputChange('customerName', e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        {localFilters.customerName && (
                            <button
                                onClick={() => handleInputChange('customerName', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Order ID Search */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Order ID
                    </label>
                    <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Enter order ID..."
                            value={localFilters.orderId}
                            onChange={(e) => handleInputChange('orderId', e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        {localFilters.orderId && (
                            <button
                                onClick={() => handleInputChange('orderId', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Start Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            value={localFilters.startDate}
                            onChange={(e) => handleDateChange('startDate', e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        {localFilters.startDate && (
                            <button
                                onClick={() => handleDateChange('startDate', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>

                {/* End Date */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="date"
                            value={localFilters.endDate}
                            onChange={(e) => handleDateChange('endDate', e.target.value)}
                            disabled={loading}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        {localFilters.endDate && (
                            <button
                                onClick={() => handleDateChange('endDate', '')}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                            >
                                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Sorting Options */}
            <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                
                <div className="flex items-center space-x-2">
                    <select
                        value={localFilters.sortBy}
                        onChange={(e) => handleSortChange('sortBy', e.target.value)}
                        disabled={loading}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="createdAt">Order Date</option>
                        <option value="totalPrice">Total Price</option>
                        <option value="id">Order ID</option>
                    </select>
                    
                    <select
                        value={localFilters.sortDir}
                        onChange={(e) => handleSortChange('sortDir', e.target.value)}
                        disabled={loading}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                    </select>
                </div>
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Quick filters:</span>
                
                <button
                    onClick={() => handleDateChange('startDate', new Date().toISOString().split('T')[0])}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors disabled:opacity-50"
                >
                    Today
                </button>
                
                <button
                    onClick={() => {
                        const lastWeek = new Date();
                        lastWeek.setDate(lastWeek.getDate() - 7);
                        handleDateChange('startDate', lastWeek.toISOString().split('T')[0]);
                    }}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors disabled:opacity-50"
                >
                    Last 7 days
                </button>
                
                <button
                    onClick={() => {
                        const lastMonth = new Date();
                        lastMonth.setMonth(lastMonth.getMonth() - 1);
                        handleDateChange('startDate', lastMonth.toISOString().split('T')[0]);
                    }}
                    disabled={loading}
                    className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors disabled:opacity-50"
                >
                    Last month
                </button>
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters() && (
                <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-700">Active filters:</span>
                    <div className="flex items-center space-x-1">
                        {localFilters.customerName && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                Customer: {localFilters.customerName}
                                <button
                                    onClick={() => handleInputChange('customerName', '')}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {localFilters.orderId && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                Order ID: {localFilters.orderId}
                                <button
                                    onClick={() => handleInputChange('orderId', '')}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {localFilters.startDate && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
                                From: {localFilters.startDate}
                                <button
                                    onClick={() => handleDateChange('startDate', '')}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                        {localFilters.endDate && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                To: {localFilters.endDate}
                                <button
                                    onClick={() => handleDateChange('endDate', '')}
                                    className="ml-1"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderFilters;
