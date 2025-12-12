import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, key: 'home' },
  { label: 'Trending', icon: <WhatshotIcon />, key: 'trending' },
  { label: 'Community', icon: <PeopleIcon />, key: 'community' },
  { label: 'Create', icon: <AddCircleIcon />, key: 'create' },
  { label: 'Notifications', icon: <NotificationsIcon />, key: 'notifications' },
  { label: 'Account', icon: <AccountCircleIcon />, key: 'account' },
];

export default function BottomNav({ current, onChange }) {
  const [tooltip, setTooltip] = useState(null);
  const showTooltip = (key) => {
    setTooltip(key);
    setTimeout(() => setTooltip(null), 2200);
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-200 flex justify-around items-center z-50 shadow-lg">
      {navItems.map(item => (
        <button
          key={item.key}
          className={`flex flex-col items-center justify-center flex-1 h-full transition-colors relative ${
            current === item.key 
              ? 'text-red-600' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
          onClick={() => { onChange(item.key); showTooltip(item.key); }}
          onMouseEnter={() => showTooltip(item.key)}
          onMouseLeave={() => setTooltip(null)}
        >
          {item.icon}
          <span className="text-xs mt-1 hidden md:block">{item.label}</span>
          {tooltip === item.key && (
            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-95 shadow-lg">
              {item.label}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}
