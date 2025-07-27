import React from 'react';
import { Trash2, Settings, Bot } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat, messageCount }) => {
  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-cyan-500/30 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Ícone do robô na extrema esquerda */}
        <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-cyan-400/30">
          <Bot size={20} className="text-cyan-400" />
        </div>
        
        {/* Conteúdo centralizado */}
        <div className="text-center">
          <h1 className="text-xl font-bold hologram-text text-gradient">
            J A R V I S
          </h1>
          <p className="text-xs text-cyan-400/80">
          (beta)-DɅVY Flow 
          </p>
        </div>
        
        {/* Controles à direita */}
        <div className="flex items-center gap-3">
          {messageCount > 0 ? (
            // Quando há mensagens: mostrar lixeira
            <button
              onClick={onClearChat}
              className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
              title="Limpar conversa"
            >
              <Trash2 size={18} />
            </button>
          ) : (
            // Quando não há mensagens: mostrar engrenagem
            <button
              className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/30"
              title="Configurações"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};