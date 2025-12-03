import { useState, useEffect } from "react";
import { X } from "lucide-react";

const CATEGORIES = [
    'Animals', 'Food', 'Travel', 'Technology', 'Business', 'Health', 'Education', 'Sports',
    'Nature', 'Science', 'Art', 'Music', 'History', 'Geography', 'Literature', 'Movies'
];

const DIFFICULTY_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const FlashcardForm = ({ isOpen, onClose, onSubmit, title, mode, initialData }) => {
    const [formData, setFormData] = useState({
        englishWord: '',
        translation: '',
        definition: '',
        example: '',
        category: '',
        difficulty: 'Beginner'
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData({
                englishWord: initialData.englishWord || '',
                translation: initialData.translation || '',
                definition: initialData.definition || '',
                example: initialData.example || '',
                category: initialData.category || '',
                difficulty: initialData.difficulty || 'Beginner'
            });
        } else {
            setFormData({
                englishWord: '',
                translation: '',
                definition: '',
                example: '',
                category: '',
                difficulty: 'Beginner'
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.englishWord?.trim()) {
            newErrors.englishWord = 'English word is required';
        }

        if (!formData.translation?.trim()) {
            newErrors.translation = 'Translation is required';
        }

        if (!formData.category?.trim()) {
            newErrors.category = 'Category is required';
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
            await onSubmit(formData);
        } catch (error) {
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* English Word */}
                    <div>
                        <label htmlFor="englishWord" className="block text-sm font-medium text-gray-700 mb-1">
                            English Word *
                        </label>
                        <input
                            type="text"
                            id="englishWord"
                            name="englishWord"
                            value={formData.englishWord}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.englishWord ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter English word"
                        />
                        {errors.englishWord && (
                            <p className="mt-1 text-sm text-red-600">{errors.englishWord}</p>
                        )}
                    </div>

                    {/* Translation */}
                    <div>
                        <label htmlFor="translation" className="block text-sm font-medium text-gray-700 mb-1">
                            Translation *
                        </label>
                        <input
                            type="text"
                            id="translation"
                            name="translation"
                            value={formData.translation}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.translation ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter translation"
                        />
                        {errors.translation && (
                            <p className="mt-1 text-sm text-red-600">{errors.translation}</p>
                        )}
                    </div>

                    {/* Definition */}
                    <div>
                        <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
                            Definition (optional)
                        </label>
                        <textarea
                            id="definition"
                            name="definition"
                            value={formData.definition}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter definition"
                        />
                    </div>

                    {/* Example */}
                    <div>
                        <label htmlFor="example" className="block text-sm font-medium text-gray-700 mb-1">
                            Example (optional)
                        </label>
                        <textarea
                            id="example"
                            name="example"
                            value={formData.example}
                            onChange={handleChange}
                            rows={3}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter example sentence"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                            Category *
                        </label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select Category</option>
                            {CATEGORIES.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                        )}
                    </div>

                    {/* Difficulty */}
                    <div>
                        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty Level
                        </label>
                        <select
                            id="difficulty"
                            name="difficulty"
                            value={formData.difficulty}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {DIFFICULTY_LEVELS.map(level => (
                                <option key={level} value={level}>{level}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                                </div>
                            ) : (
                                mode === 'create' ? 'Create Flashcard' : 'Update Flashcard'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FlashcardForm;
