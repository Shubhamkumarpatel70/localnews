import React, { useState, useRef } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { get } from '../utils/api';
import './Navbar.css';

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
    // TODO: navigate to news detail page
    alert(`Go to news: ${news.title}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <header className="navbar">
      <div className="navbar-left">Local News</div>
      <div className="navbar-center">
        <div className="search-bar">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Search news..."
            value={query}
            onChange={handleChange}
            onFocus={() => query.length > 1 && setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          />
          {showDropdown && suggestions.length > 0 && (
            <ul className="suggestions">
              {suggestions.map(s => (
                <li key={s._id} onClick={() => handleSelect(s)}>{s.title}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="navbar-right">
        <button className="profile-btn" onClick={onProfileClick} title="Account">
          <AccountCircleIcon fontSize="large" />
        </button>
      </div>
    </header>
  );
} 