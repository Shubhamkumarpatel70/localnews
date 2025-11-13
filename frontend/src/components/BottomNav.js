import React, { useState } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PeopleIcon from '@mui/icons-material/People';
import '../styles/BottomNav.css';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, key: 'home' },
  { label: 'Trending', icon: <WhatshotIcon />, key: 'trending' },
  { label: 'Community', icon: <PeopleIcon />, key: 'community' },
  { label: 'Create', icon: <AddCircleIcon />, key: 'create' },
  { label: 'Notifications', icon: <NotificationsIcon />, key: 'notifications' },
  { label: 'Account', icon: <AccountCircleIcon />, key: 'account' },
];

export default function BottomNav({ current, onChange }) {
  const [tooltip, setTooltip] = useState(null); // key of nav item with tooltip
  const showTooltip = (key) => {
    setTooltip(key);
    setTimeout(() => setTooltip(null), 2200);
  };
  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.key}
          className={current === item.key ? 'active' : ''}
          onClick={() => { onChange(item.key); showTooltip(item.key); }}
          onMouseEnter={() => showTooltip(item.key)}
          onMouseLeave={() => setTooltip(null)}
        >
          {item.icon}
          <span className="nav-label">{item.label}</span>
          {/* Tooltip for small screens or on hover/tap */}
          {tooltip === item.key && (
            <span className="nav-tooltip">{item.label}</span>
          )}
        </button>
      ))}
    </nav>
  );
} 