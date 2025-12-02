import { MapPin, CreditCard } from "lucide-react";

const OrderDetails = ({ order }) => {
    if (!order) return null;

    return (
        <div className="border-t border-gray-200 bg-gray-50">
            <div className="p-6">
                {/* Order Items */}
                <div className="mb-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h4>
                    <div className="space-y-4">
                        {order.items.map((item, index) => (
                            <div key={`${item.articleId}-${index}`} className="flex items-center space-x-4 bg-white p-4 rounded-lg border border-gray-200">
                                {/* Product Image */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={item.imageUrl || "/api/placeholder/80/80"}
                                        alt={item.articleName}
                                        className="w-20 h-20 object-cover rounded-lg"
                                        onError={(e) => {
                                            e.target.src = "/api/placeholder/80/80";
                                        }}
                                    />
                                </div>

                                {/* Product Details */}
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-lg font-medium text-gray-900 truncate">
                                        {item.articleName}
                                    </h5>
                                    {item.articleDescription && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                            {item.articleDescription}
                                        </p>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{item.price} {item.currency}</span>
                                            <span className="mx-2">×</span>
                                            <span>{item.quantity}</span>
                                        </div>
                                        <div className="text-lg font-semibold text-gray-900">
                                            {item.totalPrice} {item.currency}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Delivery Information */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Shipping Address */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <MapPin className="h-5 w-5 mr-2 text-blue-600" />
                            Shipping Address
                        </h4>
                        <div className="text-sm text-gray-600 space-y-1">
                            <p className="font-medium text-gray-900">{order.deliveryInfo.deliveryName}</p>
                            <p>{order.deliveryInfo.deliveryStreet}</p>
                            <p>
                                {order.deliveryInfo.deliveryCity}, {order.deliveryInfo.deliveryState}{" "}
                                {order.deliveryInfo.deliveryZip}
                            </p>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                        <h4 className="flex items-center text-lg font-semibold text-gray-900 mb-3">
                            <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                            Order Summary
                        </h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items ({order.totalItems})</span>
                                <span className="text-gray-900">{order.totalPrice} {order.currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-gray-900">Free</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                                <div className="flex justify-between font-semibold">
                                    <span className="text-gray-900">Total</span>
                                    <span className="text-gray-900">{order.totalPrice} {order.currency}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Order Status</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
