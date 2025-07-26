import React, { useState } from 'react';
import { Bot } from 'lucide-react';

interface EmptyStateProps {
  onSuggestedMessage: (message: string) => void;
  onNavigateToJarvis: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestedMessage, onNavigateToJarvis }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleLogoClick = () => {
    setIsAnimating(true);
    // Após a animação, navegar para a tela do J.A.R.V.I.S
    setTimeout(() => {
      onNavigateToJarvis();
    }, 300);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden min-h-screen">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-10" />
      
      <div className="text-center relative z-10 flex flex-col items-center justify-center w-full max-w-sm sm:max-w-md md:max-w-lg">
        {/* Logo principal com efeito suave */}
        <div className="relative mb-8">
          {/* Ícone central - responsivo */}
          <div 
            className={`w-56 h-56 sm:w-60 sm:h-60 md:w-64 md:h-64 lg:w-72 lg:h-72 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto jarvis-glow backdrop-blur-sm border border-cyan-400/30 cursor-pointer transition-all duration-300 hover:scale-105 hover:from-cyan-500/30 hover:to-blue-600/30 hover:border-cyan-300/50 ${isAnimating ? 'animate-bounce scale-110' : ''}`}
            onClick={handleLogoClick}
            title="Clique para acessar o sistema J.A.R.V.I.S"
          >
            <Bot size={100} className="text-cyan-400 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36" />
          </div>
          
          {/* Animação de pulso suave */}
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
        
        {/* Título centralizado */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold hologram-text text-gradient mb-8 sm:mb-12 leading-none">
          J.A.R.V.I.S
        </h1>
        
        {/* Indicador sutil */}
        <div className="flex items-center gap-2 text-xs text-cyan-400/50">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span>Sistema Online</span>
        </div>
      </div>
    </div>
  );
};