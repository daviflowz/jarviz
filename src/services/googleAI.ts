import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyDjunWvcLsfzl5ZFrLVcZh7YGC22DyHm4E';

const genAI = new GoogleGenerativeAI(API_KEY);

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GoogleAIService {
  private model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  private chatHistory: ChatMessage[] = [];

  async sendMessage(message: string): Promise<string> {
    try {
      // Criar contexto da conversa para o modelo
      const context = this.chatHistory
        .slice(-10) // Pegar apenas as últimas 10 mensagens para não exceder limites
        .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Assistente'}: ${msg.content}`)
        .join('\n');

      const prompt = `Você é um assistente virtual amigável e prestativo. Responda de forma conversacional, útil e empática. 

Contexto da conversa anterior:
${context}

Nova mensagem do usuário: ${message}

Resposta:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Adicionar mensagens ao histórico
      const userMessage: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date()
      };

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };

      this.chatHistory.push(userMessage, assistantMessage);

      return text;
    } catch (error) {
      console.error('Erro ao enviar mensagem para Google AI:', error);
      throw new Error('Não foi possível processar sua mensagem. Tente novamente.');
    }
  }

  getChatHistory(): ChatMessage[] {
    return this.chatHistory;
  }

  clearHistory(): void {
    this.chatHistory = [];
  }
}

export const googleAIService = new GoogleAIService();