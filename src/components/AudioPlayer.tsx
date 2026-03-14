import { useState, useRef, useEffect } from 'react';
import { Pause, Volume2, Loader2, Square } from 'lucide-react';

interface AudioPlayerProps {
  text: string;
}

export default function AudioPlayer({ text }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const cleanText = (raw: string) =>
    raw.replace(/[#*>`_\-\[\]()]/g, '').replace(/\n{2,}/g, '. ').replace(/\n/g, ' ').slice(0, 5000);

  const handlePlay = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText(text));
    utterance.rate = 0.9;
    utterance.pitch = 1;

    // Try to pick a good voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) 
      || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;

    utterance.onstart = () => { setIsLoading(false); setIsPlaying(true); };
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => { setIsLoading(false); setIsPlaying(false); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return (
    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
      <button
        onClick={handlePlay}
        disabled={isLoading}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accent/10 text-accent hover:bg-accent/20 transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isPlaying ? (
          <Pause className="h-3.5 w-3.5" />
        ) : (
          <Volume2 className="h-3.5 w-3.5" />
        )}
        {isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Listen'}
      </button>

      {isPlaying && (
        <button
          onClick={handleStop}
          className="flex items-center gap-1 px-2 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Square className="h-3 w-3" />
          Stop
        </button>
      )}
    </div>
  );
}
