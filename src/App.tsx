import React, { useState } from 'react';
import { ChatContainer } from './components/ChatContainer';
import { JarvisScreen } from './components/JarvisScreen';

type Screen = 'chat' | 'jarvis';
type TransitionState = 'idle' | 'transitioning';

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('chat');
  const [transitionState, setTransitionState] = useState<TransitionState>('idle');
  const [nextScreen, setNextScreen] = useState<Screen | null>(null);

  const navigateToJarvis = () => {
    if (transitionState === 'idle') {
      setTransitionState('transitioning');
      setNextScreen('jarvis');
      
      // Transição contínua da logo
      setTimeout(() => {
        setCurrentScreen('jarvis');
        setTransitionState('idle');
        setNextScreen(null);
      }, 500);
    }
  };

  const navigateToChat = () => {
    if (transitionState === 'idle') {
      setTransitionState('transitioning');
      setNextScreen('chat');
      
      // Transição contínua da logo
      setTimeout(() => {
        setCurrentScreen('chat');
        setTransitionState('idle');
        setNextScreen(null);
      }, 500);
    }
  };

  return (
    <div className="App overflow-hidden">
      {currentScreen === 'chat' && (
        <ChatContainer 
          onNavigateToJarvis={navigateToJarvis}
          isTransitioning={transitionState === 'transitioning'}
          nextScreen={nextScreen}
        />
      )}
      {currentScreen === 'jarvis' && (
        <JarvisScreen 
          onNavigateToChat={navigateToChat}
          isTransitioning={transitionState === 'transitioning'}
          nextScreen={nextScreen}
        />
      )}
    </div>
  );
}

export default App;
