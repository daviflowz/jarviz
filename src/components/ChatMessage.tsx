import React, { useState, useRef, useEffect } from 'react';
import { Volume2, PauseCircle, User, Bot, Loader2 } from 'lucide-react';
import { Message } from '../services/googleAI';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async (text: string) => {
    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      return;
    }

    // Feedback visual imediato
    setIsLoading(true);

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
        
        // Configurar para reprodução mais rápida
        audio.preload = 'auto';
        
        // Iniciar reprodução imediatamente
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          URL.revokeObjectURL(audioUrl);
        };

      } else {
        console.error('Erro ao gerar áudio:', response.statusText);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erro ao reproduzir áudio:', error);
      setIsLoading(false);
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 sm:mb-6 animate-slide-up px-1`}>
      <div className={`flex items-start gap-2 sm:gap-3 max-w-full sm:max-w-xs md:max-w-md ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
        isUser 
            ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white' 
            : 'glass-effect border border-cyan-500/30 text-cyan-400'
      }`}>
        {isUser ? <User size={16} className="sm:w-5 sm:h-5" /> : <Bot size={16} className="sm:w-5 sm:h-5" />}
      </div>
      
        {/* Mensagem */}
        <div className="flex flex-col">
        <div className={`${
          isUser 
            ? 'chat-bubble-user' 
            : 'chat-bubble-ai'
          }`}>
            <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
              {message.content}
            </p>
            
            {/* Botão de áudio para mensagens da IA */}
            {!isUser && message.content && (
              <button
                onClick={() => handleSpeak(message.content)}
                disabled={isLoading}
                className={`mt-2 sm:mt-3 p-2 rounded-full transition-all duration-300 ${
                  isLoading 
                    ? 'bg-cyan-500/30 text-cyan-300 cursor-not-allowed' 
                    : isPlaying 
                      ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                      : 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
                }`}
                title={isLoading ? "Carregando..." : isPlaying ? "Parar áudio" : "Ouvir mensagem"}
              >
                {isLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : isPlaying ? (
                  <PauseCircle size={14} />
                ) : (
                  <Volume2 size={14} />
                )}
              </button>
            )}
        </div>
        
          {/* Timestamp */}
          <div className={`text-[10px] sm:text-xs text-cyan-400/60 mt-1 ${
            isUser ? 'text-right' : 'text-left'
          }`}>
          {message.timestamp.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          </div>
        </div>
      </div>
    </div>
  );
};