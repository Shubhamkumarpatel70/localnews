import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateIcon from '@mui/icons-material/Create';

export default function Create() {
  const navigate = useNavigate();
  
  return (
    <div className="pt-14 pb-20 min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <CreateIcon className="text-6xl text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create News</h1>
        <p className="text-gray-600 mb-6">Upload or write your news here.</p>
        <div className="space-y-3">
          <button
            onClick={() => navigate('/create/post')}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
          >
            Create Post
          </button>
          <button
            onClick={() => navigate('/upload-video')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition-colors"
          >
            Upload Video
          </button>
        </div>
      </div>
    </div>
  );
}
