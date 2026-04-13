import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context';

export const AvatarWidget: React.FC = () => {
  const { audioData, setCursorState } = useAppContext();

  let scale = 1;
  if (audioData && audioData.length > 0) {
    const midFreq = audioData[10] || 0;
    scale = 1 + (midFreq / 255) * 0.05;
  }

  return (
    <div
      className="flex flex-col items-center gap-6"
      onMouseEnter={() => setCursorState('avatar')}
      onMouseLeave={() => setCursorState('default')}
      style={{ userSelect: 'none' }}
    >
      <motion.div
        className="relative w-32 h-32 sm:w-48 sm:h-48"
        animate={{ scale }}
        transition={{ type: 'spring', bounce: 0 }}
        style={{ userSelect: 'none' }}
        onDragStart={(e) => { (e as any).preventDefault?.(); }}
      >
        <motion.div
          className="absolute inset-0 overflow-hidden border-4 border-[var(--bg-color)]"
          animate={{
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "40% 60% 70% 30% / 40% 50% 60% 50%"
            ]
          }}
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
          style={{ background: 'var(--highlight-color)', userSelect: 'none' }}
        >
          <img
            src="./photo_2025-12-17_22-00-21.jpg"
            alt="Norius Avatar"
            className="w-full h-full object-cover mix-blend-luminosity opacity-80"
            draggable={false}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://picsum.photos/seed/norius/400/400";
            }}
          />
        </motion.div>
      </motion.div>

      <motion.h1
        className="text-4xl sm:text-6xl font-black tracking-tighter select-none"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        Norius
      </motion.h1>
    </div>
  );
};
