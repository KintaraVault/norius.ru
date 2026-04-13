import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useAppContext } from './context';
import { BackgroundCanvas } from './components/BackgroundCanvas';
import { DraggableWidget } from './components/DraggableWidget';
import { AvatarWidget } from './components/AvatarWidget';
import { MusicWidget } from './components/MusicWidget';
import { GamingWidget } from './components/GamingWidget';
import { ThemeToggleWidget } from './components/ThemeToggleWidget';
import { SocialWidget } from './components/SocialWidget';
import { CustomCursor } from './components/CustomCursor';
import { motion, AnimatePresence } from 'motion/react';
import { soundEngine } from './lib/sound';

const Portfolio = () => {
  const [entered, setEntered] = useState(false);
  const { setOverdrive, isOverdrive, shake, setIsIdle } = useAppContext();
  const [lastMouse, setLastMouse] = useState({ x: 0, y: 0, time: Date.now() });
  const [clickCount, setClickCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetIdle = () => {
      setIsIdle(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsIdle(true), 4000);
    };

    window.addEventListener('mousemove', resetIdle);
    window.addEventListener('mousedown', resetIdle);
    window.addEventListener('touchstart', resetIdle);
    window.addEventListener('keydown', resetIdle);
    resetIdle();

    return () => {
      window.removeEventListener('mousemove', resetIdle);
      window.removeEventListener('mousedown', resetIdle);
      window.removeEventListener('touchstart', resetIdle);
      window.removeEventListener('keydown', resetIdle);
      clearTimeout(timeout);
    };
  }, [setIsIdle]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      const dt = now - lastMouse.time;
      if (dt > 50) {
        const dx = e.clientX - lastMouse.x;
        const dy = e.clientY - lastMouse.y;
        const speed = Math.sqrt(dx * dx + dy * dy) / dt;

        if (speed > 8) {
          setOverdrive(true);
          clearTimeout(timeout);
          timeout = setTimeout(() => setOverdrive(false), 2000);
        }
        setLastMouse({ x: e.clientX, y: e.clientY, time: now });
      }
    };

    const handleClick = () => {
      setClickCount(c => c + 1);
      setTimeout(() => setClickCount(c => Math.max(0, c - 1)), 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [lastMouse, setOverdrive]);

  useEffect(() => {
    if (clickCount > 5) {
      setOverdrive(true);
      setTimeout(() => setOverdrive(false), 3000);
      setClickCount(0);
    }
  }, [clickCount, setOverdrive]);

  const shakeX = shake > 0 ? Math.min(shake / 50, 30) : 0;
  const shakeY = shake > 0 ? Math.min(shake / 80, 20) : 0;

  const positionsRef = useRef(() => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const isMobile = w < 768;
    return isMobile ? {
      avatar: { x: w / 2 - 80, y: 40 },
      music: { x: w / 2 - 144, y: 240 },
      gaming: { x: w / 2 - 144, y: 420 },
      social: { x: 16, y: h - 200 },
      theme: { x: w / 2 - 40, y: 560 }
    } : {
      avatar: { x: w / 2 - 150, y: h / 2 - 200 },
      music: { x: w * 0.1, y: h * 0.6 },
      gaming: { x: w * 0.6, y: h * 0.2 },
      social: { x: w - 260, y: h * 0.3 },
      theme: { x: w * 0.8, y: h * 0.7 }
    };
  });
  const positions = positionsRef.current();

  const handleEnter = () => {
    soundEngine.init();
    soundEngine.playClick();
    setEntered(true);
  };

  return (
    <motion.div
      className={`w-screen h-screen overflow-hidden relative ${isOverdrive ? 'invert hue-rotate-180' : ''} transition-colors duration-500`}
      animate={shake > 0 ? {
        x: [-shakeX, shakeX, -shakeX*0.8, shakeX*0.8, 0],
        y: [-shakeY, shakeY, -shakeY*0.8, shakeY*0.8, 0],
        scale: 1.02,
        filter: `blur(${Math.min(shake/400, 4)}px)`
      } : { x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.4 }}
    >
      <CustomCursor />
      <BackgroundCanvas />

      <AnimatePresence>
        {!entered && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--bg-color)]"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          >
            <motion.button
              onClick={handleEnter}
              className="relative text-4xl font-black px-12 py-6 rounded-full text-[var(--primary-color)] cursor-none group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="absolute inset-0 rounded-full border-4 border-[var(--primary-color)] opacity-20" />

              <div className="relative">
                <span className="opacity-30">ENTER</span>
                <motion.span
                  className="absolute left-0 top-0 text-[var(--primary-color)] w-full block"
                  initial={{ clipPath: 'inset(0 100% 0 0)' }}
                  animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 100%)'] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  ENTER
                </motion.span>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {entered && (
        <>
          <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 10, transform: 'translate3d(0,0,0)' }}>
            <DraggableWidget constraintsRef={containerRef} initialX={positions.avatar.x} initialY={positions.avatar.y} className="z-20">
              <AvatarWidget />
            </DraggableWidget>

            <DraggableWidget constraintsRef={containerRef} initialX={positions.music.x} initialY={positions.music.y} className="z-10">
              <MusicWidget />
            </DraggableWidget>

            <DraggableWidget constraintsRef={containerRef} initialX={positions.gaming.x} initialY={positions.gaming.y} className="z-10">
              <GamingWidget />
            </DraggableWidget>

            <DraggableWidget constraintsRef={containerRef} initialX={positions.social.x} initialY={positions.social.y} className="z-10">
              <SocialWidget />
            </DraggableWidget>

            <DraggableWidget constraintsRef={containerRef} initialX={positions.theme.x} initialY={positions.theme.y} className="z-30">
              <ThemeToggleWidget />
            </DraggableWidget>
          </div>

          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-sm font-bold opacity-30 pointer-events-none tracking-widest uppercase z-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 0.3, y: 0 }}
            transition={{ delay: 2 }}
          >
            Drag elements to explore
          </motion.div>
        </>
      )}
    </motion.div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Portfolio />
    </AppProvider>
  );
}
