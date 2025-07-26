import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Header } from './Header';
import { EmptyState } from './EmptyState';
import { googleAIService, Message } from '../services/googleAI';
import { AlertTriangle } from 'lucide-react';

interface ChatContainerProps {
  onNavigateToJarvis: () => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ onNavigateToJarvis }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    // Adicionar mensagem do usuário imediatamente
    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await googleAIService.sendMessage(messageContent);
      
      // Adicionar resposta da IA
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Adicionar mensagem de erro
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    googleAIService.clearHistory();
  };

  const handleSuggestedMessage = (message: string) => {
    handleSendMessage(message);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      <Header 
        onClearChat={handleClearChat}
        messageCount={messages.length}
      />
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide relative z-10"
      >
        {messages.length === 0 ? (
          <EmptyState 
            onSuggestedMessage={handleSuggestedMessage}
            onNavigateToJarvis={onNavigateToJarvis}
          />
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Indicador de carregamento */}
            {isLoading && (
              <div className="flex items-start gap-3 mb-6 animate-slide-up">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center glass-effect border border-cyan-500/30">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
                </div>
                <div className="flex flex-col items-start max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="chat-bubble-ai">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-cyan-400/80">Processando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-900/50 border border-red-500/50 p-4 mx-4 mb-4 rounded-lg backdrop-blur-sm">
          <div className="flex items-center">
            <AlertTriangle className="text-red-400 mr-2" size={16} />
            <p className="text-sm text-red-300">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-300 text-lg leading-none"
            >
              ×
            </button>
          </div>
        </div>
      )}
      
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
};