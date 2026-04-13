import React from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context';
import { Moon, Sun } from 'lucide-react';

export const ThemeToggleWidget: React.FC = () => {
  const { theme, toggleTheme, setCursorState } = useAppContext();
  const isAmoled = theme === 'amoled';

  return (
    <motion.button
      onClick={toggleTheme}
      onMouseEnter={() => setCursorState('theme')}
      onMouseLeave={() => setCursorState('default')}
      className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center outline-none relative overflow-hidden"
      style={{
        background: 'var(--highlight-color)',
        color: 'var(--primary-color)',
      }}
      animate={{
        borderRadius: isAmoled ? ["50%", "30%", "50%"] : ["20%", "40%", "20%"],
        rotate: isAmoled ? 0 : 180
      }}
      transition={{ 
        default: { type: "spring", damping: 15, stiffness: 100 },
        borderRadius: { repeat: Infinity, duration: 4, ease: "easeInOut" }
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.div
        initial={false}
        animate={{ 
          scale: isAmoled ? 1 : 0,
          opacity: isAmoled ? 1 : 0,
          rotate: isAmoled ? 0 : -90
        }}
        className="absolute"
      >
        <Moon className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
      </motion.div>
      
      <motion.div
        initial={false}
        animate={{ 
          scale: !isAmoled ? 1 : 0,
          opacity: !isAmoled ? 1 : 0,
          rotate: !isAmoled ? 0 : 90
        }}
        className="absolute"
      >
        <Sun className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={3} />
      </motion.div>
    </motion.button>
  );
};
