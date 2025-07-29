import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  onInputFocusChange?: (focused: boolean) => void;
  onInputFocusScroll?: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading, onInputFocusChange, onInputFocusScroll }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Verificar se o navegador suporta reconhecimento de voz
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        
        // Limpar timeout anterior se existir
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Configurar timeout de 1 segundo para enviar automaticamente
        timeoutRef.current = setTimeout(() => {
          if (transcript.trim()) {
            onSendMessage(transcript);
            setMessage('');
          }
        }, 1000);
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onSendMessage]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full z-40 glass-effect border-t border-cyan-500/30 p-3 sm:p-4 md:p-6 bg-slate-900/95 backdrop-blur-md" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto px-2 sm:px-4 md:px-6">
        <div className="flex items-center gap-2 sm:gap-3 relative">
          {/* Botão do microfone - agora no lado esquerdo */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isLoading || !recognitionRef.current}
            className={`p-3 rounded-lg border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening 
                ? 'bg-red-500/20 border-red-400/50 text-red-400 hover:bg-red-500/30 jarvis-glow' 
                : 'bg-slate-800/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/50'
            }`}
            title={
              !recognitionRef.current 
                ? "Reconhecimento de voz não disponível" 
                : isListening 
                  ? "Parar gravação" 
                  : "Iniciar gravação de voz"
            }
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              disabled={isLoading}
              className="input-field pr-12 pl-4 text-cyan-100 placeholder-cyan-400/50 bg-slate-800/70 border-cyan-500/30 focus:border-cyan-400 focus:ring-cyan-400/20 text-base sm:text-lg"
              style={{ minHeight: 44, maxHeight: 80 }}
              onFocus={() => {
                onInputFocusChange && onInputFocusChange(true);
                setTimeout(() => { onInputFocusScroll && onInputFocusScroll(); }, 100);
              }}
              onBlur={() => onInputFocusChange && onInputFocusChange(false)}
            />
            
            {/* Indicador de carregamento no input */}
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
          </div>

          {/* Botão de enviar */}
          <button
            type="submit"
            disabled={!message.trim() || isLoading}
            className="btn-primary p-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            title="Enviar mensagem"
          >
            <Send size={20} />
          </button>
        </div>
        
        {/* Indicador de voz ativa */}
        {isListening && (
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-red-400">
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
            <span>Ouvindo... Fale agora</span>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
      </div>
        )}
      </form>
    </div>
  );
};