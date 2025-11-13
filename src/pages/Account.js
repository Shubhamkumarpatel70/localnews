import React, { useState, useEffect } from 'react';
import AccountMenu from '../components/AccountMenu';
import './Account.css';

const sections = {
  profile: 'Profile Section (edit your info here)',
  mynews: 'My News Section (your uploaded news)',
  mycomments: 'My Comments Section (your comments)',
  saved: 'My Saved Section (your saved videos, posts etc.)',
  settings: 'Settings Section (preferences, etc.)',
};

export default function Account() {
  const [open, setOpen] = useState(true);
  const [section, setSection] = useState('profile');

  // Listen for global event to open the drawer
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('openAccountMenu', handler);
    return () => window.removeEventListener('openAccountMenu', handler);
  }, []);

  const handleSelect = (key) => {
    setSection(key);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div className="account-page">
      <AccountMenu open={open} onClose={handleClose} onSelect={handleSelect} selected={section} />
      <div className="account-section">
        <h2>{sections[section] ? section.replace(/([a-z])([A-Z])/g, '$1 $2') : ''}</h2>
        <div className="account-section-content">
          {sections[section] || 'Select an option.'}
        </div>
      </div>
    </div>
  );
} 