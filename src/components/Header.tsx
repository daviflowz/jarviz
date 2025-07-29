import React, { useState } from 'react';
import { Trash2, Settings, Bot, LogOut, History, ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  onLogout: () => void;
  onShowHistory: () => void;
  onGoBack?: () => void;
  messageCount: number;
  showBackButton?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onClearChat, 
  onLogout, 
  onShowHistory, 
  onGoBack, 
  messageCount,
  showBackButton = false 
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const handleSettingsClick = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  const handleLogout = () => {
    setShowSettingsMenu(false);
    onLogout();
  };

  const handleShowHistory = () => {
    setShowSettingsMenu(false);
    onShowHistory();
  };

  const handleGoBack = () => {
    if (onGoBack) {
      onGoBack();
    }
  };
  

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-cyan-500/30 px-2 sm:px-4 py-2 sm:py-3 bg-gray-900/95 backdrop-blur-sm">
      <div className="flex items-center justify-between max-w-full sm:max-w-4xl mx-auto">
        {/* Botão de voltar ou ícone do robô na extrema esquerda */}
        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border border-cyan-400/30">
          {showBackButton ? (
            <button
              onClick={handleGoBack}
              className="text-cyan-400 hover:text-cyan-300 transition-colors duration-200"
              title="Voltar"
            >
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Bot size={18} className="text-cyan-400" />
          )}
        </div>
        
        {/* Conteúdo centralizado */}
        <div className="text-center">
          <h1 className="text-base sm:text-xl font-bold hologram-text text-gradient">
            J A R V I X
          </h1>
          <p className="text-[10px] sm:text-xs text-cyan-400/80">
          (beta)-DɅVY Flow 
          </p>
        </div>
        
        {/* Controles à direita */}
        <div className="flex items-center gap-2 sm:gap-3">
          {messageCount > 0 ? (
            // Quando há mensagens: mostrar lixeira
            <button
              onClick={onClearChat}
              className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
              title="Limpar conversa"
            >
              <Trash2 size={16} />
            </button>
          ) : (
            // Quando não há mensagens: mostrar engrenagem com menu dropdown
            <div className="relative">
              <button
                onClick={handleSettingsClick}
                className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
                title="Configurações"
              >
                <Settings size={16} />
              </button>
              
              {/* Menu dropdown */}
              {showSettingsMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-lg z-50">
                  <button
                    onClick={handleShowHistory}
                    className="w-full flex items-center gap-3 px-4 py-3 text-cyan-200 hover:bg-cyan-500/20 transition-all duration-200 rounded-lg"
                  >
                    <History size={16} />
                    <span className="text-sm font-medium">Histórico</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-cyan-200 hover:bg-cyan-500/20 transition-all duration-200 rounded-lg"
                  >
                    <LogOut size={16} />
                    <span className="text-sm font-medium">Sair</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay para fechar menu quando clicar fora */}
      {showSettingsMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSettingsMenu(false)}
        />
      )}
    </header>
  );
};