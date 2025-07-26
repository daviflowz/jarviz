import React from 'react';
import { MessageCircle, Settings, Trash2 } from 'lucide-react';

interface HeaderProps {
  onClearChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onClearChat, messageCount }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pinterest-red to-pinterest-red-dark rounded-2xl flex items-center justify-center shadow-lg">
            <MessageCircle size={20} className="text-white" />
          </div>
          
          <div>
            <h1 className="text-xl font-bold text-gradient">
              Chat AI
            </h1>
            <p className="text-xs text-gray-500">
              Powered by Google Gemini
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {messageCount > 0 && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {messageCount} mensagens
            </span>
          )}
          
          <button
            onClick={onClearChat}
            disabled={messageCount === 0}
            className="p-2 text-gray-400 hover:text-pinterest-red hover:bg-pinterest-red/10 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Limpar conversa"
          >
            <Trash2 size={18} />
          </button>
          
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
            title="Configurações"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};