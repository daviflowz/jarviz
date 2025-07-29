import React, { useEffect, useState } from "react";
import { FirebaseLogin } from "./components/FirebaseLogin";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatContainer } from "./components/ChatContainer";
import { JarvisScreen } from "./components/JarvisScreen";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { googleAIService } from "./services/googleAI";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'welcome' | 'chat' | 'jarvis'>('welcome');

  useEffect(() => {
    console.log('🔐 Inicializando autenticação Firebase...');
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('👤 Estado de autenticação mudou:', user ? `Usuário logado: ${user.uid}` : 'Usuário não logado');
      
      setUser(user);
      
      if (user) {
        try {
          console.log('🚀 Inicializando serviço para usuário:', user.uid);
          console.log('📧 Email do usuário:', user.email);
          console.log('🔑 Token de autenticação válido:', !!user.uid);
          
          // Inicializar o serviço do Google AI com o ID do usuário
          await googleAIService.initialize(user.uid);
          console.log('✅ Serviço inicializado com sucesso');
        } catch (error) {
          console.error('❌ Erro ao inicializar serviço:', error);
          // Mesmo com erro, permite usar o app
        }
      } else {
        console.log('👤 Usuário não autenticado, mostrando tela de login');
      }
    });
    
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <FirebaseLogin />;
  }

  if (screen === 'jarvis') {
    return <JarvisScreen onNavigateToChat={() => setScreen('chat')} onNavigateToWelcome={() => setScreen('welcome')} />;
  }

  if (screen === 'chat') {
    return <ChatContainer onNavigateToJarvis={() => setScreen('jarvis')} onNavigateToWelcome={() => setScreen('welcome')} />;
  }

  return <WelcomeScreen onNavigateToChat={() => setScreen('chat')} onNavigateToJarvis={() => setScreen('jarvis')} />;
};

export default App;
