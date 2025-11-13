import React from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PostAddIcon from '@mui/icons-material/PostAdd';
import LiveTvIcon from '@mui/icons-material/LiveTv';
import './CreateModal.css';

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

export default function CreateModal({ open, onClose, onOption }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style} className="create-modal">
        <h2 style={{marginBottom: 20}}>Create</h2>
        <div className="create-options">
          <button onClick={() => onOption('video')}><VideoLibraryIcon fontSize="large" /><span>Upload Video</span></button>
          <button onClick={() => onOption('post')}><PostAddIcon fontSize="large" /><span>Post</span></button>
          <button onClick={() => onOption('live')}><LiveTvIcon fontSize="large" /><span>Go Live</span></button>
        </div>
      </Box>
    </Modal>
  );
} 