import React from "react";
import Modal from "@mui/material/Modal";
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
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { useAuth } from "../context/AuthContext";

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
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Account</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {isAuthenticated && user && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <img
                  src={
                    user.avatar ||
                    "https://randomuser.me/api/portraits/men/99.jpg"
                  }
                  alt={user.username}
                  className="w-12 h-12 rounded-full object-cover border-2 border-indigo-200"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{user.username}</div>
                  <div className="text-sm text-gray-600 truncate">{user.email}</div>
                </div>
              </div>
            )}
          </div>

          <ul className="p-4 space-y-2">
            {options.map((opt) => (
              <li
                key={opt.key}
                className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selected === opt.key
                    ? "bg-indigo-100 text-indigo-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-100"
                } ${opt.key === "logout" ? "text-red-600 hover:bg-red-50" : ""}`}
                onClick={() => handleSelect(opt.key)}
              >
                <span className="text-2xl">{opt.icon}</span>
                <span>{opt.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
