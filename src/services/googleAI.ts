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
    model: 'gemini-2.5-flash',
    generationConfig: {
      maxOutputTokens: 200, // Aumentar um pouco para conversas mais naturais
      temperature: 0.8, // Mais natural para conversas longas
    }
  });
  private chatHistory: Message[] = [];
  private conversationSummary: string = '';

  async sendMessage(message: string): Promise<string> {
    try {
      // Sistema inteligente de contexto para conversas longas
      let contextToUse = '';
      
      if (this.chatHistory.length <= 8) {
        // Conversa curta: usar histórico completo (rápido)
        contextToUse = this.chatHistory
          .map(msg => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content}`)
          .join('\n');
      } else {
        // Conversa longa: usar resumo + últimas 4 mensagens (memória + velocidade)
        const recentContext = this.chatHistory
          .slice(-4)
          .map(msg => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content}`)
          .join('\n');
        
        contextToUse = this.conversationSummary ? 
          `Resumo anterior: ${this.conversationSummary}\n\nContexto recente:\n${recentContext}` :
          recentContext;
      }

      const prompt = `Jarvis: assistente profissional, sem emojis, respostas diretas mas conversacionais para chat longo.
${contextToUse ? `Contexto:\n${contextToUse}\n` : ''}Usuário: ${message}
Jarvis:`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

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

      // Gerenciar memória inteligente para conversas longas
      if (this.chatHistory.length > 16) {
        await this.optimizeMemory();
      }

      return text;
    } catch (error) {
      console.error('Erro ao enviar mensagem para Google AI:', error);
      throw new Error('Não foi possível processar sua mensagem. Tente novamente.');
    }
  }

  private async optimizeMemory() {
    try {
      // Criar resumo das mensagens antigas (mantém contexto)
      const oldMessages = this.chatHistory.slice(0, -8);
      const summaryText = oldMessages
        .map(msg => `${msg.role === 'user' ? 'U' : 'A'}: ${msg.content}`)
        .join('\n');

      // Gerar resumo conciso da conversa anterior
      const summaryPrompt = `Resuma esta conversa em 2-3 frases mantendo pontos importantes:
${summaryText}

Resumo:`;

      const result = await this.model.generateContent(summaryPrompt);
      const summary = await result.response;
      this.conversationSummary = summary.text();

      // Manter apenas as últimas 8 mensagens + resumo
      this.chatHistory = this.chatHistory.slice(-8);
      
      console.log('Memória otimizada - resumo criado:', this.conversationSummary);
    } catch (error) {
      console.error('Erro ao otimizar memória:', error);
      // Fallback: manter apenas últimas 12 mensagens
      this.chatHistory = this.chatHistory.slice(-12);
    }
  }

  async textToSpeech(text: string): Promise<Blob> {
    try {
      const response = await fetch('https://tts-service-850542229344.southamerica-east1.run.app/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error(`Erro na API de TTS: ${response.status} - ${response.statusText}`);
      }

      return await response.blob(); // Retorna o blob como no ChatMessage
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