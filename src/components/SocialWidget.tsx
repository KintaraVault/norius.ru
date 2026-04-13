import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { useAppContext } from '../context';

const SOCIALS = [
  {
    name: 'Telegram',
    username: 'nozzw',
    url: 'https://t.me/nozzw',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: 'Discord',
    username: 'nozw',
    url: 'https://discord.com/users/nozw',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
  },
  {
    name: 'Steam',
    username: 'nozwno',
    url: 'https://steamcommunity.com/id/nozwno',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.313-.003-1.922-.267-.61-.755-1.071-1.373-1.333-.615-.26-1.286-.255-1.898.006-.61.26-1.096.77-1.353 1.382L7.54 18.21zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
      </svg>
    ),
  },
];

export const SocialWidget: React.FC = () => {
  const { setCursorState } = useAppContext();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const clickTimerRef = useRef<Record<string, NodeJS.Timeout>>({});

  const handleClick = (social: (typeof SOCIALS)[0]) => {
    if (clickTimerRef.current[social.name]) {
      clearTimeout(clickTimerRef.current[social.name]);
      delete clickTimerRef.current[social.name];
      window.open(social.url, '_blank');
    } else {
      navigator.clipboard.writeText(social.username).then(() => {
        setCopiedId(social.name);
        setTimeout(() => setCopiedId(null), 1500);
      });
      clickTimerRef.current[social.name] = setTimeout(() => {
        delete clickTimerRef.current[social.name];
      }, 300);
    }
  };

  return (
    <motion.div
      layout
      className="flex flex-row gap-2"
      onMouseEnter={() => setCursorState('default')}
      onMouseLeave={() => setCursorState('default')}
    >
      {SOCIALS.map((social) => (
        <motion.button
          key={social.name}
          onClick={() => handleClick(social)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
          className="w-12 h-12 flex items-center justify-center rounded-xl outline-none relative"
          style={{
            background: 'var(--highlight-color)',
            color: 'var(--primary-color)',
          }}
        >
          {copiedId === social.name && (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: -4 }}
              exit={{ opacity: 0 }}
              className="absolute -top-5 text-[10px] font-bold whitespace-nowrap"
              style={{ color: 'var(--primary-color)' }}
            >
              Copied!
            </motion.span>
          )}
          {social.icon}
        </motion.button>
      ))}
    </motion.div>
  );
};
