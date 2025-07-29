import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { Header } from './Header';
import { EmptyState } from './EmptyState';
import { ChatHistory } from './ChatHistory';
import { googleAIService, Message } from '../services/googleAI';
import { AlertTriangle } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Array de sugestões de perguntas
const allSuggestions = [
  "Por que o céu é azul?",
  "Como funciona a memória?",
  "O que é um buraco negro?",
  "Por que sonhamos?",
  "Como funciona a gravidade?",
  "O que é a inteligência?",
  "Por que o mar é salgado?",
  "Como funciona o tempo?",
  "O que é a consciência?",
  "Por que as folhas são verdes?",
  "Como funciona a música?",
  "O que é o amor?",
  "Por que envelhecemos?",
  "Como funciona a luz?",
  "O que é a felicidade?",
  "Por que as estrelas brilham?",
  "Como funciona a dor?",
  "O que é a beleza?",
  "Por que rimos?",
  "Como funciona a vida?"
];

// Função para selecionar 2 sugestões aleatórias
const getRandomSuggestions = () => {
  const shuffled = [...allSuggestions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
};

interface ChatContainerProps {
  onNavigateToJarvis: () => void;
  onNavigateToWelcome: () => void;
  isTransitioning?: boolean;
  nextScreen?: 'chat' | 'jarvis' | null;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({ 
  onNavigateToJarvis, 
  onNavigateToWelcome,
  isTransitioning = false, 
  nextScreen = null 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSuggestions, setCurrentSuggestions] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [allHistoryMessages, setAllHistoryMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Carregar histórico do usuário e mudar sugestões quando a página carrega
  useEffect(() => {
    const loadUserHistory = async () => {
      try {
        const history = await googleAIService.loadUserHistory();
        setMessages(history);
        setAllHistoryMessages(history);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      }
    };

    loadUserHistory();
    setCurrentSuggestions(getRandomSuggestions());
  }, []);

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
      
      // Atualizar histórico completo
      setAllHistoryMessages(prev => [...prev, userMessage, aiMessage]);
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

  const handleClearChat = async () => {
    setMessages([]);
    setError(null);
    await googleAIService.clearHistory();
  };

  const handleShowHistory = () => {
    setShowHistory(true);
  };

  const handleLoadConversation = (conversationMessages: Message[]) => {
    setMessages(conversationMessages);
    setError(null);
  };

  const handleSuggestedMessage = (message: string) => {
    handleSendMessage(message);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      {/* Header fixo */}
      <Header 
        onClearChat={handleClearChat}
        onLogout={handleLogout}
        onShowHistory={handleShowHistory}
        onGoBack={onNavigateToWelcome}
        messageCount={messages.length}
        showBackButton={messages.length > 0}
      />
      
      {/* Container do conteúdo com scroll */}
      <div className="flex flex-col flex-1 relative z-10 px-2 sm:px-4 md:px-8 overflow-hidden pb-20 sm:pb-24 md:pb-28">
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full max-w-2xl mx-auto p-2 sm:p-4 space-y-4" ref={chatContainerRef}>
          {messages.length === 0 ? (
            <EmptyState 
              onSuggestedMessage={handleSuggestedMessage}
              onNavigateToJarvis={onNavigateToJarvis}
              isTransitioning={isTransitioning}
              nextScreen={nextScreen}
            />
          ) : (
            <>
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
            </>
          )}
        </div>
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onInputFocusScroll={() => {
            setTimeout(() => {
              if (messagesEndRef.current) {
                messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
              } else if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
              }
            }, 100);
          }}
        />
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
      
      {/* Sugestões de perguntas - posicionadas acima do input */}
      {messages.length === 0 && (
        <div className="px-2 sm:px-4 pb-4 sm:pb-6">
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedMessage(suggestion)}
                className="w-40 h-8 sm:w-56 sm:h-10 px-2 text-xs sm:text-sm bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/20 hover:border-cyan-400/40 rounded-md text-cyan-300/80 hover:text-cyan-200 transition-all duration-300 backdrop-blur-sm hover:scale-105 flex items-center justify-center"
                title={suggestion}
              >
                <div className="text-center leading-tight truncate" title={suggestion}>
                  {suggestion}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modal de histórico */}
      {showHistory && (
        <ChatHistory
          messages={allHistoryMessages}
          onClose={() => setShowHistory(false)}
          onLoadConversation={handleLoadConversation}
        />
      )}
      
    </div>
  );
};