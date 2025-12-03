import { useState } from 'react';
import { useCartStore } from '../store/useCartStore.js';
import { BookOpen, Edit, Trash2, RotateCcw, Plus, Minus } from 'lucide-react';

const FlashCard = ({ flashcard, onEdit, onDelete, mode = 'view' }) => {
  const [flipped, setFlipped] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [practiceCount, setPracticeCount] = useState(1);

  const { addToCart, isAddingToCart } = useCartStore();

  const handleFlip = () => {
    if (mode === 'train') {
      setFlipped(!flipped);
    }
  };

  const handleAddToCart = async () => {
    if (practiceCount <= 0) return;
    await addToCart(flashcard.id, practiceCount);
    setPracticeCount(1);
  };

  const incrementCount = () => setPracticeCount(prev => prev + 1);
  const decrementCount = () => {
    if (practiceCount > 1) setPracticeCount(prev => prev - 1);
  };

  if (mode === 'train') {
    return (
      <div className="flashcard-container perspective-1000">
        <div 
          className={`flashcard ${flipped ? 'flipped' : ''}`}
          onClick={handleFlip}
        >
          <div className="flashcard-front">
            <div className="text-center">
              <BookOpen className="mx-auto mb-4 text-blue-500" size={48} />
              <h3 className="text-2xl font-bold">{flashcard.englishWord}</h3>
              <p className="text-gray-600 mt-2">Category: {flashcard.category}</p>
              <p className="text-sm text-gray-500 mt-4">Click to see translation</p>
            </div>
          </div>
          
          <div className="flashcard-back">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">{flashcard.translation}</h3>
              {flashcard.definition && (
                <p className="text-gray-700 mt-4">{flashcard.definition}</p>
              )}
              {flashcard.example && (
                <div className="mt-4 p-3 bg-gray-100 rounded">
                  <p className="italic">"{flashcard.example}"</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between h-full relative"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100">
        <div className="h-48 w-full flex items-center justify-center">
          <BookOpen className="text-blue-500" size={64} />
        </div>
      </div>

      <div className="p-4 flex flex-col justify-between flex-1">
        {showActions && (
          <div className="absolute top-2 right-2 flex space-x-2 bg-white rounded-lg shadow-lg p-1">
            {onEdit && (
              <button
                onClick={() => onEdit(flashcard)}
                className="p-2 text-blue-600 hover:bg-blue-100 rounded"
              >
                <Edit size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(flashcard.id)}
                className="p-2 text-red-600 hover:bg-red-100 rounded"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}

        <div>
          <div className="flex items-start justify-between mb-3">
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
              {flashcard.category}
            </span>
            {flashcard.difficulty && (
              <span className="text-sm text-gray-500">{flashcard.difficulty}</span>
            )}
          </div>

          <h2 className="text-lg font-semibold text-gray-900 mb-1">{flashcard.englishWord}</h2>
          <p className="text-green-600 font-medium mb-2">{flashcard.translation}</p>
          
          {flashcard.definition && (
            <p className="text-gray-700 text-sm mb-3">{flashcard.definition}</p>
          )}
          
          {flashcard.example && (
            <div className="bg-gray-50 p-3 rounded text-sm mb-3">
              <p className="italic">"{flashcard.example}"</p>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={decrementCount}
                disabled={practiceCount <= 1}
                className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center font-medium">{practiceCount}</span>
              <button
                onClick={incrementCount}
                className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
              >
                <Plus size={16} />
              </button>
            </div>
            <span className="text-sm text-gray-500">
              Practice times
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAddingToCart}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isAddingToCart ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Adding...
              </div>
            ) : (
              <>
                <RotateCcw size={16} className="mr-2" />
                Add to Practice
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Created: {new Date(flashcard.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
