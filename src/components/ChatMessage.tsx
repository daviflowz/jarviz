import React, { useState, useRef, useEffect } from 'react';
import { Volume2, PauseCircle } from 'lucide-react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  };
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async (text: string) => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    try {
      const response = await fetch('https://tts-service-850542229344.southamerica-east1.run.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        
        audio.play();
        setIsPlaying(true);

        audio.onended = () => {
          setIsPlaying(false);
        };

      } else {
        console.error('Erro ao gerar áudio:', response.statusText);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md ${isUser ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser 
            ? 'chat-bubble-user' 
            : 'chat-bubble-ai'
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {!isUser && (
            <button
              onClick={() => handleSpeak(message.content)}
              className="mt-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              title={isPlaying ? "Parar áudio" : "Ouvir mensagem"}
            >
              {isPlaying ? (
                <PauseCircle size={16} className="text-red-600" />
              ) : (
                <Volume2 size={16} className="text-gray-600" />
              )}
            </button>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${
          isUser ? 'text-right' : 'text-left'
        }`}>
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
    </div>
  );
};