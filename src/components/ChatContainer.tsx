import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Header } from './Header';
import { EmptyState } from './EmptyState';
import { googleAIService, ChatMessage as ChatMessageType } from '../services/googleAI';
import { AlertCircle } from 'lucide-react';

export const ChatContainer: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
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
    const userMessage: ChatMessageType = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await googleAIService.sendMessage(messageContent);
      
      // Adicionar resposta da IA
      const aiMessage: ChatMessageType = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      
      // Adicionar mensagem de erro
      const errorMessage: ChatMessageType = {
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
    <div className="flex flex-col h-screen bg-gray-50">
      <Header 
        onClearChat={handleClearChat}
        messageCount={messages.length}
      />
      
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto scrollbar-hide"
      >
        {messages.length === 0 ? (
          <EmptyState onSuggestedMessage={handleSuggestedMessage} />
        ) : (
          <div className="max-w-4xl mx-auto p-4 space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {/* Indicador de carregamento */}
            {isLoading && (
              <div className="flex items-start gap-3 mb-6 animate-slide-up">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-600">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                </div>
                <div className="flex flex-col items-start max-w-xs sm:max-w-sm md:max-w-md">
                  <div className="bg-white text-gray-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-gray-500">Digitando...</span>
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
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-4 mb-4 rounded-r-lg">
          <div className="flex items-center">
            <AlertCircle className="text-red-400 mr-2" size={16} />
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
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