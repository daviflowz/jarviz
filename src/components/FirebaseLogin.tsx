import React, { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from "firebase/auth";
import { Bot } from "lucide-react";

export const FirebaseLogin: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  if (user) {
    return null; // Quando logado, não mostra a tela de login
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Efeito de grade tecnológica de fundo */}
      <div className="absolute inset-0 tech-grid opacity-20" />
      <div className="relative z-10 flex flex-col items-center w-full max-w-xs sm:max-w-md md:max-w-lg pt-8 sm:pt-16">
        {/* Logo estilizada */}
        <div className="mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto jarvis-glow backdrop-blur-sm border border-cyan-400/30">
            {/* Logo Jarvis: Robôzinho */}
            <Bot size={56} className="text-cyan-400 sm:w-20 sm:h-20 md:w-28 md:h-28" />
          </div>
        </div>
        {/* Título estilizado */}
        <h1 className="text-3xl sm:text-4xl font-bold hologram-text text-gradient mb-2 tracking-wider text-center">JARVIS</h1>
        <p className="text-cyan-300/80 text-sm sm:text-base font-medium leading-relaxed max-w-xs sm:max-w-sm mx-auto mb-8 text-center">
          Faça login para acessar o assistente inteligente.
        </p>
        {/* Botão de login com Google */}
        <button
          onClick={handleLogin}
          className="flex items-center gap-3 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 border border-cyan-400/40 text-cyan-200 font-semibold px-7 py-3 rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:bg-cyan-900/30 hover:border-cyan-300/70 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 backdrop-blur-sm"
        >
          <svg width="24" height="24" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M47.5 24.5C47.5 22.6 47.3 20.8 47 19H24V29.1H37.6C36.9 32.2 34.8 34.7 31.9 36.3V42.1H39.5C44 38.1 47.5 32.1 47.5 24.5Z" fill="#4285F4"/>
              <path d="M24 48C30.6 48 36.1 45.9 39.5 42.1L31.9 36.3C30.1 37.4 27.9 38.1 24 38.1C17.7 38.1 12.2 34.1 10.3 28.7H2.4V34.7C5.8 41.1 14.1 48 24 48Z" fill="#34A853"/>
              <path d="M10.3 28.7C9.7 27.1 9.4 25.4 9.4 23.6C9.4 21.8 9.7 20.1 10.3 18.5V12.5H2.4C0.8 15.6 0 19.1 0 23.6C0 28.1 0.8 31.6 2.4 34.7L10.3 28.7Z" fill="#FBBC05"/>
              <path d="M24 9.9C27.7 9.9 30.2 11.5 31.6 12.8L39.6 5.1C36.1 1.8 30.6 0 24 0C14.1 0 5.8 6.9 2.4 12.5L10.3 18.5C12.2 13.1 17.7 9.9 24 9.9Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <rect width="48" height="48" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          <span className="text-cyan-100 font-bold text-base sm:text-lg tracking-wide drop-shadow">Entrar com Google</span>
        </button>
      </div>
    </div>
  );
}; 