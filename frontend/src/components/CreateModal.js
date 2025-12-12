import React from 'react';
import Modal from '@mui/material/Modal';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PostAddIcon from '@mui/icons-material/PostAdd';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import CloseIcon from '@mui/icons-material/Close';

export default function CreateModal({ open, onClose, onOption }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-md w-full mx-4 z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <CloseIcon />
            </button>
          </div>
          <div className="space-y-3">
            <button
              onClick={() => onOption('video')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-500 rounded-xl font-semibold text-gray-700 hover:text-indigo-700 transition-all duration-200"
            >
              <VideoLibraryIcon className="text-3xl" />
              <span>Upload Video</span>
            </button>
            <button
              onClick={() => onOption('post')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-indigo-50 border-2 border-gray-200 hover:border-indigo-500 rounded-xl font-semibold text-gray-700 hover:text-indigo-700 transition-all duration-200"
            >
              <PostAddIcon className="text-3xl" />
              <span>Post</span>
            </button>
            <button
              onClick={() => onOption('live')}
              className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-red-50 border-2 border-gray-200 hover:border-red-500 rounded-xl font-semibold text-gray-700 hover:text-red-700 transition-all duration-200"
            >
              <LiveTvIcon className="text-3xl" />
              <span>Go Live</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
