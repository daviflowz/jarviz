import React, { useState } from 'react';
import { Bot } from 'lucide-react';

interface EmptyStateProps {
  onSuggestedMessage: (message: string) => void;
  onNavigateToJarvis: () => void;
  isTransitioning?: boolean;
  nextScreen?: 'chat' | 'jarvis' | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  onSuggestedMessage, 
  onNavigateToJarvis, 
  isTransitioning = false, 
  nextScreen = null 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogoClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onNavigateToJarvis();
    }, 200);
  };

  const getLogoClasses = () => {
    const baseClasses = "w-36 h-36 sm:w-56 sm:h-56 md:w-64 md:h-64 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto jarvis-glow backdrop-blur-sm border border-cyan-400/30 cursor-pointer transition-all duration-200 hover:scale-105 hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-300/50";
    
    if (isTransitioning && nextScreen === 'jarvis') {
      return `${baseClasses} animate-logo-smooth-transition`;
    }
    
    return `${baseClasses} ${isAnimating ? 'scale-110' : ''}`;
  };

  const getTitleClasses = () => {
    const baseClasses = "text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-bold hologram-text text-gradient leading-none tracking-wider";
    
    if (isTransitioning && nextScreen === 'jarvis') {
      return `${baseClasses} animate-title-smooth-transition`;
    }
    
    return baseClasses;
  };

  return (
    <div className="flex flex-col items-center p-2 sm:p-4 relative overflow-hidden">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-10" />
      
      
      
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
          <h1 className={getTitleClasses()}>
            J.A.R.V.I.S
          </h1>
        </div>
        
        {/* Status da conversa */}
        <div className={`flex items-center gap-2 text-xs text-cyan-400/50 ${isTransitioning && nextScreen === 'jarvis' ? 'animate-status-smooth-transition' : ''}`}>
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span>Sistema Online</span>
        </div>
      </div>
    </div>
  );
};