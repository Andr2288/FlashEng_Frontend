import { useEffect } from "react";
import { useCartStore } from "../store/useCartStore.js";
import { Link, useNavigate } from "react-router-dom";
import {
    ShoppingCart,
    Plus,
    Minus,
    Trash2,
    ShoppingBag,
    Loader,
    ArrowLeft
} from "lucide-react";

const BasketPage = () => {
    const navigate = useNavigate();
    const {
        cartItems,
        totalPrice,
        totalItems,
        currency,
        isLoading,
        isUpdatingCart,
        fetchCart,
        updateCartItem,
        removeFromCart,
        clearCart
    } = useCartStore();

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    const handleQuantityChange = async (cartItemId, newQuantity) => {
        if (newQuantity < 1) return;
        await updateCartItem(cartItemId, newQuantity);
    };

    const handleRemoveItem = async (cartItemId) => {
        await removeFromCart(cartItemId);
    };

    const handleClearCart = async () => {
        if (window.confirm("Are you sure you want to clear your cart?")) {
            await clearCart();
        }
    };

    const handleCheckout = () => {
        navigate("/checkout");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-3">
                    <Loader className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Loading your cart...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/home"
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to Shop
                        </Link>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                        <ShoppingCart className="h-8 w-8 mr-3" />
                        Shopping Cart
                    </h1>
                </div>

                {/* Empty Cart */}
                {cartItems.length === 0 && (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-600 mb-6">Add some items to get started</p>
                        <Link
                            to="/home"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ShoppingBag className="h-5 w-5 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>
                )}

                {/* Cart Items */}
                {cartItems.length > 0 && (
                    <div className="space-y-6">
                        {/* Cart Summary Header */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Cart Summary ({totalItems} item{totalItems !== 1 ? 's' : ''})
                                    </h2>
                                    <p className="text-gray-600">Review your items before checkout</p>
                                </div>
                                <button
                                    onClick={handleClearCart}
                                    className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Clear Cart
                                </button>
                            </div>
                        </div>

                        {/* Cart Items List */}
                        <div className="space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="bg-white rounded-lg shadow-sm p-6">
                                    <div className="flex items-center space-x-6">
                                        {/* Product Image */}
                                        <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
                                            <img
                                                src={item.articleImageUrl ||
                                                    "data:image/png;base64,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"}
                                                alt={item.articleName}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {item.articleName}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {item.articleDescription}
                                            </p>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-lg font-bold text-gray-900">
                                                    {item.articlePrice} {item.currency}
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {item.availableQuantity} available
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2 border rounded-lg p-1">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    disabled={isUpdatingCart || item.quantity <= 1}
                                                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </button>

                                                <span className="px-3 py-1 min-w-[3rem] text-center font-medium">
                                                    {isUpdatingCart ? "..." : item.quantity}
                                                </span>

                                                <button
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    disabled={isUpdatingCart || item.quantity >= item.availableQuantity}
                                                    className="p-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Plus className="h-4 w-4" />
                                                </button>
                                            </div>

                                            {/* Total Price */}
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">
                                                    {item.totalPrice} {item.currency}
                                                </div>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remove item"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Cart Total */}
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="flex items-center justify-between text-xl font-bold text-gray-900 mb-4">
                                <span>Total:</span>
                                <span>{totalPrice} {currency}</span>
                            </div>

                            <div className="flex items-center space-x-4">
                                <Link
                                    to="/home"
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
                                >
                                    Continue Shopping
                                </Link>

                                <button
                                    onClick={handleCheckout}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BasketPage;