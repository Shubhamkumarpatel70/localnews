import React from "react";
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import PersonIcon from "@mui/icons-material/Person";
import ArticleIcon from "@mui/icons-material/Article";
import CommentIcon from "@mui/icons-material/Comment";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import PeopleIcon from "@mui/icons-material/People";
import CloseIcon from "@mui/icons-material/Close";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "../context/AuthContext";
import "./AccountMenu.css";

const authenticatedOptions = [
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
  { key: "mynews", label: "My News", icon: <ArticleIcon /> },
  { key: "mycomments", label: "My Comments", icon: <CommentIcon /> },
  { key: "community-posts", label: "My Community Posts", icon: <PeopleIcon /> },
  { key: "saved", label: "My Saved", icon: <BookmarkIcon /> },
  { key: "settings", label: "Settings", icon: <SettingsIcon /> },
  { key: "logout", label: "Logout", icon: <LogoutIcon /> },
];

const unauthenticatedOptions = [
  { key: "login", label: "Login", icon: <LoginIcon /> },
  { key: "register", label: "Register", icon: <PersonAddIcon /> },
];

export default function AccountMenu({ open, onClose, onSelect, selected }) {
  const { isAuthenticated, user, logout } = useAuth();

  const handleSelect = (key) => {
    if (key === "logout") {
      logout();
      onClose();
      return;
    }
    onSelect(key);
    onClose();
  };

  const options = isAuthenticated
    ? authenticatedOptions
    : unauthenticatedOptions;

  return (
    <Modal open={open} onClose={onClose}>
      <Box className="account-menu-modal drawer-right">
        <button className="account-menu-close" onClick={onClose} title="Close">
          <CloseIcon />
        </button>
        <h2 className="account-menu-title">Account</h2>

        {isAuthenticated && user && (
          <div className="account-menu-user-info">
            <div className="account-menu-avatar">
              <img
                src={
                  user.avatar ||
                  "https://randomuser.me/api/portraits/men/99.jpg"
                }
                alt={user.username}
                style={{ width: "40px", height: "40px", borderRadius: "50%" }}
              />
            </div>
            <div className="account-menu-user-details">
              <div className="account-menu-username">{user.username}</div>
              <div className="account-menu-email">{user.email}</div>
            </div>
          </div>
        )}

        <ul className="account-menu-list">
          {options.map((opt) => (
            <li
              key={opt.key}
              className={`account-menu-item${
                selected === opt.key ? " selected" : ""
              }`}
              onClick={() => handleSelect(opt.key)}
            >
              <span className="account-menu-icon">{opt.icon}</span>
              <span>{opt.label}</span>
            </li>
          ))}
        </ul>
      </Box>
    </Modal>
  );
}
