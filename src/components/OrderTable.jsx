import { Eye, User, Calendar, DollarSign, Package, MapPin } from "lucide-react";

const OrderTable = ({ orders, onViewDetails, loading }) => {
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency || 'USD'
        }).format(price);
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Processing': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Pending': 'bg-blue-100 text-blue-700 border-blue-200',
            'Cancelled': 'bg-red-100 text-red-700 border-red-200'
        };

        return statusConfig[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-500">Try adjusting your filters to see more results.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Items
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Delivery
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {orders.map((order) => (
                        <tr key={order.orderId} className="hover:bg-gray-50 transition-colors">
                            {/* Order ID */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                        <Package className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            #{order.orderId}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Order ID
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Customer */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="bg-purple-100 p-2 rounded-full mr-3">
                                        <User className="h-4 w-4 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {order.customerName}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {order.customerEmail}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDate(order.orderDate)}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Total Price */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                    <div className="text-sm font-medium text-gray-900">
                                        {formatPrice(order.totalPrice, order.currency)}
                                    </div>
                                </div>
                            </td>

                            {/* Items Count */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                    {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                                </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </td>

                            {/* Delivery Info */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                    <div className="text-sm text-gray-900">
                                        <div className="font-medium">
                                            {order.deliveryInfo?.deliveryCity}, {order.deliveryInfo?.deliveryState}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.deliveryInfo?.deliveryZip}
                                        </div>
                                    </div>
                                </div>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button
                                    onClick={() => onViewDetails(order.orderId)}
                                    disabled={loading}
                                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    View
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mobile View */}
            <div className="lg:hidden">
                <div className="space-y-4 p-4">
                    {orders.map((order) => (
                        <div key={order.orderId} className="bg-white border border-gray-200 rounded-lg p-4">
                            {/* Order Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                        <Package className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">#{order.orderId}</div>
                                        <div className="text-sm text-gray-500">{formatDate(order.orderDate)}</div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer Info */}
                            <div className="flex items-center mb-3">
                                <User className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                    <div className="font-medium text-gray-900">{order.customerName}</div>
                                    <div className="text-sm text-gray-500">{order.customerEmail}</div>
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                <div className="flex items-center">
                                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                    <span className="font-medium">{formatPrice(order.totalPrice, order.currency)}</span>
                                </div>
                                <div>
                                    {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                                </div>
                            </div>

                            {/* Delivery */}
                            <div className="flex items-center mb-3 text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span>
                                    {order.deliveryInfo?.deliveryCity}, {order.deliveryInfo?.deliveryState} {order.deliveryInfo?.deliveryZip}
                                </span>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => onViewDetails(order.orderId)}
                                disabled={loading}
                                className="w-full flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 font-medium rounded-md hover:bg-blue-200 transition-colors disabled:opacity-50"
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OrderTable;
