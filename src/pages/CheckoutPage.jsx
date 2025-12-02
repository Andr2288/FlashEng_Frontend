import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore.js";
import { useAuthStore } from "../store/useAuthStore.js";
import { axiosInstance } from "../lib/axios.js";
import { CreditCard, Truck, Package, ArrowLeft, Loader, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { authUser } = useAuthStore();
    const { cartItems, totalPrice, totalItems, currency, fetchCart, resetCart } = useCartStore();

    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);

    // Дані доставки
    const [deliveryData, setDeliveryData] = useState({
        deliveryName: authUser?.name || "",
        deliveryStreet: "",
        deliveryCity: "",
        deliveryState: "",
        deliveryZip: ""
    });

    // Дані картки
    const [paymentData, setPaymentData] = useState({
        ccNumber: "",
        ccExpiration: "",
        ccCvv: ""
    });

    // Помилки валідації
    const [errors, setErrors] = useState({});

    // Завантажуємо кошик при відкритті сторінки
    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Якщо кошик порожній, перенаправляємо на головну
    useEffect(() => {
        if (cartItems.length === 0 && !orderPlaced) {
            navigate("/home");
        }
    }, [cartItems, navigate, orderPlaced]);

    const handleDeliveryChange = (e) => {
        const { name, value } = e.target;
        setDeliveryData(prev => ({
            ...prev,
            [name]: value
        }));
        // Очищаємо помилку при введенні
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const handlePaymentChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Форматування номера картки (додаємо пробіли)
        if (name === "ccNumber") {
            formattedValue = value.replace(/\D/g, "").replace(/(\d{4})(?=\d)/g, "$1 ");
            if (formattedValue.length > 19) return; // Максимум 16 цифр + 3 пробіли
        }

        // Форматування дати закінчення (MM/YY)
        if (name === "ccExpiration") {
            formattedValue = value.replace(/\D/g, "");
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + "/" + formattedValue.slice(2, 4);
            }
            if (formattedValue.length > 5) return;
        }

        // Тільки цифри для CVV
        if (name === "ccCvv") {
            formattedValue = value.replace(/\D/g, "");
            if (formattedValue.length > 3) return;
        }

        setPaymentData(prev => ({
            ...prev,
            [name]: formattedValue
        }));

        // Очищаємо помилку при введенні
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Валідація доставки
        if (!deliveryData.deliveryName.trim()) {
            newErrors.deliveryName = "Name is required";
        }
        if (!deliveryData.deliveryStreet.trim()) {
            newErrors.deliveryStreet = "Street address is required";
        }
        if (!deliveryData.deliveryCity.trim()) {
            newErrors.deliveryCity = "City is required";
        }
        if (!deliveryData.deliveryState.trim()) {
            newErrors.deliveryState = "State is required";
        } else if (deliveryData.deliveryState.length !== 2) {
            newErrors.deliveryState = "State must be 2 characters (e.g., CA, NY)";
        }
        if (!deliveryData.deliveryZip.trim()) {
            newErrors.deliveryZip = "ZIP code is required";
        } else if (!/^\d{5}(-\d{4})?$/.test(deliveryData.deliveryZip)) {
            newErrors.deliveryZip = "Invalid ZIP code format (e.g., 12345 or 12345-6789)";
        }

        // Валідація картки
        const ccNumberDigits = paymentData.ccNumber.replace(/\D/g, "");
        if (!ccNumberDigits) {
            newErrors.ccNumber = "Credit card number is required";
        } else if (ccNumberDigits.length !== 16) {
            newErrors.ccNumber = "Credit card number must be 16 digits";
        }

        if (!paymentData.ccExpiration) {
            newErrors.ccExpiration = "Expiration date is required";
        } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentData.ccExpiration)) {
            newErrors.ccExpiration = "Invalid expiration format (MM/YY)";
        } else {
            // Перевіряємо що дата не в минулому
            const [month, year] = paymentData.ccExpiration.split("/");
            const expDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
            const now = new Date();
            if (expDate < now) {
                newErrors.ccExpiration = "Card has expired";
            }
        }

        if (!paymentData.ccCvv) {
            newErrors.ccCvv = "CVV is required";
        } else if (!/^\d{3}$/.test(paymentData.ccCvv)) {
            newErrors.ccCvv = "CVV must be 3 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePlaceOrder = async () => {
        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        if (cartItems.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        setIsPlacingOrder(true);

        try {
            const orderRequest = {
                deliveryName: deliveryData.deliveryName.trim(),
                deliveryStreet: deliveryData.deliveryStreet.trim(),
                deliveryCity: deliveryData.deliveryCity.trim(),
                deliveryState: deliveryData.deliveryState.trim().toUpperCase(),
                deliveryZip: deliveryData.deliveryZip.trim(),
                ccNumber: paymentData.ccNumber.replace(/\D/g, ""),
                ccExpiration: paymentData.ccExpiration,
                ccCvv: paymentData.ccCvv
            };

            const response = await axiosInstance.post("/orders", orderRequest);

            setOrderDetails(response.data);
            setOrderPlaced(true);
            resetCart(); // Очищаємо кошик після успішного замовлення
            toast.success("Order placed successfully!");

        } catch (error) {
            console.error("Error placing order:", error);
            const errorMessage = error.response?.data?.message || "Failed to place order";
            toast.error(errorMessage);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // Сторінка успішного замовлення
    if (orderPlaced && orderDetails) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                        <p className="text-gray-600 mb-6">Thank you for your purchase. Your order has been successfully placed.</p>
                        
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Order ID:</span>
                                    <span className="font-medium ml-2">#{orderDetails.orderId}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Items:</span>
                                    <span className="font-medium ml-2">{orderDetails.totalItems}</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-500">Total:</span>
                                    <span className="font-bold text-lg ml-2">
                                        {orderDetails.totalPrice} {orderDetails.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => navigate("/home")}
                                className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => navigate("/orders")}
                                className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                View Order History
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate("/cart")}
                        className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mr-4"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Cart
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Delivery Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center mb-4">
                                <Truck className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Delivery Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryName"
                                        value={deliveryData.deliveryName}
                                        onChange={handleDeliveryChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.deliveryName ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="John Doe"
                                    />
                                    {errors.deliveryName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryName}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Street Address
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryStreet"
                                        value={deliveryData.deliveryStreet}
                                        onChange={handleDeliveryChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.deliveryStreet ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="123 Main Street"
                                    />
                                    {errors.deliveryStreet && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryStreet}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryCity"
                                        value={deliveryData.deliveryCity}
                                        onChange={handleDeliveryChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.deliveryCity ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="New York"
                                    />
                                    {errors.deliveryCity && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryCity}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryState"
                                        value={deliveryData.deliveryState}
                                        onChange={handleDeliveryChange}
                                        maxLength={2}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.deliveryState ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="NY"
                                    />
                                    {errors.deliveryState && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryState}</p>
                                    )}
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        ZIP Code
                                    </label>
                                    <input
                                        type="text"
                                        name="deliveryZip"
                                        value={deliveryData.deliveryZip}
                                        onChange={handleDeliveryChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.deliveryZip ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="10001"
                                    />
                                    {errors.deliveryZip && (
                                        <p className="mt-1 text-sm text-red-600">{errors.deliveryZip}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Payment Information */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center mb-4">
                                <CreditCard className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Payment Information</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Number
                                    </label>
                                    <input
                                        type="text"
                                        name="ccNumber"
                                        value={paymentData.ccNumber}
                                        onChange={handlePaymentChange}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.ccNumber ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="1234 5678 9012 3456"
                                    />
                                    {errors.ccNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.ccNumber}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Expiration Date
                                        </label>
                                        <input
                                            type="text"
                                            name="ccExpiration"
                                            value={paymentData.ccExpiration}
                                            onChange={handlePaymentChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.ccExpiration ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="MM/YY"
                                        />
                                        {errors.ccExpiration && (
                                            <p className="mt-1 text-sm text-red-600">{errors.ccExpiration}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="text"
                                            name="ccCvv"
                                            value={paymentData.ccCvv}
                                            onChange={handlePaymentChange}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                                errors.ccCvv ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                            placeholder="123"
                                        />
                                        {errors.ccCvv && (
                                            <p className="mt-1 text-sm text-red-600">{errors.ccCvv}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Order Preview */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                            <div className="flex items-center mb-4">
                                <Package className="h-6 w-6 text-blue-600 mr-3" />
                                <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-3 mb-4">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={item.articleImageUrl || "https://via.placeholder.com/48x48"}
                                                alt={item.articleName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {item.articleName}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Qty: {item.quantity} × {item.articlePrice} {item.currency}
                                            </p>
                                        </div>
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.totalPrice} {item.currency}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <hr className="my-4" />

                            {/* Total */}
                            <div className="flex items-center justify-between text-lg font-bold text-gray-900 mb-6">
                                <span>Total ({totalItems} items):</span>
                                <span>{totalPrice} {currency}</span>
                            </div>

                            {/* Place Order Button */}
                            <button
                                onClick={handlePlaceOrder}
                                disabled={isPlacingOrder || cartItems.length === 0}
                                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <Loader className="h-5 w-5 animate-spin mr-2" />
                                        Placing Order...
                                    </>
                                ) : (
                                    `Place Order (${totalPrice} ${currency})`
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;