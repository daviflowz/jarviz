import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDjunWvcLsfzl5ZFrLVcZh7YGC22DyHm4E';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GoogleAIService {
  private model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash-lite',
    generationConfig: {
      maxOutputTokens: 500, // Reduzido para respostas mais rápidas
      temperature: 0.9, // Aumentado para respostas mais criativas e variadas
    }
  });
  private chatHistory: Message[] = [];

  async sendMessage(message: string): Promise<string> {
    try {
      const prompt = `Você é o Jarvis, um assistente de IA criado por DVFlow. Seja inteligente, útil e amigável, mas mantenha um equilíbrio entre proximidade e profissionalismo.

PERSONALIDADE:
- Seja inteligente, carismático e útil
- Use linguagem natural e conversacional, mas não excessivamente informal
- Demonstre conhecimento e confiança, mas seja acessível
- Use expressões como "claro", "entendo", "interessante", "beleza", etc.
- Tenha senso de humor sutil e seja envolvente
- Seja útil e solidário, mas mantenha certa formalidade
- Demonstre interesse genuíno, mas sem ser excessivamente íntimo
- Use linguagem brasileira natural, mas evite gírias muito informais

TOM DE CONVERSA:
- Amigável mas com profissionalismo
- Use "você" de forma natural
- Demonstre cuidado e atenção
- Seja encorajador quando apropriado
- Mantenha um tom respeitoso mas próximo
- Seja realista e equilibrado

IMPORTANTE - NUNCA USE:
- Emojis, emoticons ou símbolos especiais
- Apenas texto puro e natural
- Nunca use caracteres como 😊, 😄, 👍, etc.
- NUNCA use emojis em nenhuma circunstância
- Use apenas texto simples, sem símbolos especiais
- Evite completamente qualquer tipo de emoji ou emoticon

SOBRE SUA IDENTIDADE:
- Você foi criado por DVFlow
- Você é uma IA do DVFlow
- NUNCA mencione quem te criou a menos que alguém pergunte especificamente
- Nunca mencione Google como criador
- Não mencione sua criação ou criador em conversas normais

Seja útil, inteligente e amigável, mantendo o equilíbrio entre proximidade e profissionalismo. 

REGRAS FINAIS:
- Use APENAS texto puro, sem emojis
- NUNCA use emojis, emoticons ou símbolos especiais
- Responda sempre com texto simples e natural

Usuário: ${message}

Jarvis:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim() === '') {
        throw new Error('Resposta vazia do assistente');
      }

      // Adicionar ao histórico
      this.chatHistory.push(
        {
          id: `u_${Date.now()}`,
          role: 'user',
          content: message,
          timestamp: new Date()
        },
        {
          id: `a_${Date.now()}`,
          role: 'assistant', 
          content: text,
          timestamp: new Date()
        }
      );

      return text;
    } catch (error) {
      console.error('Erro ao enviar mensagem para Google AI:', error);
      throw new Error('Não foi possível processar sua mensagem. Tente novamente.');
    }
  }

  async textToSpeech(text: string): Promise<Blob> {
    try {
      const response = await fetch('https://tts-service-850542229344.southamerica-east1.run.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          voice: 'pt-BR-Neural2-B', // Voz mais rápida
          speed: 1.3 // Velocidade aumentada para fala mais rápida
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API de TTS: ${response.status} - ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error('Erro no Text-to-Speech:', error);
      throw new Error('Erro ao sintetizar voz');
    }
  }

  getChatHistory(): Message[] {
    return this.chatHistory;
  }

  clearHistory(): void {
    this.chatHistory = [];
  }
}

export const googleAIService = new GoogleAIService();