import React, { useState, KeyboardEvent, useRef } from 'react';
import { Send, Loader2, Mic, MicOff } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [message, setMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Função para iniciar/parar reconhecimento de voz
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Reconhecimento de voz não suportado neste navegador. Use o Chrome para melhor experiência.');
      return;
    }
    if (!recognitionRef.current) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.lang = 'pt-BR';
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.onresult = (event: any) => {
        // Limpar timeout anterior
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setMessage((prev) => prev + (prev ? ' ' : '') + finalTranscript);
          // Enviar automaticamente após 1 segundo
          setTimeout(() => {
            const newMessage = message + (message ? ' ' : '') + finalTranscript;
            if (newMessage.trim() && !isLoading) {
              onSendMessage(newMessage.trim());
              setMessage('');
            }
          }, 1000);
        }
        
        // Configurar timeout de 2 segundos para parar
        timeoutRef.current = setTimeout(() => {
          if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
          }
        }, 2000);
      };
      recognitionRef.current.onend = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        // Reiniciar automaticamente se ainda estiver no modo de escuta
        if (isListening) {
          setTimeout(() => {
            if (isListening) {
              recognitionRef.current.start();
            }
          }, 100);
        }
      };
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
    if (!isListening) {
      setIsListening(true);
      recognitionRef.current.start();
    } else {
      setIsListening(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      recognitionRef.current.stop();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-3 max-w-4xl mx-auto">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            rows={1}
            className="input-field resize-none min-h-[48px] max-h-32 pr-20"
            style={{
              height: 'auto',
              minHeight: '48px'
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-3 text-xs text-gray-400">
            {message.length}/1000
          </div>
          {/* Botão de microfone */}
          <button
            type="button"
            onClick={handleVoiceInput}
            disabled={isLoading}
            className={`absolute top-2 right-12 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 ${isListening ? 'bg-red-100 text-red-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
            title={isListening ? 'Parar gravação' : 'Falar'}
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
        </div>
        <button
          type="submit"
          disabled={!message.trim() || isLoading || message.length > 1000}
          className="btn-primary flex-shrink-0 w-12 h-12 !p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </form>
      {/* Sugestões rápidas */}
      <div className="flex flex-wrap gap-2 mt-3 max-w-4xl mx-auto">
        {[
          "Olá! Como você pode me ajudar?",
          "Conte-me uma piada",
          "Explique algo interessante",
          "Dê-me uma dica útil"
        ].map((suggestion, index) => (
          <button
            key={index}
            onClick={() => setMessage(suggestion)}
            disabled={isLoading}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-full transition-colors duration-200 disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};