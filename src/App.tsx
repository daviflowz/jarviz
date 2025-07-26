import React, { useState, useEffect } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { JarvisScreen } from './components/JarvisScreen';

type Screen = 'chat' | 'jarvis';
type TransitionState = 'idle' | 'exiting' | 'entering';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat');
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [nextScreen, setNextScreen] = useState<Screen | null>(null);

  const navigateToJarvis = () => {
    if (transitionState === 'idle') {
      setTransitionState('exiting');
      setNextScreen('jarvis');
    }
  };

  const navigateToChat = () => {
    if (transitionState === 'idle') {
      setTransitionState('exiting');
      setNextScreen('chat');
    }
  };

  useEffect(() => {
    if (transitionState === 'exiting' && nextScreen) {
      const timer = setTimeout(() => {
        setCurrentScreen(nextScreen);
        setTransitionState('entering');
        setNextScreen(null);
      }, 300); // Duração sincronizada com CSS

      return () => clearTimeout(timer);
    } else if (transitionState === 'entering') {
      const timer = setTimeout(() => {
        setTransitionState('idle');
      }, 300); // Duração sincronizada com CSS

      return () => clearTimeout(timer);
    }
  }, [transitionState, nextScreen]);

  const getScreenClasses = () => {
    const baseClasses = "transition-all duration-300 ease-in-out min-h-screen";
    
    switch (transitionState) {
      case 'exiting':
        return `${baseClasses} animate-screen-exit`;
      case 'entering':
        return `${baseClasses} animate-screen-enter`;
      case 'idle':
      default:
        return `${baseClasses} opacity-100 scale-100 transform translate-y-0`;
    }
  };

  return (
    <div className="App overflow-x-hidden">
      <div className={getScreenClasses()}>
        {currentScreen === 'chat' && (
          <ChatContainer onNavigateToJarvis={navigateToJarvis} />
        )}
        {currentScreen === 'jarvis' && (
          <JarvisScreen onNavigateToChat={navigateToChat} />
        )}
      </div>
    </div>
  );
}

export default App;
