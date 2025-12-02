import { X, Package, User, MapPin, CreditCard, Calendar, DollarSign, ShoppingBag } from "lucide-react";

const OrderDetailsModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">

                {/* Modal */}
                <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-3 rounded-lg">
                                <Package className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderId}</h2>
                                <p className="text-gray-600">Order details and information</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Order Date</div>
                                    <div className="text-sm font-bold text-gray-900">{formatDate(order.orderDate)}</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Total</div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {formatPrice(order.totalPrice, order.currency)}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <div className="flex items-center">
                                <ShoppingBag className="h-5 w-5 text-purple-600 mr-2" />
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Items</div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div>
                                <div className="text-sm font-medium text-gray-600 mb-1">Status</div>
                                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadge(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center mb-4">
                                <User className="h-5 w-5 text-gray-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Customer Information</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Name</div>
                                    <div className="text-sm text-gray-900">{order.customerName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Email</div>
                                    <div className="text-sm text-gray-900">{order.customerEmail}</div>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Information */}
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center mb-4">
                                <MapPin className="h-5 w-5 text-gray-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Delivery Information</h3>
                            </div>
                            <div className="space-y-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Recipient</div>
                                    <div className="text-sm text-gray-900">{order.deliveryInfo?.deliveryName}</div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-600">Address</div>
                                    <div className="text-sm text-gray-900">
                                        {order.deliveryInfo?.deliveryStreet}<br />
                                        {order.deliveryInfo?.deliveryCity}, {order.deliveryInfo?.deliveryState} {order.deliveryInfo?.deliveryZip}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mt-6">
                        <div className="bg-gray-50 p-6 rounded-lg">
                            <div className="flex items-center mb-4">
                                <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-gray-600">Credit Card</div>
                                <div className="text-sm text-gray-900">{order.deliveryInfo?.ccNumberMasked}</div>
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            {order.items && order.items.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {order.items.map((item, index) => (
                                        <div key={index} className="p-4">
                                            <div className="flex items-center space-x-4">
                                                {/* Product Image */}
                                                <div className="flex-shrink-0">
                                                    <img
                                                        src={item.articleImageUrl || '/placeholder-image.png'}
                                                        alt={item.articleName}
                                                        className="h-16 w-16 object-cover rounded-lg border border-gray-200"
                                                        onError={(e) => {
                                                            e.target.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAilBMVEX///9MTEzt7e3s7Ozv7+9OTk5KSkr4+Pj8/PxHR0fx8fFDQ0P29vbW1tY/Pz8lJSV4eHjPz88tLS0gICBmZmZxcXHh4eHm5uY6OjoyMjJTU1MsLCw1NTXV1dXBwcFqampcXFykpKSEhISRkZGysrKjo6McHBy4uLiZmZmIiIjLy8sTExOVlZUVFRX8B0hiAAAOXklEQVR4nO1di3qqOBAOhJALES21Jly0au31dN//9XaCtgqCRkUF6+x3zu46kORnJsncAsj7JRcIoyJh82NnuTmhO8Jrj/KO8I7wjvD6o7wjvCP8CwjdAlVe3Wmue0fYee5fQIiLVL765rgtHdZJkMpXt0K1muTeEXaf+0cRttgQO5x7R9h97h1h97mVCH+pLevhfbe4I2zDOC6IsJX+wUm+RTuH1STXPUEBusD9C1GMP4awtXPpUK67hrmKeUshPIEFlaWraZE6wZWUUVdigLOMeS/tOQw/YMbwuFekhyJ1gzseK4moJ9wNhEIIV6DJU/jWL1JapI5w3/r8VSFXbiCUIED6xGM/8YvkFKkTXE6cIEjJF8IFLRVsEPsO5y0Z5Slcn3OHcB6O2RJhvt54GL08kt9bSKdpCYEHxKNYuSubBssR4c4tEfeTeMY8LFb7ocdm8QbCa0vhNFpC4E6QSbMJrmTI5oF/Wwjhz6OiHtgDuVWg5DBIVtiBwk5Trow+wHkbSazUyg5gwyDHTvR88DQfdJpeiJ/wXIa9DUvnB6Gje4hJ1mlC85D4uxAyV3m/hPJb8ivMf3hFail3oBOnFiGJx3JlseaWQMmodQtNtZU70LweoZONmMJ5ZNVcveWY5E1cnusCy/7eQcjrtZTEI7aSYa1zeWGu0UflCQ9b3zsIfNIhhPl8gw1NSHuEYacQ5gQSxAfIsFsI2fIvJpW4UYS994+X79lEINaQDKMeXS6lbm1bl+DCNkdBevg16EeZ1rr/3/OEmp3a6Kva03JHEJrNfJKkBPxdGK7PdTRQyBU3gzD/7aUfJkHutRuPwdfOA4MF9VYQMkQ/Ugds6Nwd4mBoEh7ynmxGhm4LgrwULTJw6AhPjPh8+De4Q9lQCLcCYeneEsL8R4/+IhxdCVKJK3ppsA4crfxyJx1Y3EufgmRptYGN/ZN7ErUILzrxNrjsMyuHXoxc3tT+ew3CpeU9hhnXVoRSRaQcNEy47+iPW0FIF1FSUlIHADrB1LsVhPPQ30KYBITr8cEIc2unfqUxTVzD1IbxlLU0H1862XtvJcLdMrwCQm/KqwAej7B1MvSmPi9r6W3JUA55s1raOhmipzCpSqSQ/uEI8+WodWspW6RbIjRSDRK5995uIJSjeCsZBja4rz/pjSD00DzaVlHC//X23g==';
                                                        }}
                                                    />
                                                </div>

                                                {/* Product Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium text-gray-900 mb-1">
                                                        {item.articleName}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        {item.articleDescription}
                                                    </div>
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <span>Quantity: {item.quantity}</span>
                                                        <span className="mx-2">•</span>
                                                        <span>Unit Price: {formatPrice(item.unitPrice, item.currency)}</span>
                                                    </div>
                                                </div>

                                                {/* Item Total */}
                                                <div className="flex-shrink-0">
                                                    <div className="text-lg font-semibold text-gray-900">
                                                        {formatPrice(item.totalPrice, item.currency)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No items found in this order</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                        <div className="flex items-center justify-between text-lg font-semibold text-gray-900">
                            <span>Order Total:</span>
                            <span>{formatPrice(order.totalPrice, order.currency)}</span>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
