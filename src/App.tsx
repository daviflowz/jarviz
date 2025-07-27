import React, { useEffect, useState } from "react";
import { FirebaseLogin } from "./components/FirebaseLogin";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatContainer } from "./components/ChatContainer";
import { JarvisScreen } from "./components/JarvisScreen";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [screen, setScreen] = useState<'chat' | 'jarvis'>('chat');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
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
