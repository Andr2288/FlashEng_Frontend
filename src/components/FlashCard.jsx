import { useState } from 'react';
import { Edit, Trash2, Volume2 } from 'lucide-react';

const FlashCard = ({ flashcard, onEdit, onDelete, showActions = false }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleEdit = () => {
        if (onEdit) onEdit(flashcard);
    };

    const handleDelete = () => {
        if (onDelete) onDelete(flashcard.flashcardId);
    };

    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="relative group h-64">
            {/* Card Container */}
            <div
                className="relative w-full h-full cursor-pointer"
                onClick={handleCardClick}
                style={{
                    perspective: '1000px'
                }}
            >
                {/* Card Inner */}
                <div
                    className="relative w-full h-full transition-transform duration-600 ease-in-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                    }}
                >
                    {/* Front Face */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-xl shadow-lg"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden'
                        }}
                    >
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl h-full p-6 flex flex-col justify-center items-center text-center hover:shadow-xl transition-shadow duration-300">
                            {/* Category Badge */}
                            <div className="mb-4">
                <span className="inline-block px-4 py-2 bg-blue-500 text-white text-sm font-semibold rounded-full shadow-sm">
                  {flashcard.category}
                </span>
                            </div>

                            {/* English Word */}
                            <h3 className="text-3xl font-bold text-gray-800 mb-3 break-words">
                                {flashcard.englishWord}
                            </h3>

                            {/* Pronunciation */}
                            {flashcard.pronunciation && (
                                <div className="flex items-center justify-center text-gray-600 mb-4">
                                    <Volume2 size={18} className="mr-2 text-blue-500" />
                                    <span className="text-sm font-medium italic">
                    {flashcard.pronunciation}
                  </span>
                                </div>
                            )}

                            {/* Difficulty & Instruction */}
                            <div className="mt-auto text-center">
                                {flashcard.difficulty && (
                                    <div className="mb-2">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        flashcard.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                            flashcard.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                    }`}>
                      {flashcard.difficulty}
                    </span>
                                    </div>
                                )}
                                <p className="text-gray-500 text-sm font-medium">
                                    🔄 Click to see translation
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Back Face */}
                    <div
                        className="absolute inset-0 w-full h-full rounded-xl shadow-lg"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl h-full p-6 flex flex-col justify-center text-center hover:shadow-xl transition-shadow duration-300">
                            {/* Translation */}
                            <h3 className="text-2xl font-bold text-green-800 mb-4 break-words">
                                {flashcard.translation}
                            </h3>

                            {/* Definition */}
                            {flashcard.definition && (
                                <div className="mb-4 flex-grow flex items-center">
                                    <p className="text-gray-700 text-sm leading-relaxed italic">
                                        "{flashcard.definition}"
                                    </p>
                                </div>
                            )}

                            {/* Example Sentence */}
                            {flashcard.exampleSentence && (
                                <div className="mb-4">
                                    <div className="bg-white/70 rounded-lg p-3 border border-green-200">
                                        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                                            Example:
                                        </p>
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {flashcard.exampleSentence}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Back Instruction */}
                            <div className="mt-auto">
                                <p className="text-gray-500 text-sm font-medium">
                                    🔄 Click to flip back
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            {showActions && (onEdit || onDelete) && (
                <div
                    className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:scale-100 scale-95"
                    style={{ zIndex: 10 }}
                >
                    {onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            title="Edit Flashcard"
                            type="button"
                        >
                            <Edit size={16} />
                        </button>
                    )}
                    {onDelete && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                            title="Delete Flashcard"
                            type="button"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>
            )}

            {/* Price Badge (if applicable) */}
            {flashcard.price && flashcard.isPublic && (
                <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full shadow-md">
            ${flashcard.price}
          </span>
                </div>
            )}
        </div>
    );
};

export default FlashCard;