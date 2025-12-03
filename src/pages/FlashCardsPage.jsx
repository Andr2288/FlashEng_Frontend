import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { axiosInstance } from '../lib/axios.js';
import FlashCard from '../components/FlashCard.jsx';
import FlashcardForm from '../components/FlashcardForm.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { BookOpen, Search, Filter, Plus, Loader, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const FLASHCARD_CATEGORIES = [
    'Animals', 'Food', 'Travel', 'Technology', 'Business', 'Health',
    'Education', 'Sports', 'Nature', 'Science', 'Art', 'Music'
];

const FlashCardsPage = () => {
    const { authUser } = useAuthStore();

    const [allCards, setAllCards] = useState([]); // ВСІ картки з серверу
    const [filteredCards, setFilteredCards] = useState([]); // Відфільтровані картки для показу
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingCard, setEditingCard] = useState(null);

    // ЗАВАНТАЖУЄМО ВСІ КАРТКИ ОДИН РАЗ
    const fetchAllCards = useCallback(async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/flashcards');
            setAllCards(response.data);
            setFilteredCards(response.data); // Показуємо всі спочатку
        } catch (error) {
            toast.error('Error loading flashcards');
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Завантажуємо картки один раз при завантаженні компонента
    useEffect(() => {
        fetchAllCards();
    }, [fetchAllCards]);

    // ФІЛЬТРАЦІЯ НА КЛІЄНТІ (без запитів до сервера)
    useEffect(() => {
        let filtered = [...allCards];

        // Фільтр по категорії
        if (selectedCategory) {
            filtered = filtered.filter(card =>
                card.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        // Пошук по словах
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filtered = filtered.filter(card =>
                card.englishWord.toLowerCase().includes(search) ||
                card.translation.toLowerCase().includes(search) ||
                (card.definition && card.definition.toLowerCase().includes(search)) ||
                (card.exampleSentence && card.exampleSentence.toLowerCase().includes(search))
            );
        }

        setFilteredCards(filtered);
    }, [allCards, searchTerm, selectedCategory]);

    // Пошук карток
    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
    };

    // Фільтр по категорії
    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
    };

    // Створення/редагування картки
    const handleSubmit = async (formData) => {
        if (!authUser) {
            toast.error('Please login to create flashcards');
            return;
        }

        try {
            const cardData = {
                userId: authUser.id,
                englishWord: formData.englishWord,
                translation: formData.translation,
                definition: formData.definition || null,
                exampleSentence: formData.example || null,
                category: formData.category,
                difficulty: formData.difficulty || 'Beginner',
                isPublic: false,
                price: null
            };

            if (editingCard) {
                // Оновлення картки
                await axiosInstance.put(`/flashcards/${editingCard.flashcardId}`, cardData);
                toast.success('Flashcard updated');
            } else {
                // Створення нової картки
                await axiosInstance.post('/flashcards', cardData);
                toast.success('Flashcard created');
            }

            // Закриваємо форму і перезавантажуємо картки
            setShowCreateForm(false);
            setEditingCard(null);
            fetchAllCards();
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Operation failed';
            toast.error(errorMsg);
            console.error('Error:', error.response?.data || error);
        }
    };

    // Видалення картки
    const handleDelete = async (cardId) => {
        if (!confirm('Are you sure you want to delete this flashcard?')) return;

        try {
            await axiosInstance.delete(`/flashcards/${cardId}`);
            toast.success('Flashcard deleted');
            fetchAllCards();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    // Редагування картки
    const handleEdit = (card) => {
        setEditingCard(card);
        setShowCreateForm(true);
    };

    // Очистити фільтри
    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
    };

    // Показуємо індикатор завантаження тільки при початковому завантаженні
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="size-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading flashcards...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold">FlashEng Cards</h1>
                            <p className="text-gray-600">Learn English with flashcards</p>
                        </div>
                    </div>

                    {authUser && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <Plus className="mr-2" size={20} />
                            Add Card
                        </button>
                    )}
                </div>
            </div>

            {/* Search & Filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <SearchBar
                            onSearch={handleSearch}
                            placeholder="Search flashcards..."
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Categories</option>
                        {FLASHCARD_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    {/* Clear filters button */}
                    {(searchTerm || selectedCategory) && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 border rounded-lg"
                        >
                            <RotateCcw size={18} className="mr-1" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Results info */}
                <div className="text-sm text-gray-600">
                    {searchTerm || selectedCategory ? (
                        <>
                            Showing {filteredCards.length} of {allCards.length} cards
                            {searchTerm && <span> matching "{searchTerm}"</span>}
                            {selectedCategory && <span> in {selectedCategory}</span>}
                        </>
                    ) : (
                        <span>Showing all {allCards.length} cards</span>
                    )}
                </div>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredCards.map(card => (
                    <FlashCard
                        key={card.flashcardId}
                        flashcard={card}
                        onEdit={authUser ? handleEdit : undefined}
                        onDelete={authUser ? handleDelete : undefined}
                        showActions={authUser}
                    />
                ))}
            </div>

            {/* Empty state */}
            {filteredCards.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
                    <h3 className="text-xl text-gray-600 mb-2">
                        {searchTerm || selectedCategory ? 'No flashcards found' : 'No flashcards available'}
                    </h3>
                    <p className="text-gray-500">
                        {searchTerm || selectedCategory ?
                            'Try adjusting your search or filters' :
                            'Create your first flashcard to start learning!'
                        }
                    </p>
                    {authUser && !searchTerm && !selectedCategory && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Create Flashcard
                        </button>
                    )}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateForm && (
                <FlashcardForm
                    isOpen={showCreateForm}
                    onClose={() => {
                        setShowCreateForm(false);
                        setEditingCard(null);
                    }}
                    onSubmit={handleSubmit}
                    title={editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
                    mode={editingCard ? 'edit' : 'create'}
                    initialData={editingCard ? {
                        englishWord: editingCard.englishWord,
                        translation: editingCard.translation,
                        definition: editingCard.definition || '',
                        example: editingCard.exampleSentence || '',
                        category: editingCard.category,
                        difficulty: editingCard.difficulty
                    } : undefined}
                />
            )}
        </div>
    );
};

export default FlashCardsPage;