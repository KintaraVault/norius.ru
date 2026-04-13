import React from 'react';
import { motion } from 'motion/react';

export const MorphIcon: React.FC<{ isPlaying: boolean; onClick: () => void }> = ({ isPlaying, onClick }) => {
  const playPath1 = "M 12 10 L 20 15 L 20 25 L 12 30 Z";
  const playPath2 = "M 20 15 L 28 20 L 28 20 L 20 25 Z";

  const pausePath1 = "M 10 10 L 16 10 L 16 30 L 10 30 Z";
  const pausePath2 = "M 24 10 L 30 10 L 30 30 L 24 30 Z";

  return (
    <motion.button
      onClick={onClick}
      className="relative w-16 h-16 flex items-center justify-center outline-none"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      style={{
        background: 'var(--highlight-color)',
        borderRadius: '24px',
      }}
      animate={{
        borderRadius: isPlaying ? ["24px", "16px", "24px"] : ["24px", "32px", "24px"],
      }}
      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="var(--primary-color)">
        <motion.path
          animate={{ d: isPlaying ? pausePath1 : playPath1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
        <motion.path
          animate={{ d: isPlaying ? pausePath2 : playPath2 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        />
      </svg>
    </motion.button>
  );
};
