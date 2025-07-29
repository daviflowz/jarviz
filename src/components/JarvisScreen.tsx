import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, ArrowLeft } from 'lucide-react';
import { googleAIService } from '../services/googleAI';

interface JarvisScreenProps {
  onNavigateToChat: () => void;
  onNavigateToWelcome: () => void;
  isTransitioning?: boolean;
  nextScreen?: 'chat' | 'jarvis' | null;
}

type ConversationState = 'idle' | 'listening' | 'processing' | 'speaking';

export const JarvisScreen: React.FC<JarvisScreenProps> = ({ 
  onNavigateToChat, 
  onNavigateToWelcome, 
  isTransitioning = false, 
  nextScreen = null 
}) => {
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [isActive, setIsActive] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  
  // Referência para controlar todos os áudios ativos
  const activeAudiosRef = useRef<HTMLAudioElement[]>([]);
  
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearListeningTimeout = useCallback(() => {
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
      listeningTimeoutRef.current = null;
    }
  }, []);

  const startListeningTimeout = useCallback(() => {
    // Limpar timeout anterior se existir
    if (listeningTimeoutRef.current) {
      clearTimeout(listeningTimeoutRef.current);
    }
    
    // Iniciar timeout de 10 segundos quando começar a ouvir
    listeningTimeoutRef.current = setTimeout(() => {
      if (isActive && conversationState === 'listening') {
        console.log('Timeout: Nenhuma voz detectada em 10 segundos, encerrando conversa');
        
        // Parar diretamente aqui em vez de chamar a função
        setIsActive(false);
        setConversationState('idle');
        
        // Parar reconhecimento de voz
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
            recognitionRef.current.abort();
          } catch (error) {
            console.error('Erro ao parar reconhecimento:', error);
          }
        }
        
        // Parar síntese de voz IMEDIATAMENTE
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
          window.speechSynthesis.cancel();
        }
        
        // Limpar timeouts
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        clearListeningTimeout();
        
        // Parar TODOS os áudios ativos controlados pelo sistema
        activeAudiosRef.current.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
          audio.src = '';
        });
        activeAudiosRef.current = [];
        
        console.log('Sistema completamente parado por timeout');
      }
    }, 10000);
  }, [isActive, conversationState, clearListeningTimeout]);

  // Carregar vozes disponíveis
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        // Forçar carregamento das vozes
        window.speechSynthesis.getVoices();
      }
    };

    loadVoices();
    
    // Algumas vezes as vozes não carregam imediatamente
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Inicializar automaticamente quando o componente montar
  useEffect(() => {
    if (!hasInitialized) {
      setHasInitialized(true);
      
      // Pequeno delay para garantir que tudo está carregado
      setTimeout(() => {
        // Iniciar conversa primeiro
        startContinuousConversation();
        
        // Escolher saudação aleatória
        // const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
        
        // Falar a saudação após um pequeno delay
        setTimeout(() => {
          if (isActive) {
            setConversationState('speaking');
            
            // Remover o trecho que chama googleAIService.textToSpeech("Olá! Estou aqui para conversar com você.") e toda a lógica associada à fala inicial.
          }
        }, 500); // Reduzido de 1000ms para 500ms
      }, 500); // Reduzido de 1000ms para 500ms
    }
  }, [hasInitialized, isActive]);

  // Inicializar Speech Recognition
  useEffect(() => {
          const speakResponse = (text: string) => {
        if (isActive) {
          // Verificar novamente se ainda está ativo antes de falar
          if (!isActive) {
            console.log('Sistema não está mais ativo, cancelando fala');
            return;
          }
          
          // Garantir que paramos qualquer reconhecimento antes de falar
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch (error) {
              // Ignorar erros
            }
          }

          setConversationState('speaking');
        
        // Parar qualquer fala anterior do navegador
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        
                  // Usar Google Cloud Text-to-Speech com voz Neural2-B
          googleAIService.textToSpeech(text)
            .then(audioBlob => {
              if (isActive) {
                // Criar URL do blob de áudio (igual ao ChatMessage)
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                // Adicionar à lista de áudios ativos
                activeAudiosRef.current.push(audio);
                
                audio.onended = () => {
                  URL.revokeObjectURL(audioUrl); // Limpar memória
                  // Remover da lista de áudios ativos
                  activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
                  if (isActive) {
                    // Reduzir tempo de espera para volta mais rápida
                    setTimeout(() => {
                      if (isActive) {
                        setConversationState('listening');
                      }
                    }, 150); // Reduzido de 300ms para 150ms
                  }
                };
                
                audio.onerror = () => {
                  URL.revokeObjectURL(audioUrl);
                  // Remover da lista de áudios ativos
                  activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
                  console.error('Erro ao reproduzir áudio');
                  if (isActive) {
                    setTimeout(() => {
                      if (isActive) {
                        setConversationState('listening');
                      }
                    }, 300); // Reduzido de 800ms para 300ms
                  }
                };
                
                // Iniciar reprodução imediatamente
                audio.play().catch(error => {
                  console.error('Erro ao iniciar reprodução:', error);
                  URL.revokeObjectURL(audioUrl);
                  // Remover da lista de áudios ativos
                  activeAudiosRef.current = activeAudiosRef.current.filter(a => a !== audio);
                  if (isActive) {
                    setTimeout(() => {
                      if (isActive) {
                        setConversationState('listening');
                      }
                    }, 300); // Reduzido de 800ms para 300ms
                  }
                });
              }
            })
          .catch(error => {
            console.error('Erro no TTS:', error);
            // Fallback para voz do navegador em caso de erro
            if (isActive && 'speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.lang = 'pt-BR';
              utterance.rate = 1.0;
              utterance.pitch = 1.0;
              utterance.volume = 0.9;
              
              utterance.onend = () => {
                if (isActive) {
                  setTimeout(() => {
                    if (isActive) {
                      setConversationState('listening');
                    }
                  }, 800);
                }
              };
              
              window.speechSynthesis.speak(utterance);
            }
          });
      }
    };

    const startListening = () => {
      // Só iniciar se estiver ativo E no estado de listening
      if (recognitionRef.current && isActive && conversationState === 'listening') {
        try {
          recognitionRef.current.start();
          // Iniciar timeout quando começar a ouvir
          startListeningTimeout();
        } catch (error) {
          // Se já estiver rodando, ignorar o erro
          if (error instanceof Error && error.name !== 'InvalidStateError') {
            console.error('Erro ao iniciar reconhecimento:', error);
          }
        }
      }
    };

    const handleUserSpeech = async (userMessage: string) => {
      if (!userMessage.trim() || !isActive) return;

      // Limpar timeout pois detectamos voz
      clearListeningTimeout();

      // Parar qualquer reconhecimento ativo antes de processar
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          // Ignorar erros ao parar
        }
      }

      setConversationState('processing');
      
      try {
        // Processar mensagem e TTS em paralelo para máxima velocidade
        const [aiResponse] = await Promise.all([
          googleAIService.sendMessage(userMessage),
          // Preload: começar a preparar o TTS service (conexão)
          fetch('https://tts-service-850542229344.southamerica-east1.run.app/tts', {
            method: 'OPTIONS' // Preflight para aquecer conexão
          }).catch(() => {}) // Ignorar erros do preflight
        ]);
        
        // Falar a resposta imediatamente se ainda estiver ativo
        if (isActive) {
          speakResponse(aiResponse);
        }
        
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
        if (isActive) {
          const errorMessage = 'Erro ao processar. Tente novamente.'; // Mensagem mais curta
          speakResponse(errorMessage);
        }
      }
    };

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'pt-BR';

      recognition.onstart = () => {
        // Só atualizar estado se realmente deveria estar ouvindo
        if (isActive && conversationState === 'listening') {
          console.log('Reconhecimento iniciado - timeout de 10s ativo');
        }
      };

      recognition.onresult = (event: any) => {
        if (isActive && conversationState === 'listening') {
          // Limpar timeout pois detectamos voz
          clearListeningTimeout();
          
          const transcript = event.results[0][0].transcript;
          console.log('Voz detectada:', transcript);
          handleUserSpeech(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Erro no reconhecimento de voz:', event.error);
        // Limpar timeout em caso de erro
        clearListeningTimeout();
        
        // Se o erro for de permissão negada, parar completamente
        if (event.error === 'not-allowed' || event.error === 'permission-denied') {
          console.log('Permissão de microfone negada - parando reconhecimento');
          setPermissionDenied(true);
          setIsActive(false);
          setConversationState('idle');
          return;
        }
        
        // Tentar novamente apenas para outros tipos de erro
        if (isActive && conversationState === 'listening') {
          setTimeout(() => startListening(), 200);
        }
      };

      recognition.onend = () => {
        // Só reiniciar se estiver ativo E no estado listening
        if (isActive && conversationState === 'listening') {
          setTimeout(() => startListening(), 100);
        } else {
          // Limpar timeout se não for reiniciar
          clearListeningTimeout();
        }
      };

      recognitionRef.current = recognition;
    }

    // Iniciar listening apenas quando o estado mudar para 'listening' E permissão não foi negada
    if (conversationState === 'listening' && isActive && !permissionDenied) {
      const timer = setTimeout(() => startListening(), 100);
      return () => clearTimeout(timer);
    }

    return () => {
      const currentTimeout = timeoutRef.current;
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
      clearListeningTimeout(); // Limpar timeout de ouvir
    };
  }, [isActive, conversationState, permissionDenied, startListeningTimeout, clearListeningTimeout]);

  const startContinuousConversation = () => {
    // Resetar permissão negada quando tentar iniciar novamente
    setPermissionDenied(false);
    setIsActive(true);
    
    // Definir estado como listening - o useEffect vai cuidar do resto
    setConversationState('listening');
  };

  const stopContinuousConversation = () => {
    console.log('Parando conversa manualmente...');
    
    // Primeiro, definir como inativo para parar todos os ciclos
    setIsActive(false);
    setConversationState('idle');
    
    // Parar reconhecimento de voz
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (error) {
        console.error('Erro ao parar reconhecimento:', error);
      }
    }
    
    // Parar síntese de voz IMEDIATAMENTE
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }
    
    // Limpar timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearListeningTimeout(); // Limpar timeout de ouvir
    
    // Forçar parada IMEDIATA de qualquer áudio em reprodução
    const audios = document.querySelectorAll('audio');
    audios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load(); // Força recarregamento
    });
    
    // Parar qualquer fala em andamento do TTS
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    // Parar TODOS os áudios ativos controlados pelo sistema
    activeAudiosRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    });
    activeAudiosRef.current = []; // Limpar lista
    
    // Forçar parada de qualquer elemento de áudio criado pelo TTS
    const allAudios = document.querySelectorAll('audio');
    allAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
      audio.load(); // Força recarregamento
    });
    
    // Parar TODOS os elementos de áudio da página
    const allAudioElements = document.querySelectorAll('audio, video');
    allAudioElements.forEach(element => {
      if (element instanceof HTMLAudioElement || element instanceof HTMLVideoElement) {
        element.pause();
        element.currentTime = 0;
        element.src = '';
        element.load();
      }
    });
    
    // Garantir que o estado seja resetado corretamente
    setTimeout(() => {
      if (!isActive) {
        setConversationState('idle');
      }
    }, 100);
    
    console.log('Conversa parada manualmente');
  };

  const getStateText = () => {
    // Se permissão foi negada, mostrar mensagem específica
    if (permissionDenied) {
      return 'Microfone negado';
    }
    
    // Se não estiver ativo, não mostrar nenhum estado
    if (!isActive) {
      return '';
    }
    
    switch (conversationState) {
      case 'listening':
        return 'Ouvindo...';
      case 'processing':
        return 'Processando...';
      case 'speaking':
        return 'Falando...';
      default:
        return ''; // Sem texto no estado idle
    }
  };

  const getStateColor = () => {
    // Se permissão foi negada, usar cor vermelha
    if (permissionDenied) {
      return 'from-red-500/20 to-red-600/20 border-red-400/30';
    }
    
    // Se não estiver ativo, usar cor inativa
    if (!isActive) {
      return 'from-gray-500/20 to-gray-600/20 border-gray-400/30';
    }
    
    switch (conversationState) {
      case 'listening':
        return 'from-green-500/20 to-emerald-600/20 border-green-400/30';
      case 'processing':
        return 'from-yellow-500/20 to-orange-600/20 border-yellow-400/30';
      case 'speaking':
        return 'from-blue-500/20 to-indigo-600/20 border-blue-400/30';
      default:
        return 'from-cyan-500/20 to-blue-600/20 border-cyan-400/30';
    }
  };

  const handleBackNavigation = () => {
    console.log('Navegando de volta...');
    
    // Parar TUDO imediatamente
    stopContinuousConversation();
    
    // Forçar parada adicional de áudio
    setTimeout(() => {
      // Parar novamente para garantir
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      const audios = document.querySelectorAll('audio');
      audios.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';
      });
      
      onNavigateToWelcome();
    }, 200);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden px-4 py-8">
      {/* Botão de voltar */}
      <button
        onClick={handleBackNavigation}
        className="absolute top-6 left-6 z-20 w-12 h-12 bg-transparent hover:bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400/50 rounded-xl flex items-center justify-center transition-all duration-300 text-cyan-400/60 hover:text-cyan-300 backdrop-blur-sm"
        title="Voltar ao chat"
      >
        <ArrowLeft size={18} />
      </button>

      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      
      {/* Container principal centralizado */}
      <div className="text-center relative z-10 flex flex-col items-center justify-center w-full max-w-md sm:max-w-lg md:max-w-xl">
        
        {/* Logo principal com animações */}
        <div className="relative mb-12 sm:mb-16">
          <div 
            className={`w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 bg-gradient-to-br ${getStateColor()} rounded-full flex items-center justify-center mx-auto jarvis-glow backdrop-blur-sm cursor-pointer transition-all duration-500 hover:scale-105 ${isActive ? 'animate-pulse' : ''}`}
            onClick={isActive ? stopContinuousConversation : startContinuousConversation}
            title={isActive ? "Parar conversa contínua" : "Iniciar conversa contínua"}
          >
            <Bot size={90} className="text-cyan-400 sm:w-28 sm:h-28 md:w-32 md:h-32" />
          </div>
          
          {/* Animações dinâmicas baseadas no estado */}
          {isActive && (
            <>
              <div className="absolute inset-0 rounded-full border border-current animate-ping pointer-events-none opacity-40" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-4 rounded-full border border-current animate-ping pointer-events-none opacity-25" style={{ animationDuration: '1.8s', animationDelay: '0.2s' }} />
            </>
          )}
          
          {/* Círculos orbitais otimizados */}
          <div className={`absolute inset-0 animate-spin pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`} style={{ animationDuration: isActive ? '12s' : '25s' }}>
            <div className="absolute top-0 left-1/2 w-3 h-3 bg-cyan-400/70 rounded-full transform -translate-x-1/2 -translate-y-1" />
          </div>
          <div className={`absolute inset-0 animate-spin pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`} style={{ animationDuration: isActive ? '10s' : '20s', animationDirection: 'reverse' }}>
            <div className="absolute top-1/2 right-0 w-2 h-2 bg-blue-400/70 rounded-full transform translate-x-1 -translate-y-1/2" />
          </div>
          <div className={`absolute inset-0 animate-spin pointer-events-none transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-50'}`} style={{ animationDuration: isActive ? '15s' : '30s' }}>
            <div className="absolute bottom-0 left-1/4 w-2.5 h-2.5 bg-purple-400/70 rounded-full transform -translate-y-1" />
          </div>
        </div>
        
        {/* Título principal */}
        <div className="mb-8 sm:mb-10">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold hologram-text text-gradient leading-none tracking-wider">
            J.A.R.V.I.S
          </h1>
        </div>
        
        {/* Status da conversa - espaço reservado para evitar mudança de layout */}
        <div className="mb-8 sm:mb-10 h-12 flex items-center justify-center">
          {getStateText() && (
            <div className="inline-flex items-center gap-3 px-6 py-3 glass-effect rounded-full border border-cyan-500/30">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                conversationState === 'listening' ? 'bg-green-400' :
                conversationState === 'processing' ? 'bg-yellow-400' :
                conversationState === 'speaking' ? 'bg-blue-400' : 'bg-cyan-400'
              }`} />
              <span className="text-sm sm:text-base text-cyan-100 font-medium">
                {getStateText()}
              </span>
            </div>
          )}
        </div>
        
        {/* Indicador de sistema */}
        <div className="flex items-center gap-3 text-xs sm:text-sm text-cyan-400/60">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isActive ? 'bg-green-400' : 'bg-cyan-400'}`} />
            <span>{isActive ? 'Conversa Ativa' : 'Sistema Inicializado'}</span>
          </div>
          {isActive && (
            <>
              <div className="w-px h-4 bg-cyan-400/30" />
              <span className="text-cyan-400/40">Timeout: 10s</span>
            </>
          )}
        </div>
        

      </div>
    </div>
  );
}; 