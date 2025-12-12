import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

export default function CreatePostModal({ open, onClose, onCreate, initialContent = '', isEdit = false }) {
  const [content, setContent] = useState(initialContent);
  
  useEffect(() => {
    setContent(initialContent);
  }, [initialContent, open]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      onCreate(content.trim());
      setContent('');
    }
  };
  
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 min-w-[400px] max-w-lg w-full mx-4 z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {isEdit ? <EditIcon className="text-indigo-600" /> : <AddCircleIcon className="text-indigo-600" />}
              <h2 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Post' : 'Create Post'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all resize-none"
              placeholder="What's on your mind?"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              maxLength={500}
              required
            />
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{content.length}/500</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
                >
                  {isEdit ? 'Save' : 'Post'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
