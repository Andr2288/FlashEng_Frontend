import { useState, useEffect } from "react";
import { X, Save, Loader, AlertCircle } from "lucide-react";

const ArticleForm = ({
                         isOpen,
                         onClose,
                         onSubmit,
                         initialData = null,
                         title = "Article Form",
                         mode = "create"
                     }) => {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        imageUrl: "",
        price: "",
        currency: "USD",
        availableQuantity: ""
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Currency options
    const currencies = [
        { code: "USD", name: "US Dollar" },
        { code: "EUR", name: "Euro" },
        { code: "GBP", name: "British Pound" },
        { code: "UAH", name: "Ukrainian Hryvnia" },
        { code: "JPY", name: "Japanese Yen" }
    ];

    // Set initial data for edit mode
    useEffect(() => {
        if (mode === "edit" && initialData) {
            setFormData({
                name: initialData.name || "",
                description: initialData.description || "",
                imageUrl: initialData.imageUrl || "",
                price: initialData.price ? initialData.price.toString() : "",
                currency: initialData.currency || "USD",
                availableQuantity: initialData.availableQuantity ? initialData.availableQuantity.toString() : ""
            });
        } else {
            // Reset form for create mode
            setFormData({
                name: "",
                description: "",
                imageUrl: "",
                price: "",
                currency: "USD",
                availableQuantity: ""
            });
        }
        setErrors({});
    }, [mode, initialData, isOpen]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Name validation
        if (!formData.name.trim()) {
            newErrors.name = "Product name is required";
        } else if (formData.name.trim().length > 50) {
            newErrors.name = "Product name must be 50 characters or less";
        }

        // Description validation
        if (!formData.description.trim()) {
            newErrors.description = "Product description is required";
        } else if (formData.description.trim().length > 255) {
            newErrors.description = "Description must be 255 characters or less";
        }

        // Price validation
        if (!formData.price) {
            newErrors.price = "Price is required";
        } else {
            const price = parseFloat(formData.price);
            if (isNaN(price) || price <= 0) {
                newErrors.price = "Price must be a positive number";
            } else if (price > 999999.99) {
                newErrors.price = "Price must be less than 999,999.99";
            }
        }

        // Currency validation
        if (!formData.currency) {
            newErrors.currency = "Currency is required";
        } else if (!currencies.some(c => c.code === formData.currency)) {
            newErrors.currency = "Invalid currency selected";
        }

        // Quantity validation
        if (!formData.availableQuantity) {
            newErrors.availableQuantity = "Quantity is required";
        } else {
            const quantity = parseInt(formData.availableQuantity);
            if (isNaN(quantity) || quantity < 0) {
                newErrors.availableQuantity = "Quantity must be 0 or greater";
            } else if (quantity > 999999) {
                newErrors.availableQuantity = "Quantity must be less than 999,999";
            }
        }

        // Image URL validation (optional)
        if (formData.imageUrl && formData.imageUrl.trim()) {
            if (formData.imageUrl.trim().length > 255) {
                newErrors.imageUrl = "Image URL must be 255 characters or less";
            } else if (!formData.imageUrl.match(/^https?:\/\/.+$/) && !formData.imageUrl.startsWith("data:image/")) {
                newErrors.imageUrl = "Image URL must be a valid HTTP(S) URL or data URL";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const submitData = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                imageUrl: formData.imageUrl.trim() || null,
                price: parseFloat(formData.price),
                currency: formData.currency,
                availableQuantity: parseInt(formData.availableQuantity)
            };

            await onSubmit(submitData);

            // Form will be closed by parent component
        } catch (error) {
            console.error("Error submitting form:", error);
            // Error handling is done in parent component
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            setFormData({
                name: "",
                description: "",
                imageUrl: "",
                price: "",
                currency: "USD",
                availableQuantity: ""
            });
            setErrors({});
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Modal */}
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                    {/* Header */}
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                {title}
                            </h3>
                            <button
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form className="space-y-4">
                            {/* Name and Description Row */}
                            <div className="grid grid-cols-2 gap-6">
                                {/* Name Field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        maxLength="50"
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="Enter product name"
                                    />
                                    <div className="mt-1 flex justify-between items-center">
                                        {errors.name ? (
                                            <p className="text-sm text-red-600 flex items-center">
                                                <AlertCircle className="h-4 w-4 mr-1" />
                                                {errors.name}
                                            </p>
                                        ) : (
                                            <span></span>
                                        )}
                                        <span className="text-xs text-gray-500">
                                            {formData.name.length}/50
                                        </span>
                                    </div>
                                </div>

                                {/* Image URL Field */}
                                <div>
                                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                                        Image URL
                                    </label>
                                    <input
                                        type="url"
                                        id="imageUrl"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.imageUrl ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.imageUrl && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.imageUrl}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Description Field */}
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="2"
                                    maxLength="255"
                                    className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Enter product description"
                                />
                                <div className="mt-1 flex justify-between items-center">
                                    {errors.description ? (
                                        <p className="text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.description}
                                        </p>
                                    ) : (
                                        <span></span>
                                    )}
                                    <span className="text-xs text-gray-500">
                                        {formData.description.length}/255
                                    </span>
                                </div>
                            </div>

                            {/* Price, Currency and Quantity Row */}
                            <div className="grid grid-cols-3 gap-4">
                                {/* Price Field */}
                                <div>
                                    <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        max="999999.99"
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.price ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="0.00"
                                    />
                                    {errors.price && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.price}
                                        </p>
                                    )}
                                </div>

                                {/* Currency Field */}
                                <div>
                                    <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="currency"
                                        name="currency"
                                        value={formData.currency}
                                        onChange={handleInputChange}
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.currency ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                    >
                                        {currencies.map(currency => (
                                            <option key={currency.code} value={currency.code}>
                                                {currency.code} - {currency.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.currency && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.currency}
                                        </p>
                                    )}
                                </div>

                                {/* Quantity Field */}
                                <div>
                                    <label htmlFor="availableQuantity" className="block text-sm font-medium text-gray-700 mb-1">
                                        Available Quantity <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="availableQuantity"
                                        name="availableQuantity"
                                        value={formData.availableQuantity}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="999999"
                                        className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.availableQuantity ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="0"
                                    />
                                    {errors.availableQuantity && (
                                        <p className="mt-1 text-sm text-red-600 flex items-center">
                                            <AlertCircle className="h-4 w-4 mr-1" />
                                            {errors.availableQuantity}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="w-full inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                    {mode === "create" ? "Creating..." : "Saving..."}
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {mode === "create" ? "Create Article" : "Save Changes"}
                                </>
                            )}
                        </button>
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isSubmitting}
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleForm;