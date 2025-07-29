import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { ChatInput } from './ChatInput';
import { Header } from './Header';
import { googleAIService } from '../services/googleAI';

interface WelcomeScreenProps {
  onNavigateToChat: () => void;
  onNavigateToJarvis: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  onNavigateToChat, 
  onNavigateToJarvis 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogoClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onNavigateToJarvis();
    }, 200);
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    // Enviar mensagem e ir para o chat
    try {
      await googleAIService.sendMessage(messageContent);
      onNavigateToChat();
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const getLogoClasses = () => {
    const baseClasses = "w-36 h-36 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto jarvis-glow backdrop-blur-sm border border-cyan-400/30 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-300/50";
    
    return `${baseClasses} ${isAnimating ? 'scale-110' : ''}`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      {/* Header fixo */}
      <Header 
        onClearChat={() => {}}
        onLogout={() => {}}
        onShowHistory={() => {}}
        messageCount={0}
        showBackButton={false}
      />
      
      {/* Container do conteúdo com scroll */}
      <div className="flex flex-col flex-1 relative z-10 px-2 sm:px-4 md:px-8 overflow-hidden pb-20 sm:pb-24 md:pb-28">
        <div className="flex-1 overflow-y-auto scrollbar-hide w-full max-w-2xl mx-auto p-2 sm:p-4 space-y-4">
          <div className="flex flex-col items-center p-2 sm:p-4 relative overflow-hidden">
            {/* Container principal centralizado */}
            <div className="text-center relative z-10 flex flex-col items-center w-full max-w-xs sm:max-w-md md:max-w-lg pt-8 sm:pt-16">
              
              {/* Frase explicativa */}
              <div className="mb-8 text-center">
                <p className="text-cyan-300/80 text-xs sm:text-base font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                  Clique na logo abaixo para uma experiência imersiva de conversa contínua!
                </p>
              </div>
              
              {/* Logo principal */}
              <div className="relative mb-6 sm:mb-8">
                <div 
                  className={getLogoClasses()}
                  onClick={handleLogoClick}
                  title="Clique para acessar o sistema J.A.R.V.I.S"
                >
                  <Bot 
                    size={56} 
                    className="text-cyan-400 sm:w-20 sm:h-20 md:w-28 md:h-28" 
                  />
                </div>
                
                {/* Animações de pulso suave */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/20 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-2 rounded-full border border-blue-400/10 animate-ping pointer-events-none" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
                
                {/* Círculos orbitais simples */}
                <div className="absolute inset-0 animate-spin pointer-events-none" style={{ animationDuration: '20s' }}>
                  <div className="absolute top-0 left-1/2 w-2 h-2 bg-cyan-400/60 rounded-full transform -translate-x-1/2 -translate-y-1" />
                </div>
                <div className="absolute inset-0 animate-spin pointer-events-none" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
                  <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-blue-400/60 rounded-full transform translate-x-1 -translate-y-1/2" />
                </div>
              </div>
              
              {/* Título principal */}
              <div className="mb-4 sm:mb-6">
                <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold hologram-text text-gradient leading-none tracking-wider">
                  J.A.R.V.I.S
                </h1>
              </div>
              
              {/* Status da conversa */}
              <div className="flex items-center gap-2 text-xs text-cyan-400/50">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>Sistema Online</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Input na parte inferior */}
        <ChatInput 
          onSendMessage={handleSendMessage}
          isLoading={false}
          onInputFocusScroll={() => {}}
        />
      </div>
    </div>
  );
}; 