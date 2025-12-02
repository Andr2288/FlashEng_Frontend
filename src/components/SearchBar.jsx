import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ onSearch, placeholder = "Search products..." }) => {
    const [searchValue, setSearchValue] = useState("");

    // Debounce search to avoid too many API calls
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(searchValue);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchValue, onSearch]);

    const handleClear = () => {
        setSearchValue("");
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            
            <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={placeholder}
            />
            
            {searchValue && (
                <button
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-700"
                >
                    <X className="h-5 w-5 text-gray-400" />
                </button>
            )}
        </div>
    );
};

export default SearchBar;
