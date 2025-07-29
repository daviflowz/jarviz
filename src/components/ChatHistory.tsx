import React from 'react';
import { X, MessageCircle, User, Bot } from 'lucide-react';
import { Message } from '../services/googleAI';

interface ChatHistoryProps {
  messages: Message[];
  onClose: () => void;
  onLoadConversation: (messages: Message[]) => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, onClose, onLoadConversation }) => {
  // Agrupar mensagens por data
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateKey = date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const groupedMessages = groupMessagesByDate(messages);

  const handleLoadConversation = (conversationMessages: Message[]) => {
    onLoadConversation(conversationMessages);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-900/95 backdrop-blur-sm border border-cyan-500/30 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/30">
          <h2 className="text-xl font-bold text-cyan-400">Histórico de Conversas</h2>
          <button
            onClick={onClose}
            className="p-2 text-cyan-400/60 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-lg transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle size={48} className="text-cyan-400/60 mx-auto mb-4" />
              <p className="text-cyan-200/80">Nenhuma conversa encontrada</p>
              <p className="text-cyan-200/60 text-sm mt-2">Suas conversas aparecerão aqui</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMessages).map(([date, dayMessages]) => (
                <div key={date} className="space-y-3">
                  <h3 className="text-cyan-400 font-medium text-sm border-b border-cyan-500/20 pb-2">
                    {date}
                  </h3>
                  
                  {/* Resumo da conversa */}
                  <div className="bg-gray-800/50 rounded-lg p-4 border border-cyan-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-cyan-400" />
                        <span className="text-cyan-200 text-sm font-medium">
                          {dayMessages.length} mensagens
                        </span>
                      </div>
                      <button
                        onClick={() => handleLoadConversation(dayMessages)}
                        className="px-3 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 rounded-lg transition-all duration-200 border border-cyan-500/30"
                      >
                        Carregar
                      </button>
                    </div>
                    
                    {/* Preview das mensagens */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {dayMessages.slice(0, 3).map((message, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs">
                          <div className="flex-shrink-0 mt-1">
                            {message.role === 'user' ? (
                              <User size={12} className="text-cyan-400" />
                            ) : (
                              <Bot size={12} className="text-cyan-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-cyan-200/80 truncate">
                              {message.content.length > 100 
                                ? message.content.substring(0, 100) + '...'
                                : message.content
                              }
                            </p>
                            <p className="text-cyan-200/40 text-xs mt-1">
                              {new Date(message.timestamp).toLocaleTimeString('pt-BR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                      {dayMessages.length > 3 && (
                        <p className="text-cyan-200/60 text-xs italic">
                          +{dayMessages.length - 3} mensagens mais...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 