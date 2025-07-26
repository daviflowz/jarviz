import React from 'react';
import { MessageCircle, Sparkles, Heart, Zap } from 'lucide-react';

interface EmptyStateProps {
  onSuggestedMessage: (message: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestedMessage }) => {
  const suggestions = [
    {
      icon: <Sparkles size={20} />,
      title: "Seja criativo",
      message: "Me conte sobre seus hobbies favoritos",
      color: "from-purple-400 to-pink-400"
    },
    {
      icon: <Heart size={20} />,
      title: "Conversas casuais",
      message: "Como foi seu dia hoje?",
      color: "from-pink-400 to-red-400"
    },
    {
      icon: <Zap size={20} />,
      title: "Aprenda algo novo",
      message: "Explique-me sobre inteligência artificial",
      color: "from-yellow-400 to-orange-400"
    }
  ];

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto animate-fade-in">
        {/* Ícone principal */}
        <div className="w-24 h-24 bg-gradient-to-br from-pinterest-red to-pinterest-red-dark rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce-subtle">
          <MessageCircle size={40} className="text-white" />
        </div>
        
        {/* Título e descrição */}
        <h2 className="text-2xl font-bold text-gray-800 mb-3">
          Olá! Como posso ajudar?
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Comece uma conversa digitando uma mensagem ou escolha uma das sugestões abaixo.
        </p>
        
        {/* Cards de sugestões */}
        <div className="grid gap-4 mb-6">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSuggestedMessage(suggestion.message)}
              className="group relative overflow-hidden bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 text-left"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-r ${suggestion.color} rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                  {suggestion.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 group-hover:text-pinterest-red transition-colors duration-200">
                    {suggestion.title}
                  </h3>
                  <p className="text-sm text-gray-500 group-hover:text-gray-600 transition-colors duration-200">
                    {suggestion.message}
                  </p>
                </div>
              </div>
              
              {/* Efeito de hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-pinterest-red/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
          ))}
        </div>
        
        {/* Recursos do app */}
        <div className="flex justify-center gap-6 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Online
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full" />
            IA Avançada
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full" />
            Seguro
          </div>
        </div>
      </div>
    </div>
  );
};