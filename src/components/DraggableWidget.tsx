import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'motion/react';
import { useAppContext } from '../context';
import { soundEngine } from '../lib/sound';

interface DraggableWidgetProps {
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  className?: string;
  constraintsRef?: React.RefObject<Element>;
}

let globalZIndex = 10;

export const DraggableWidget: React.FC<DraggableWidgetProps> = ({ children, initialX, initialY, className = '', constraintsRef }) => {
  const { triggerShake, isIdle } = useAppContext();
  const squishControls = useAnimation();
  const floatControls = useAnimation();
  const [zIndex, setZIndex] = useState(globalZIndex);

  const handlePointerDown = () => {
    globalZIndex += 1;
    setZIndex(globalZIndex);
    soundEngine.playDragStart();
  };

  const handleDragEnd = (e: any, info: any) => {
    soundEngine.playDragEnd();
    const { velocity, point } = info;
    const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
    
    const isNearLeft = point.x < 150;
    const isNearRight = point.x > window.innerWidth - 150;
    const isNearTop = point.y < 150;
    const isNearBottom = point.y > window.innerHeight - 150;
    
    if ((isNearLeft || isNearRight || isNearTop || isNearBottom) && speed > 200) {
      let sX = 1;
      let sY = 1;
      
      if ((isNearLeft || isNearRight) && Math.abs(velocity.x) > Math.abs(velocity.y)) {
         sX = Math.max(0.6, 1 - speed / 2000);
         sY = Math.min(1.4, 1 + speed / 2000);
      } else if ((isNearTop || isNearBottom)) {
         sX = Math.min(1.4, 1 + speed / 2000);
         sY = Math.max(0.6, 1 - speed / 2000);
      }
      
      const animateSquish = async () => {
        await squishControls.start({
           scaleX: sX,
           scaleY: sY,
           transition: { duration: 0.1, type: "tween", ease: "easeOut" }
        });
        squishControls.start({
           scaleX: 1,
           scaleY: 1,
           transition: { duration: 0.5, type: "spring", bounce: 0.6 }
        });
      };
      animateSquish();
      
      if (speed > 800) {
         triggerShake(speed);
      }
    }
  };

  useEffect(() => {
    let isActive = true;
    const float = async () => {
      while (isActive && isIdle) {
        await floatControls.start({
          x: (Math.random() - 0.5) * 30,
          y: (Math.random() - 0.5) * 30,
          rotate: (Math.random() - 0.5) * 8,
          transition: { duration: 3 + Math.random() * 2, ease: "easeInOut" }
        });
      }
    };

    if (isIdle) {
      float();
    } else {
      floatControls.start({
        x: 0,
        y: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 25 }
      });
    }

    return () => { isActive = false; };
  }, [isIdle, floatControls]);

  return (
    <motion.div
      drag
      dragConstraints={constraintsRef}
      dragElastic={0.1}
      dragTransition={{ power: 0.05, timeConstant: 100 }}
      onPointerDown={handlePointerDown}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => soundEngine.playHover()}
      initial={{ x: initialX, y: initialY, opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', bounce: 0.4, duration: 1 }}
      whileHover={{ scale: 1.02 }}
      whileDrag={{ scale: 1.05 }}
      className={`absolute p-4 sm:p-6 ${className}`}
      style={{
        zIndex,
        background: 'var(--accent-color)',
        borderRadius: '32px',
        boxShadow: '0 10px 30px var(--shadow-color)',
        border: '2px solid var(--highlight-color)',
        willChange: 'transform',
      }}
    >
      <motion.div animate={squishControls} className="w-full h-full" style={{ willChange: 'transform' }}>
        <motion.div animate={floatControls} className="w-full h-full">
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};
