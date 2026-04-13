import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context';
import { soundEngine } from '../lib/sound';

export const CustomCursor: React.FC = () => {
  const { cursorState, isOverdrive } = useAppContext();
  const [isVisible, setIsVisible] = useState(true);
  const [isClicked, setIsClicked] = useState(false);
  const [clickEffects, setClickEffects] = useState<{id: number, x: number, y: number}[]>([]);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);
  
  const trailX = useSpring(mouseX, { damping: 30, stiffness: 200, mass: 0.8 });
  const trailY = useSpring(mouseY, { damping: 30, stiffness: 200, mass: 0.8 });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      
      if (e.clientX <= 5 || e.clientY <= 5 || e.clientX >= window.innerWidth - 5 || e.clientY >= window.innerHeight - 5) {
        if (isVisible) setIsVisible(false);
      } else {
        if (!isVisible) setIsVisible(true);
      }
    };
    
    const handlePointerLeave = () => setIsVisible(false);

    const handlePointerDown = (e: PointerEvent) => {
      setIsClicked(true);
      soundEngine.playClick();
      const newEffect = { id: Date.now(), x: e.clientX, y: e.clientY };
      setClickEffects(prev => [...prev, newEffect]);
      setTimeout(() => {
        setClickEffects(prev => prev.filter(effect => effect.id !== newEffect.id));
      }, 600);
    };

    const handlePointerUp = () => setIsClicked(false);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    document.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, [mouseX, mouseY, isVisible]);

  const variants = {
    default: { 
      width: 20, height: 20, 
      borderRadius: '50%', 
      backgroundColor: '#ffffff',
      border: '0px solid rgba(255, 255, 255, 0)',
      x: "-50%", y: "-50%",
      scale: isClicked ? 0.5 : 1
    },
    music: { 
      width: 48, height: 48, 
      borderRadius: '12px', 
      backgroundColor: 'rgba(255, 255, 255, 0)',
      border: '3px solid #ffffff',
      x: "-50%", y: "-50%",
      rotate: isOverdrive ? 180 : 0,
      scale: isClicked ? 0.8 : 1
    },
    game: { 
      width: 36, height: 36, 
      borderRadius: '0%', 
      backgroundColor: '#ffffff',
      border: '2px solid #ffffff',
      x: "-50%", y: "-50%",
      rotate: 45,
      scale: isClicked ? 0.7 : 1
    },
    theme: { 
      width: 40, height: 40, 
      borderRadius: '50% 0 50% 50%', 
      backgroundColor: '#ffffff',
      border: '0px solid rgba(255, 255, 255, 0)',
      x: "-50%", y: "-50%",
      rotate: -45,
      scale: isClicked ? 0.7 : 1
    },
    avatar: {
      width: 64, height: 64,
      borderRadius: '50%',
      backgroundColor: 'rgba(255, 255, 255, 0)',
      border: '2px dashed #ffffff',
      x: "-50%", y: "-50%",
      rotate: isOverdrive ? 360 : 0,
      scale: isClicked ? 0.8 : 1
    }
  };

  return (
    <>
      <AnimatePresence>
        {clickEffects.map(effect => (
          <React.Fragment key={effect.id}>
            <motion.div
              className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full border-[1.5px] border-white mix-blend-difference"
              initial={{ width: 20, height: 20, x: effect.x - 10, y: effect.y - 10, opacity: 0.8 }}
              animate={{ width: 80, height: 80, x: effect.x - 40, y: effect.y - 40, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            {[0, 90, 180, 270].map((angle, i) => {
              const rad = (angle * Math.PI) / 180;
              const dist = 40;
              return (
                <motion.div
                  key={`${effect.id}-${i}`}
                  className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full bg-white mix-blend-difference"
                  initial={{ width: 4, height: 4, x: effect.x - 2, y: effect.y - 2, opacity: 1 }}
                  animate={{ 
                    x: effect.x - 2 + Math.cos(rad) * dist, 
                    y: effect.y - 2 + Math.sin(rad) * dist, 
                    opacity: 0,
                    scale: 0
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              )
            })}
          </React.Fragment>
        ))}
      </AnimatePresence>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference flex items-center justify-center"
        style={{ 
          x: cursorX, 
          y: cursorY,
          opacity: isVisible ? 1 : 0,
          transition: 'opacity 0.2s'
        }}
      >
        <motion.div
          animate={cursorState}
          variants={variants}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        />
      </motion.div>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] w-8 h-8 rounded-full blur-md mix-blend-difference"
        style={{ 
          x: trailX, 
          y: trailY, 
          translateX: "-50%", 
          translateY: "-50%",
          background: '#ffffff',
          opacity: isVisible && !isClicked ? 0.5 : 0,
          transition: 'opacity 0.2s'
        }}
      />
    </>
  );
};
