import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EditIcon from '@mui/icons-material/Edit';
import './CreatePostModal.css';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
  minWidth: 280,
  outline: 'none',
};

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
      <Box sx={style} className="create-post-modal">
        <h2 style={{marginBottom: 20}}>
          {isEdit ? <EditIcon style={{marginRight: 8}} /> : <AddCircleIcon style={{marginRight: 8}} />}
          {isEdit ? 'Edit Post' : 'Create Post'}
        </h2>
        <form onSubmit={handleSubmit}>
          <textarea
            className="create-post-textarea"
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            maxLength={500}
            required
          />
          <div className="create-post-actions">
            <button type="button" onClick={onClose} className="create-post-cancel">Cancel</button>
            <button type="submit" className="create-post-submit">{isEdit ? 'Save' : 'Post'}</button>
          </div>
        </form>
      </Box>
    </Modal>
  );
} 