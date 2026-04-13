import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Gamepad2, Activity } from 'lucide-react';
import { useAppContext } from '../context';

interface LanyardActivity {
  name: string;
  details?: string;
  state?: string;
  type: number;
}

export const GamingWidget: React.FC = () => {
  const { setCursorState } = useAppContext();
  const [activity, setActivity] = useState<LanyardActivity | null>(null);
  const [status, setStatus] = useState<string>('offline');

  useEffect(() => {
    const ws = new WebSocket('wss://api.lanyard.rest/socket');
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        op: 2,
        d: { subscribe_to_id: '489395225681461270' }
      }));
    };

    ws.onmessage = (event) => {
      const { op, t, d } = JSON.parse(event.data);
      
      if (op === 0 && (t === 'INIT_STATE' || t === 'PRESENCE_UPDATE')) {
        setStatus(d.discord_status);
        const playingActivity = d.activities.find((a: any) => a.type === 0);
        setActivity(playingActivity || null);
      }
    };

    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ op: 3 }));
      }
    }, 30000);

    return () => {
      clearInterval(heartbeat);
      ws.close();
    };
  }, []);

  return (
    <div 
      className="flex items-center gap-4 w-64 sm:w-72"
      onMouseEnter={() => setCursorState('game')}
      onMouseLeave={() => setCursorState('default')}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
        style={{ background: 'var(--highlight-color)', color: 'var(--primary-color)' }}
        animate={{ 
          rotate: [0, -10, 10, -10, 0],
          borderRadius: ["16px", "24px", "16px"]
        }}
        transition={{ 
          rotate: { repeat: Infinity, duration: 5, ease: "easeInOut", repeatDelay: 2 },
          borderRadius: { repeat: Infinity, duration: 3, ease: "easeInOut" }
        }}
      >
        {activity ? <Gamepad2 size={28} strokeWidth={2.5} /> : <Activity size={28} strokeWidth={2.5} />}
      </motion.div>
      
      <div className="flex flex-col overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'idle' ? 'bg-yellow-500' : status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'}`} />
          <span className="text-xs font-bold uppercase tracking-widest opacity-50 truncate">
            {activity ? 'Playing' : 'Status'}
          </span>
        </div>
        <div className="relative text-lg font-black leading-tight w-full">
          <span className="opacity-30 block truncate">
            {activity ? activity.name : (status === 'offline' ? 'Offline' : 'Chilling')}
          </span>
          <motion.span 
            className="absolute left-0 top-0 text-[var(--primary-color)] block truncate w-full"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)', 'inset(0 0% 0 100%)'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          >
            {activity ? activity.name : (status === 'offline' ? 'Offline' : 'Chilling')}
          </motion.span>
        </div>
        <span className="text-sm font-bold opacity-70 truncate">
          {activity ? (activity.details || activity.state || 'In game') : 'No active game'}
        </span>
      </div>
    </div>
  );
};
