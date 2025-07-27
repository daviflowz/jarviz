import React, { useEffect, useState } from "react";
import { FirebaseLogin } from "./components/FirebaseLogin";
import { auth } from "./firebaseConfig";
import { onAuthStateChanged, User } from "firebase/auth";
import { ChatContainer } from "./components/ChatContainer";

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  if (!user) {
    return <FirebaseLogin />;
  }

  return <ChatContainer onNavigateToJarvis={() => {}} />;
};

export default App;
