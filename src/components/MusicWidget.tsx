import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useAppContext, PLAYLIST, parseLRC } from '../context';
import { MorphIcon } from './MorphIcon';
import { ListMusic, X } from 'lucide-react';

export const MusicWidget: React.FC = () => {
  const { isPlaying, togglePlay, currentTime, audioData, currentSong, playSong, bassLevel, setCursorState } = useAppContext();
  const [showPlaylist, setShowPlaylist] = useState(false);

  const lyrics = parseLRC(currentSong.lyrics);
  const currentLyricIndex = lyrics.findIndex((l, i) => {
    const nextLyric = lyrics[i + 1];
    return currentTime >= l.time && (!nextLyric || currentTime < nextLyric.time);
  });
  const currentLyric = lyrics[currentLyricIndex]?.text || "...";

  let iconScale = 1;
  if (audioData && audioData.length > 0) {
    const bass = (audioData[0] + audioData[1] + audioData[2]) / 3;
    iconScale = 1 + (bass / 255) * 0.15;
  }

  return (
    <motion.div 
      layout
      transition={{ layout: { type: "spring", bounce: 0.15, duration: 0.5 } }}
      className="flex flex-col gap-6 w-80 relative"
      onMouseEnter={() => setCursorState('music')}
      onMouseLeave={() => setCursorState('default')}
    >
      <motion.div layout className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <motion.div animate={{ scale: iconScale }} transition={{ type: 'spring', bounce: 0 }}>
            <MorphIcon isPlaying={isPlaying} onClick={togglePlay} />
          </motion.div>
          
          <div className="flex flex-col">
            <motion.span 
              className="text-xl font-black tracking-tight"
              animate={{ color: isPlaying ? 'var(--primary-color)' : 'var(--text-color)' }}
            >
              {currentSong.title}
            </motion.span>
            <span className="text-sm opacity-60 font-bold">{currentSong.artist}</span>
          </div>
        </div>

        <motion.button
          onClick={() => setShowPlaylist(!showPlaylist)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full bg-[var(--highlight-color)] text-[var(--primary-color)]"
        >
          {showPlaylist ? <X size={20} /> : <ListMusic size={20} />}
        </motion.button>
      </motion.div>

      <motion.div
        layout
        initial={false}
        animate={{ height: showPlaylist ? 'auto' : 0, opacity: showPlaylist ? 1 : 0 }}
        style={{ overflow: 'hidden' }}
        transition={{ height: { type: "spring", bounce: 0.15, duration: 0.5 }, opacity: { duration: 0.2 } }}
      >
        <div className="flex flex-col gap-2 pb-2 max-h-32 overflow-y-auto playlist-scroll">
          {PLAYLIST.map(song => {
            const isCurrent = currentSong.id === song.id;
            return (
              <motion.div
                key={song.id}
                onClick={() => { playSong(song); setShowPlaylist(false); }}
                whileHover={{ x: 10 }}
                className="p-3 rounded-xl cursor-none flex justify-between items-center flex-shrink-0"
                style={{
                  backgroundColor: isCurrent ? 'var(--highlight-color)' : 'var(--bg-color)',
                  color: isCurrent ? 'var(--primary-color)' : 'var(--text-color)',
                }}
              >
                <span className="font-bold">{song.title}</span>
                <span className="text-xs opacity-50">{song.artist}</span>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        layout
        className="relative overflow-hidden rounded-xl border border-[var(--highlight-color)] flex items-center justify-center"
        style={{ height: 96 }}
        animate={isPlaying ? {
          borderRadius: [
            "40% 60% 70% 30% / 40% 50% 60% 50%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "40% 60% 70% 30% / 40% 50% 60% 50%",
          ],
        } : {}}
        transition={{ repeat: isPlaying ? Infinity : 0, duration: 8, ease: "easeInOut" }}
      >
        <motion.div
          className="absolute inset-2 rounded-xl"
          style={{ background: 'var(--accent-color)' }}
          animate={isPlaying ? {
            borderRadius: [
              "40% 60% 70% 30% / 40% 50% 60% 50%",
              "60% 40% 30% 70% / 60% 30% 70% 40%",
              "40% 60% 70% 30% / 40% 50% 60% 50%",
            ],
            scale: 1 + bassLevel * 0.05,
          } : { scale: 1 }}
          transition={{ repeat: isPlaying ? Infinity : 0, duration: 8, ease: "easeInOut" }}
        />
        <motion.div
          key={currentLyric}
          initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
          transition={{ duration: 0.4, type: 'spring' }}
          className="relative text-center font-black text-lg px-6"
          style={{ color: 'var(--primary-color)' }}
        >
          {currentLyric}
        </motion.div>
      </motion.div>

      <motion.div layout className="flex items-end justify-between h-12 gap-1">
        {Array.from({ length: 20 }).map((_, i) => {
          const val = audioData[i * 4] || 0;
          const height = Math.max(4, (val / 255) * 48);
          return (
            <motion.div
              key={i}
              className="w-full rounded-t-md"
              style={{ background: 'var(--primary-color)' }}
              animate={{ height }}
              transition={{ type: 'spring', bounce: 0, duration: 0.1 }}
            />
          );
        })}
      </motion.div>
    </motion.div>
  );
};
