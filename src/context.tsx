import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

export type Theme = 'amoled' | 'olive';
export type CursorState = 'default' | 'music' | 'game' | 'theme' | 'avatar';

export interface Song {
  id: number;
  title: string;
  artist: string;
  url: string;
  lyrics: string;
  lyricsPath: string;
}

export const PLAYLIST: Song[] = [
  { id: 1, title: "Клей", artist: "CUPSIZE", url: "/CUPSIZE - Клей.mp3", lyrics: "", lyricsPath: "/CUPSIZE - Клей.lrc" },
  { id: 2, title: "crush", artist: "2hollis", url: "/2hollis - crush.mp3", lyrics: "", lyricsPath: "/2hollis - crush.lrc" },
  { id: 3, title: "The Love I Lost", artist: "Fried By Fluoride", url: "/Fried By Fluoride - The Love I Lost.mp3", lyrics: "", lyricsPath: "/Fried By Fluoride - The Love I Lost.lrc" },
  { id: 4, title: "Sleep In", artist: "Fried By Fluoride", url: "/Fried By Fluoride - Sleep In.mp3", lyrics: "", lyricsPath: "/Fried By Fluoride - Sleep In.lrc" },
  { id: 5, title: "de_survivor", artist: "ONDA ANDAR", url: "/ONDA_ANDAR_-_de_survivor_prod._onda_andar_(SkySound.cc).mp3", lyrics: "", lyricsPath: "/ONDA ANDAR - de_survivor.lrc" },
  { id: 6, title: "demonic eyes", artist: "akkiemi", url: "/akkiemi_-_demonic_eyes_(SkySound.cc).mp3", lyrics: "", lyricsPath: "/akkiemi - demonic eyes.lrc" },
];

export const parseLRC = (lrc: string) => {
  const lines = lrc.split('\n');
  return lines.map(line => {
    const match = line.match(/\[(\d+):(\d+\.\d+)\](.*)/);
    if (match) {
      return { time: parseInt(match[1]) * 60 + parseFloat(match[2]), text: match[3].trim() };
    }
    return null;
  }).filter(Boolean) as { time: number, text: string }[];
};

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  isPlaying: boolean;
  togglePlay: () => void;
  audioData: Uint8Array;
  bassLevel: number;
  audioDataRef: React.RefObject<Uint8Array>;
  bassLevelRef: React.RefObject<number>;
  currentTime: number;
  duration: number;
  currentSong: Song;
  playSong: (song: Song) => Promise<void>;
  playNext: () => void;
  cursorState: CursorState;
  setCursorState: (state: CursorState) => void;
  isOverdrive: boolean;
  setOverdrive: (state: boolean) => void;
  shake: number;
  triggerShake: (intensity: number) => void;
  isIdle: boolean;
  setIsIdle: (idle: boolean) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('olive');
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioData, setAudioData] = useState<Uint8Array>(new Uint8Array(128));
  const [bassLevel, setBassLevel] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentSong, setCurrentSong] = useState<Song>(PLAYLIST[0]);
  const [cursorState, setCursorState] = useState<CursorState>('default');
  const [isOverdrive, setOverdrive] = useState(false);
  const [shake, setShake] = useState(0);
  const [isIdle, setIsIdle] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const feedbackNodeRef = useRef<GainNode | null>(null);
  const delayOutGainRef = useRef<GainNode | null>(null);
  const requestRef = useRef<number>(0);
  const isCorsBlockedRef = useRef(false);
  const currentSongRef = useRef<Song>(PLAYLIST[0]);
  const isPlayingRef = useRef(false);
  const audioDataRef = useRef<Uint8Array>(new Uint8Array(128));
  const bassLevelRef = useRef(0);
  const lastAudioUpdateRef = useRef(0);

  const triggerShake = (intensity: number) => {
    setShake(intensity);
    setTimeout(() => setShake(0), 500);
  };

  useEffect(() => {
    document.body.className = theme === 'olive' ? 'theme-olive' : 'theme-amoled';
  }, [theme]);

  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  const prevOverdriveRef = useRef(false);
  useEffect(() => {
    if (prevOverdriveRef.current === isOverdrive) return;
    prevOverdriveRef.current = isOverdrive;

    if (feedbackNodeRef.current && delayOutGainRef.current && audioRef.current && audioCtxRef.current) {
      if (isOverdrive) {
        feedbackNodeRef.current.gain.setTargetAtTime(0.6, audioCtxRef.current.currentTime, 0.1);
        delayOutGainRef.current.gain.setTargetAtTime(1, audioCtxRef.current.currentTime, 0.1);
        audioRef.current.playbackRate = 1.2;
      } else {
        feedbackNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.5);
        delayOutGainRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.1);
        audioRef.current.playbackRate = 1.0;
      }
    }
  }, [isOverdrive]);

  const loadLyrics = async (song: Song): Promise<Song> => {
    if (!song.lyricsPath) return song;
    try {
      const res = await fetch(song.lyricsPath);
      if (res.ok) {
        const text = await res.text();
        return { ...song, lyrics: text };
      }
    } catch {
      // lyrics unavailable
    }
    return song;
  };

  useEffect(() => {
    loadLyrics(PLAYLIST[0]).then(setCurrentSong);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === 'amoled' ? 'olive' : 'amoled'));

  const ensureAudio = (songUrl: string) => {
    if (!audioRef.current) {
      const audio = new Audio(songUrl);
      audioRef.current = audio;

      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration));
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
      audio.addEventListener('ended', () => {
        const currentIndex = PLAYLIST.findIndex(s => s.id === currentSongRef.current.id);
        const nextIndex = (currentIndex + 1) % PLAYLIST.length;
        const nextSong = PLAYLIST[nextIndex];
        loadLyrics(nextSong).then((s) => {
          setCurrentSong(s);
          setCurrentTime(0);
          if (audioRef.current) {
            audioRef.current.src = s.url;
            audioRef.current.play();
          }
        });
      });
    }

    if (!audioCtxRef.current) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const delay = ctx.createDelay();
      delay.delayTime.value = 0.15;
      const feedback = ctx.createGain();
      feedback.gain.value = 0;
      feedbackNodeRef.current = feedback;
      const delayOutGain = ctx.createGain();
      delayOutGain.gain.value = 0;
      delayOutGainRef.current = delayOutGain;

      try {
        const source = ctx.createMediaElementSource(audioRef.current!);
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyser.connect(delay);
        delay.connect(feedback);
        feedback.connect(delay);
        delay.connect(delayOutGain);
        delayOutGain.connect(ctx.destination);
        sourceRef.current = source;
      } catch {
        isCorsBlockedRef.current = true;
      }
    }
  };

  const updateAudioData = () => {
    if (!isPlayingRef.current) return;

    const now = performance.now();
    const shouldUpdateUI = now - lastAudioUpdateRef.current > 66;

    if (isCorsBlockedRef.current) {
      const dataArray = new Uint8Array(128);
      const time = Date.now() / 100;
      for (let i = 0; i < dataArray.length; i++) {
        dataArray[i] = Math.abs(Math.sin(time + i * 0.1)) * 255 * Math.random();
      }
      audioDataRef.current = dataArray;
      const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3 / 255;
      bassLevelRef.current = bass;

      if (shouldUpdateUI) {
        setAudioData(dataArray);
        setBassLevel(bass);
        lastAudioUpdateRef.current = now;
      }
    } else if (analyserRef.current) {
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      if (sum === 0 && audioRef.current && !audioRef.current.paused) {
        isCorsBlockedRef.current = true;
      }

      audioDataRef.current = dataArray;
      const bass = (dataArray[0] + dataArray[1] + dataArray[2]) / 3 / 255;
      bassLevelRef.current = bass;

      if (shouldUpdateUI) {
        setAudioData(dataArray);
        setBassLevel(bass);
        lastAudioUpdateRef.current = now;
      }
    }

    requestRef.current = requestAnimationFrame(updateAudioData);
  };

  const startPlayback = () => {
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    cancelAnimationFrame(requestRef.current);

    audioRef.current!.play().then(() => {
      setIsPlaying(true);
      requestRef.current = requestAnimationFrame(updateAudioData);
    }).catch(() => {
      isCorsBlockedRef.current = true;
      setIsPlaying(true);
      requestRef.current = requestAnimationFrame(updateAudioData);
    });
  };

  const playNext = () => {
    const currentIndex = PLAYLIST.findIndex(s => s.id === currentSongRef.current.id);
    const nextIndex = (currentIndex + 1) % PLAYLIST.length;
    playSong(PLAYLIST[nextIndex]);
  };

  const playSong = async (song: Song) => {
    cancelAnimationFrame(requestRef.current);

    const songWithLyrics = await loadLyrics(song);
    setCurrentSong(songWithLyrics);
    setCurrentTime(0);

    ensureAudio(song.url);

    audioRef.current!.src = song.url;
    startPlayback();
  };

  const togglePlay = () => {
    ensureAudio(currentSongRef.current.url);

    if (isPlayingRef.current) {
      audioRef.current?.pause();
      cancelAnimationFrame(requestRef.current);
      setIsPlaying(false);
    } else {
      if (!audioRef.current!.src || audioRef.current!.src === window.location.href) {
        audioRef.current!.src = currentSongRef.current.url;
      }
      startPlayback();
    }
  };

  return (
    <AppContext.Provider value={{
      theme, toggleTheme, isPlaying, togglePlay, audioData, bassLevel,
      audioDataRef, bassLevelRef, currentTime, duration,
      currentSong, playSong, playNext, cursorState, setCursorState, isOverdrive, setOverdrive,
      shake, triggerShake, isIdle, setIsIdle
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
