import React, { useEffect, useState } from "react";
import { FirebaseLogin } from "./components/FirebaseLogin";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatContainer } from "./components/ChatContainer";
import { JarvisScreen } from "./components/JarvisScreen";
import { googleAIService } from "./services/googleAI";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'chat' | 'jarvis'>('chat');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          console.log('Inicializando serviço para usuário:', user.uid);
          // Inicializar o serviço do Google AI com o ID do usuário
          await googleAIService.initialize(user.uid);
          console.log('Serviço inicializado com sucesso');
        } catch (error) {
          console.error('Erro ao inicializar serviço:', error);
          // Mesmo com erro, permite usar o app
        }
      }
    });
    
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <FirebaseLogin />;
  }

  if (screen === 'jarvis') {
    return <JarvisScreen onNavigateToChat={() => setScreen('chat')} />;
  }

  return <ChatContainer onNavigateToJarvis={() => setScreen('jarvis')} />;
};

export default App;
