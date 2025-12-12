import React, { useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { get } from '../utils/api';

export default function Navbar({ onProfileClick }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef();

  const handleChange = e => {
    const value = e.target.value;
    setQuery(value);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (value.length > 1) {
      timeoutRef.current = setTimeout(() => {
        get(`/api/news?search=${encodeURIComponent(value)}`)
          .then(news => setSuggestions(news.slice(0, 5)))
          .catch(() => setSuggestions([]));
        setShowDropdown(true);
      }, 250);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = news => {
    alert(`Go to news: ${news.title}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="h-14 flex items-center justify-between px-4">
        <div className="text-xl font-bold text-gray-900">Local News</div>
        <div className="flex-1 max-w-2xl mx-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search news..."
              value={query}
              onChange={handleChange}
              onFocus={() => query.length > 1 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {suggestions.map(s => (
                  <li 
                    key={s._id} 
                    onClick={() => handleSelect(s)}
                    className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 hover:text-indigo-900"
                  >
                    {s.title}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex items-center">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 transition-colors" 
            onClick={onProfileClick} 
            title="Account"
          >
            <AccountCircleIcon className="text-gray-700" fontSize="large" />
          </button>
        </div>
      </div>
    </header>
  );
}
