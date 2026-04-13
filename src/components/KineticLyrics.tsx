import React from 'react';
import { motion } from 'motion/react';
import { useAppContext, parseLRC } from '../context';

export const KineticLyrics: React.FC = () => {
  const { currentSong, currentTime, audioData, isOverdrive } = useAppContext();

  const lyrics = parseLRC(currentSong.lyrics);
  
  const currentLyricIndex = lyrics.findIndex((l, i) => {
    const nextLyric = lyrics[i + 1];
    return currentTime >= l.time && (!nextLyric || currentTime < nextLyric.time);
  });
  
  const currentLyric = lyrics[currentLyricIndex]?.text || "";

  let bassScale = 1;
  let blurAmount = 20;
  if (audioData && audioData.length > 0) {
    const bass = (audioData[0] + audioData[1] + audioData[2]) / 3;
    bassScale = 1 + (bass / 255) * (isOverdrive ? 0.5 : 0.2);
    blurAmount = 20 - (bass / 255) * 15;
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
      <motion.div
        key={currentLyric}
        initial={{ opacity: 0, scale: 0.8, filter: 'blur(40px)' }}
        animate={{ 
          opacity: isOverdrive ? 0.3 : 0.15, 
          scale: bassScale, 
          filter: `blur(${blurAmount}px)` 
        }}
        exit={{ opacity: 0, scale: 1.2, filter: 'blur(40px)' }}
        transition={{ 
          opacity: { duration: 0.8 },
          scale: { type: 'spring', bounce: 0.5 },
          filter: { duration: 0.1 }
        }}
        className="text-[15vw] font-black text-center leading-none whitespace-nowrap"
        style={{ 
          color: isOverdrive ? '#ff0055' : 'var(--primary-color)',
          textShadow: isOverdrive ? '0 0 50px #ff0055' : 'none'
        }}
      >
        {currentLyric}
      </motion.div>
    </div>
  );
};
