import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore.js';
import { axiosInstance } from '../lib/axios.js';
import FlashCard from '../components/FlashCard.jsx';
import FlashcardForm from '../components/FlashcardForm.jsx';
import SearchBar from '../components/SearchBar.jsx';
import { BookOpen, Search, Filter, Plus, Loader, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const FlashCardsPage = () => {
  const { authUser } = useAuthStore();
  
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    englishWord: '',
    translation: '',
    definition: '',
    example: '',
    category: '',
    difficulty: 'Beginner'
  });

  // Завантаження карток
  const fetchCards = async () => {
    try {
      setLoading(true);
      const endpoint = authUser ? 
        API_ENDPOINTS.flashcards.getUserCards(authUser.id) : 
        API_ENDPOINTS.flashcards.getAll();
      
      const response = await axiosInstance.get(endpoint);
      setCards(response.data);
    } catch (error) {
      toast.error('Error loading flashcards');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [authUser]);

  // Пошук карток
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCards();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.flashcards.search(searchTerm)
      );
      setCards(response.data);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Фільтр по категорії
  const handleCategoryFilter = async () => {
    if (!selectedCategory) {
      fetchCards();
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get(
        API_ENDPOINTS.flashcards.getByCategory(selectedCategory)
      );
      setCards(response.data);
    } catch (error) {
      toast.error('Filter failed');
    } finally {
      setLoading(false);
    }
  };

  // Створення/редагування картки
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authUser) {
      toast.error('Please login to create flashcards');
      return;
    }

    try {
      const cardData = {
        ...formData,
        userId: authUser.id
      };

      if (editingCard) {
        await axiosInstance.put(
          API_ENDPOINTS.flashcards.update(editingCard.id), 
          cardData
        );
        toast.success('Flashcard updated');
      } else {
        await axiosInstance.post(
          API_ENDPOINTS.flashcards.create(), 
          cardData
        );
        toast.success('Flashcard created');
      }

      setShowCreateForm(false);
      setEditingCard(null);
      setFormData({
        englishWord: '',
        translation: '',
        definition: '',
        example: '',
        category: '',
        difficulty: 'Beginner'
      });
      fetchCards();
    } catch (error) {
      toast.error('Operation failed');
      console.error('Error:', error);
    }
  };

  // Видалення картки
  const handleDelete = async (cardId) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) return;

    try {
      await axiosInstance.delete(API_ENDPOINTS.flashcards.delete(cardId));
      toast.success('Flashcard deleted');
      fetchCards();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  // Редагування картки
  const handleEdit = (card) => {
    setEditingCard(card);
    setFormData({
      englishWord: card.englishWord,
      translation: card.translation,
      definition: card.definition || '',
      example: card.example || '',
      category: card.category,
      difficulty: card.difficulty || 'Beginner'
    });
    setShowCreateForm(true);
  };

  if (loading && cards.length === 0) {
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
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search flashcards..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {FLASHCARD_CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <button
          onClick={handleCategoryFilter}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map(card => (
          <FlashCardComponent
            key={card.id}
            card={card}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {cards.length === 0 && !loading && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
          <h3 className="text-xl text-gray-600 mb-2">No flashcards found</h3>
          <p className="text-gray-500">Create your first flashcard to start learning!</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="English Word"
                value={formData.englishWord}
                onChange={(e) => setFormData({...formData, englishWord: e.target.value})}
                required
                className="w-full p-3 border rounded-lg"
              />
              
              <input
                type="text"
                placeholder="Translation"
                value={formData.translation}
                onChange={(e) => setFormData({...formData, translation: e.target.value})}
                required
                className="w-full p-3 border rounded-lg"
              />
              
              <textarea
                placeholder="Definition (optional)"
                value={formData.definition}
                onChange={(e) => setFormData({...formData, definition: e.target.value})}
                className="w-full p-3 border rounded-lg h-20"
              />
              
              <textarea
                placeholder="Example (optional)"
                value={formData.example}
                onChange={(e) => setFormData({...formData, example: e.target.value})}
                className="w-full p-3 border rounded-lg h-20"
              />
              
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required
                className="w-full p-3 border rounded-lg"
              >
                <option value="">Select Category</option>
                {FLASHCARD_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCard(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingCard ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCardsPage;
