import { GoogleGenerativeAI } from '@google/generative-ai';
import stringSimilarity from 'string-similarity';
import { realTimeSearchService } from './realTimeSearch';
import { db } from '../firebaseConfig';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs,
  deleteDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';

const API_KEY = 'AIzaSyDjunWvcLsfzl5ZFrLVcZh7YGC22DyHm4E';

const genAI = new GoogleGenerativeAI(API_KEY);

// Configurações de limites
const USER_LIMITS = {
  dailyRequests: 100,      // 100 requests/dia por usuário
  monthlyTokens: 50000,    // 50k tokens/mês por usuário
  maxMessageLength: 500    // 500 caracteres por mensagem
};

// Cache para respostas similares
const responseCache = new Map();

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class GoogleAIService {
  private chatHistory: Message[] = [];
  private greetingIndex = 0;
  private conversationContext: string = '';
  private contextEntities: Map<string, string> = new Map(); // Para rastrear entidades mencionadas
  private userId: string | null = null;
  private isInitialized = false;
  
  // Array de saudações variadas
  private greetings = [
    "Oi! Tudo bem? Como posso te ajudar hoje?",
    "Olá! Em que posso ser útil?",
    "Oi! Aqui estou, pronto para ajudar!",
    "Olá! Como posso te auxiliar?",
    "Oi! Tudo certo? Como posso te ajudar?",
    "Olá! Em que posso colaborar?",
    "Oi! Estou aqui para ajudar!",
    "Olá! Como posso ser útil hoje?",
    "Oi! Pronto para ajudar!",
    "Olá! Em que posso te auxiliar?",
    "Oi! Aqui estou para te auxiliar!",
    "Olá! Como posso ser útil?",
    "Oi! Estou à disposição!",
    "Olá! Em que posso ajudar?",
    "Oi! Pronto para colaborar!",
    "Olá! Como posso te servir?",
    "Oi! Aqui para ajudar!",
    "Olá! Em que posso ser útil?",
    "Oi! Pronto para auxiliar!",
    "Olá! Como posso ajudar?"
  ];

  // Inicializar serviço com usuário
  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    this.isInitialized = true; // Marcar como inicializado primeiro
    
    try {
      console.log('🚀 Inicializando serviço para usuário:', userId);
      
      console.log('📚 Carregando histórico do usuário...');
      await this.loadUserHistory();
      console.log('🏷️ Carregando entidades de contexto...');
      await this.loadContextEntities();
      console.log('✅ Serviço inicializado com sucesso para usuário:', userId);
    } catch (error) {
      console.error('❌ Erro ao carregar dados do Firestore:', error);
      // Mesmo com erro, o serviço está inicializado
      console.log('⚠️ Serviço inicializado (modo offline):', userId);
    }
  }

  // Helper para log de erro
  private logError(context: string, error: unknown): void {
    console.error(`❌ ${context}:`, error);
    
    // Log detalhado do erro
    if (error instanceof Error) {
      console.error('🔍 Detalhes do erro:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    } else if (typeof error === 'object' && error !== null) {
      console.error('🔍 Detalhes do erro:', {
        code: (error as any)?.code,
        message: (error as any)?.message,
        details: (error as any)?.details,
        status: (error as any)?.status
      });
    }
  }

  // Salvar mensagem no Firestore
  async saveMessageToFirestore(message: Message): Promise<void> {
    if (!this.userId) {
      console.log('❌ saveMessageToFirestore: userId não definido');
      return;
    }

    try {
      console.log('📝 Salvando mensagem no Firestore:', message.content.substring(0, 50) + '...');
      const messageData = {
        ...message,
        timestamp: serverTimestamp(),
        userId: this.userId
      };

      console.log('📊 Dados da mensagem:', messageData);
      
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao salvar no Firestore')), 10000)
      );
      
      const savePromise = addDoc(collection(db, 'messages'), messageData);
      const docRef = await Promise.race([savePromise, timeoutPromise]) as any;
      
      console.log('✅ Mensagem salva no Firestore com ID:', docRef.id);
    } catch (error) {
      this.logError('Erro ao salvar mensagem no Firestore', error);
      console.log('⚠️ Continuando sem salvar no Firestore');
    }
  }

  // Salvar entidade de contexto no Firestore
  async saveContextEntity(key: string, value: string): Promise<void> {
    if (!this.userId) {
      console.log('❌ saveContextEntity: userId não definido');
      return;
    }

    try {
      console.log('🏷️ Salvando entidade de contexto:', key, '=', value);
      const entityData = {
        key,
        value,
        userId: this.userId,
        lastMentioned: serverTimestamp(),
        mentionCount: 1
      };

      // Verificar se já existe
      const entityRef = doc(db, 'contextEntities', `${this.userId}_${key}`);
      const entityDoc = await getDoc(entityRef);

      if (entityDoc.exists()) {
        console.log('🔄 Atualizando entidade existente:', key);
        // Atualizar contador e data
        await updateDoc(entityRef, {
          mentionCount: entityDoc.data().mentionCount + 1,
          lastMentioned: serverTimestamp()
        });
      } else {
        console.log('🆕 Criando nova entidade:', key);
        // Criar nova entidade
        await setDoc(entityRef, entityData);
      }
      console.log('✅ Entidade salva com sucesso:', key);
    } catch (error) {
      this.logError('Erro ao salvar entidade de contexto', error);
    }
  }

  // Carregar histórico do usuário do Firestore
  async loadUserHistory(): Promise<Message[]> {
    if (!this.userId) {
      console.log('❌ loadUserHistory: userId não definido');
      return [];
    }

    try {
      console.log('📚 Carregando histórico do usuário:', this.userId);
      
      // Adicionar timeout para evitar travamentos
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout ao carregar histórico')), 15000)
      );
      
      // Usar getDocs diretamente sem query complexa para evitar listeners
      const messagesRef = collection(db, 'messages');
      const querySnapshot = await Promise.race([
        getDocs(messagesRef),
        timeoutPromise
      ]) as any;
      
      console.log('📊 Query executada, documentos encontrados:', querySnapshot.size);
      
      const messages: Message[] = [];

      querySnapshot.forEach((doc: any) => {
        const data = doc.data();
        // Filtrar apenas mensagens do usuário atual
        if (data.userId === this.userId) {
          messages.push({
            id: doc.id,
            role: data.role,
            content: data.content,
            timestamp: data.timestamp?.toDate() || new Date()
          });
        }
      });

      // Ordenar por timestamp (mais antigas primeiro) e limitar a 50
      messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const limitedMessages = messages.slice(-50);
      this.chatHistory = limitedMessages;
      
      console.log('✅ Histórico carregado:', limitedMessages.length, 'mensagens');
      return limitedMessages;
    } catch (error) {
      this.logError('Erro ao carregar histórico', error);
      console.log('⚠️ Continuando sem histórico do Firestore');
      return [];
    }
  }

  // Carregar entidades de contexto do Firestore
  async loadContextEntities(): Promise<void> {
    if (!this.userId) {
      console.log('❌ loadContextEntities: userId não definido');
      return;
    }

    try {
      console.log('🏷️ Carregando entidades de contexto para usuário:', this.userId);
      
      // Usar getDocs diretamente sem query complexa para evitar listeners
      const entitiesRef = collection(db, 'contextEntities');
      const querySnapshot = await getDocs(entitiesRef);
      console.log('📊 Entidades encontradas:', querySnapshot.size);
      
      this.contextEntities.clear();

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar apenas entidades do usuário atual
        if (data.userId === this.userId) {
          this.contextEntities.set(data.key, data.value);
        }
      });

      console.log('✅ Entidades de contexto carregadas:', this.contextEntities.size);
    } catch (error) {
      this.logError('Erro ao carregar entidades de contexto', error);
    }
  }

  // Limpar histórico do usuário (Firestore + memória)
  async clearUserHistory(): Promise<void> {
    if (!this.userId) return;

    try {
      // Limpar mensagens do Firestore
      const messagesRef = collection(db, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      
      const deletePromises = messagesSnapshot.docs
        .filter(doc => doc.data().userId === this.userId)
        .map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Limpar entidades de contexto do Firestore
      const entitiesRef = collection(db, 'contextEntities');
      const entitiesSnapshot = await getDocs(entitiesRef);
      
      const deleteEntityPromises = entitiesSnapshot.docs
        .filter(doc => doc.data().userId === this.userId)
        .map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteEntityPromises);

      // Limpar memória
      this.chatHistory = [];
      this.contextEntities.clear();

      console.log('✅ Histórico do usuário limpo');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
    }
  }

  // Verificar limites do usuário
  async checkUserLimits(): Promise<{ canProceed: boolean; reason?: string }> {
    if (!this.userId) return { canProceed: true };

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Usar getDocs diretamente sem query complexa para evitar listeners
      const usageRef = collection(db, 'usage');
      const usageSnapshot = await getDocs(usageRef);
      
      let dailyRequests = 0;
      let monthlyTokens = 0;

      usageSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar apenas dados do usuário atual e de hoje
        if (data.userId === this.userId && data.date && data.date.toDate() >= today) {
          dailyRequests += data.requests || 0;
          monthlyTokens += data.tokens || 0;
        }
      });

      if (dailyRequests >= USER_LIMITS.dailyRequests) {
        return { canProceed: false, reason: 'Limite diário atingido' };
      }

      if (monthlyTokens >= USER_LIMITS.monthlyTokens) {
        return { canProceed: false, reason: 'Limite mensal de tokens atingido' };
      }

      return { canProceed: true };
    } catch (error) {
      console.error('Erro ao verificar limites:', error);
      return { canProceed: true };
    }
  }

  // Atualizar contadores de uso
  async updateUsage(tokensUsed: number): Promise<void> {
    if (!this.userId) return;

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageRef = doc(db, 'usage', `${this.userId}_${today.toISOString().split('T')[0]}`);
      const usageDoc = await getDoc(usageRef);

      if (usageDoc.exists()) {
        await updateDoc(usageRef, {
          requests: (usageDoc.data().requests || 0) + 1,
          tokens: (usageDoc.data().tokens || 0) + tokensUsed,
          lastUpdated: serverTimestamp()
        });
      } else {
        await setDoc(usageRef, {
          userId: this.userId,
          date: today,
          requests: 1,
          tokens: tokensUsed,
          lastUpdated: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar uso:', error);
    }
  }

  // Extrair entidades do contexto (pessoas, lugares, coisas)
  private extractEntities(text: string): Map<string, string> {
    const entities = new Map<string, string>();
    
    // Padrões para identificar entidades
    const patterns = [
      // Pessoas (nomes próprios)
      /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g,
      // Lugares (cidades, países)
      /\b([A-Z][a-z]+(?: [A-Z][a-z]+)*)\b/g,
      // Organizações
      /\b([A-Z][A-Z]+)\b/g,
      // Pronomes que podem se referir a entidades
      /\b(ele|ela|eles|elas|este|esta|isso|aquilo)\b/gi
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(match => {
          if (match.length > 2) { // Ignorar palavras muito curtas
            entities.set(match.toLowerCase(), match);
          }
        });
      }
    });

    return entities;
  }

  // Resolver referências de contexto
  private resolveContextReferences(message: string): string {
    let resolvedMessage = message;
    
    // Verificar se há pronomes que precisam de contexto
    const pronouns = ['ele', 'ela', 'eles', 'elas', 'este', 'esta', 'isso', 'aquilo'];
    const hasPronouns = pronouns.some(pronoun => 
      message.toLowerCase().includes(pronoun)
    );

    if (hasPronouns && this.chatHistory.length > 0) {
      // Buscar a última entidade mencionada
      const lastUserMessage = this.chatHistory
        .filter(msg => msg.role === 'user')
        .slice(-3) // Últimas 3 mensagens do usuário
        .reverse()
        .find(msg => {
          const entities = this.extractEntities(msg.content);
          return entities.size > 0;
        });

      if (lastUserMessage) {
        const entities = this.extractEntities(lastUserMessage.content);
        const lastEntity = Array.from(entities.values())[0];
        
        if (lastEntity) {
          // Substituir pronomes por entidades quando apropriado
          resolvedMessage = resolvedMessage.replace(/\bele\b/gi, lastEntity);
          resolvedMessage = resolvedMessage.replace(/\bela\b/gi, lastEntity);
        }
      }
    }

    return resolvedMessage;
  }

  // Gerar hash para cache
  generateCacheKey(message: string): string {
    return message.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  // Verificar cache
  getCachedResponse(message: string): string | null {
    const cacheKey = this.generateCacheKey(message);
    const cached = responseCache.get(cacheKey);
    
    // NÃO USAR CACHE PARA NADA - sempre buscar dados atualizados
    const timeSensitiveKeywords = [
      'hoje', 'agora', 'atual', 'recente', 'notícia', 'noticia', 'notícias', 'noticias',
      'clima', 'temperatura', 'tempo', 'data', 'evento', 'acontecimento', 'parada',
      'festival', 'show', 'concerto', 'encontro', 'reunião', 'reuniao', 'amanhã', 'amanha',
      'ontem', 'semana', 'mês', 'mes', 'ano', '2024', '2025', 'previsão', 'previsao'
    ];
    
    const lowerMessage = message.toLowerCase();
    const isTimeSensitive = timeSensitiveKeywords.some(keyword => 
      lowerMessage.includes(keyword)
    );
    
    // SEMPRE ignorar cache para informações sensíveis ao tempo
    if (isTimeSensitive) {
      console.log('Informação sensível ao tempo detectada, IGNORANDO CACHE COMPLETAMENTE');
      return null;
    }
    
    // Para outras informações, usar cache por apenas 10 minutos
    if (cached && Date.now() - cached.timestamp < 600000) { // 10 minutos
      return cached.response;
    }
    
    return null;
  }

  // Obter saudação variada
  getRandomGreeting(): string {
    const greeting = this.greetings[this.greetingIndex];
    this.greetingIndex = (this.greetingIndex + 1) % this.greetings.length;
    return greeting;
  }

  // Verificar comandos especiais
  async handleSpecialCommands(message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    
    // Comandos de tempo
    if (lowerMessage.includes('que horas') || lowerMessage.includes('que hora')) {
      const now = new Date();
      return `Agora são ${now.toLocaleTimeString('pt-BR')}`;
    }

    // Comandos de data
    if (lowerMessage.includes('que dia') || lowerMessage.includes('que data')) {
      const now = new Date();
      return `Hoje é ${now.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}`;
    }

    // Comandos de matemática
    if (lowerMessage.includes('calcule') || lowerMessage.includes('quanto é')) {
      try {
        const mathExpression = message.replace(/[^0-9+\-*/().]/g, '');
        // eslint-disable-next-line no-eval
        const result = eval(mathExpression);
        return `O resultado é: ${result}`;
      } catch (error) {
        return 'Desculpe, não consegui calcular essa expressão.';
      }
    }

    // Comandos de "o que eu perguntei"
    if (lowerMessage.includes('o que eu perguntei') || lowerMessage.includes('o que eu te perguntei')) {
      if (this.chatHistory.length > 0) {
        const lastUserMessage = this.chatHistory
          .filter(msg => msg.role === 'user')
          .pop();
        if (lastUserMessage) {
          return `Você perguntou: "${lastUserMessage.content}". Como posso te ajudar com isso?`;
        }
      }
      return 'Não encontrei uma pergunta anterior no histórico. Pode me fazer sua pergunta?';
    }

    // Comandos de clima via Google Search
    if (lowerMessage.includes('graus') || lowerMessage.includes('temperatura') || lowerMessage.includes('clima') || lowerMessage.includes('fazendo')) {
      const cityMatch = message.match(/(?:em|de|para)\s+([a-zA-ZÀ-ÿ\s]+?)(?:\?|$|,)/i);
      const city = cityMatch ? cityMatch[1].trim() : 'São Paulo';
      
      try {
        console.log('Buscando clima atualizado para:', city);
        const results = await realTimeSearchService.searchWeb(`clima ${city} hoje agora temperatura atualizada`);
        console.log('Resultados do clima:', results);
        
        if (results.length > 0) {
          const topResult = results[0];
          return `**Clima atual em ${city}:**
**${topResult.title}**
${topResult.snippet}
Link: ${topResult.link}

Pesquisa em tempo real via Google!`;
        } else {
          return `Não consegui encontrar informações atualizadas do clima para ${city}. Consulte Climatempo.com para dados em tempo real.`;
        }
      } catch (error) {
        console.error('Erro ao buscar clima:', error);
        return `Erro ao buscar clima atualizado para ${city}. Tente consultar Climatempo.com diretamente.`;
      }
    }

    // Comandos de notícias via Google Search com filtros melhorados
    if (lowerMessage.includes('notícia') || lowerMessage.includes('noticia') || lowerMessage.includes('noticias') || lowerMessage.includes('notícias')) {
      // Extrair o tópico da pergunta, se especificado
      let query = 'brasil'; // padrão
      
      if (lowerMessage.includes('mundo') || lowerMessage.includes('internacional')) {
        query = 'mundo';
      } else if (lowerMessage.includes('brasil') || lowerMessage.includes('brasileira')) {
        query = 'brasil';
      } else {
        // Tentar extrair tópico específico da mensagem
        const queryMatch = message.match(/(?:sobre|de|notícia\s+)([a-zA-ZÀ-ÿ\s]+?)(?:\?|$|,)/i);
        if (queryMatch) {
          query = queryMatch[1].trim();
        }
      }
      
      try {
        console.log('Buscando notícias para:', query);
        const results = await realTimeSearchService.searchWeb(`notícias ${query} hoje atualizadas`);
        console.log('Resultados de notícias:', results);
        
        if (results.length > 0) {
          const topResult = results[0];
          const dateInfo = topResult.date ? ` (${topResult.date})` : '';
          return `**Notícias sobre ${query}:**
**${topResult.title}**${dateInfo}
${topResult.snippet}
Link: ${topResult.link}

Pesquisa em tempo real via Google!`;
        } else {
          return `Não encontrei nenhuma notícia relevante sobre esse assunto hoje. Tente ser mais específico.`;
        }
      } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        return `Erro ao buscar notícias. Tente novamente!`;
      }
    }

    // Comandos de pesquisa web em tempo real
    if (lowerMessage.startsWith('pesquise ') || lowerMessage.startsWith('busque ') || lowerMessage.startsWith('procure ')) {
      const searchQuery = message.replace(/^pesquise\s+|^busque\s+|^procure\s+/gi, '').trim();
      if (searchQuery) {
        try {
          console.log('Buscando pesquisa para:', searchQuery);
          
          // Adicionar "atualizado" ou "hoje" para pesquisas que podem ser sobre eventos
          const timeKeywords = ['parada', 'evento', 'festival', 'show', 'concerto', 'encontro'];
          const hasTimeKeyword = timeKeywords.some(keyword => 
            searchQuery.toLowerCase().includes(keyword)
          );
          
          const enhancedQuery = hasTimeKeyword ? `${searchQuery} atualizado hoje` : searchQuery;
          const results = await realTimeSearchService.searchWeb(enhancedQuery);
          console.log('Resultados da pesquisa:', results);
          
          if (results.length > 0) {
            const topResult = results[0];
            const dateInfo = topResult.date ? ` (${topResult.date})` : '';
            return `**Pesquisa sobre "${searchQuery}":**
**${topResult.title}**${dateInfo}
${topResult.snippet}
Link: ${topResult.link}

Pesquisa em tempo real via Google!`;
          } else {
            return `Não encontrei nenhuma notícia relevante sobre esse assunto hoje. Tente ser mais específico.`;
          }
        } catch (error) {
          console.error('Erro na pesquisa:', error);
          return `Erro na pesquisa. Tente novamente!`;
        }
      }
    }

    return null;
  }

  // Salvar no cache
  saveToCache(message: string, response: string): void {
    const cacheKey = this.generateCacheKey(message);
    responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });

    // Limpar cache antigo (manter só 100 entradas)
    if (responseCache.size > 100) {
      const entries = Array.from(responseCache.entries());
      entries.slice(0, 50).forEach(([key]) => responseCache.delete(key));
    }
  }

  // Processar com Google AI (método original)
  async processWithGoogleAI(message: string): Promise<string> {
    try {
      // Verificar data atual para garantir informações atualizadas
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentDay = currentDate.getDate();
      
      console.log(`Data atual: ${currentDay}/${currentMonth}/${currentYear}`);
      
      // Resolver referências de contexto
      const resolvedMessage = this.resolveContextReferences(message);
      
      // Extrair e armazenar entidades do contexto
      const messageEntities = this.extractEntities(resolvedMessage);
      messageEntities.forEach((entity, key) => {
        this.contextEntities.set(key, entity);
        // Salvar entidade no Firestore
        try {
          this.saveContextEntity(key, entity);
        } catch (error) {
          console.error('Erro ao salvar entidade de contexto:', error);
        }
      });
      
      // Função para detectar mudança de tópico (mais conservadora)
      const detectTopicChange = (newMessage: string, history: Message[]): boolean => {
        if (history.length === 0) return false;
        
        const lastMessage = history[history.length - 1].content;
        const similarity = stringSimilarity.compareTwoStrings(
          newMessage.toLowerCase(),
          lastMessage.toLowerCase()
        );
        
        return similarity < 0.05; // Se similaridade < 5%, considera mudança de tópico
      };

      // Detectar mudança de tópico (apenas se for muito diferente)
      const isTopicChange = detectTopicChange(resolvedMessage, this.chatHistory);
      
      // Se mudou de tópico drasticamente, limpar histórico (mas manter mais contexto)
      if (isTopicChange && this.chatHistory.length > 15) {
        this.chatHistory = this.chatHistory.slice(-8); // Manter apenas as últimas 8
      }

      // Adicionar mensagem do usuário ao histórico
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: resolvedMessage,
        timestamp: new Date()
      };
      this.chatHistory.push(userMessage);
      
      // Salvar mensagem no Firestore
      try {
        await this.saveMessageToFirestore(userMessage);
      } catch (error) {
        console.error('Erro ao salvar mensagem do usuário:', error);
      }

      // Manter apenas as últimas 30 mensagens para contexto
      if (this.chatHistory.length > 30) {
        this.chatHistory = this.chatHistory.slice(-30);
      }

      // Preparar contexto para o modelo
      const recentMessages = this.chatHistory.slice(-15); // Últimas 15 mensagens
      const context = recentMessages
        .map(msg => `${msg.role === 'user' ? 'Usuário' : 'Jarvis'}: ${msg.content}`)
        .join('\n\n');
      
      // Atualizar contexto da conversa
      this.conversationContext = context;
      
      console.log('Contexto da conversa:', context);

      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

      const prompt = `
Você é o **JARVIS**, um assistente de IA de última geração com capacidades avançadas.

**DATA ATUAL:** ${currentDay}/${currentMonth}/${currentYear}

**CONTEXTO DA CONVERSA ANTERIOR:**
${context}

**ENTIDADES MENCIONADAS NO CONTEXTO:**
${Array.from(this.contextEntities.entries()).map(([key, value]) => `- ${key}: ${value}`).join('\n')}

**CAPACIDADES AVANÇADAS:**
- **Pesquisa em tempo real** (Google Search)
- **Notícias atualizadas** (via Google)
- **Informações de clima** (via Google)
- **Cálculos complexos** (matemática, estatísticas)
- **IA e Machine Learning** (explicações técnicas)
- **Programação** (todas as linguagens)
- **Ciências avançadas** (física quântica, biologia molecular)
- **Dados e informações** (qualquer assunto via Google)

**INSTRUÇÕES CRÍTICAS:**
1. **RESPONDA DIRETAMENTE** com informações precisas e atualizadas
2. **Use dados em tempo real** quando disponíveis
3. **Seja específico e técnico** quando apropriado
4. **Demonstre conhecimento profundo** em todas as áreas
5. **MANTENHA O CONTEXTO** - SEMPRE lembre do que foi dito anteriormente
6. **NÃO USE EMOJIS** - mantenha respostas limpas e profissionais
7. **SEJA CONCISO** - dê respostas diretas e objetivas
8. **SÓ EXPANDA** se o usuário pedir mais detalhes
9. **NUNCA USE DADOS ANTIGOS** - sempre busque informações atualizadas
10. **SEMPRE VERIFIQUE** se a informação está atualizada antes de responder
11. **LEMBRE-SE** de referências anteriores na conversa
12. **USE O CONTEXTO** para entender o que o usuário está pedindo
13. **RESOLVA REFERÊNCIAS** - se o usuário disser "ele", "ela", "isso", use o contexto para entender a quem se refere
14. **SE NÃO SOUBER** a quem uma referência se refere, peça esclarecimento

**ESTILO DE RESPOSTA:**
- **Profissional mas acessível**
- **Técnico quando necessário**
- **Atualizado e preciso**
- **Com fontes quando possível**
- **Interativo e envolvente**
- **SEM EMOJIS**
- **CONCISO E DIRETO**

**REGRAS DE CONTEXTO:**
- **SEMPRE** leia o contexto anterior antes de responder
- **REFIRA-SE** a informações mencionadas anteriormente
- **NÃO** peça informações que já foram fornecidas
- **USE** o contexto para entender referências implícitas
- **MANTENHA** a continuidade da conversa
- **RESOLVA** pronomes e referências vagas usando o contexto
- **SE** não conseguir resolver uma referência, peça esclarecimento

**REGRAS DE CONCISÃO:**
- **Máximo 2-3 frases** para respostas simples
- **Máximo 1 parágrafo** para explicações
- **Só expanda** se o usuário pedir "mais detalhes", "explique melhor", "fale mais"
- **Foque no essencial** - evite informações desnecessárias
- **Seja direto** - vá direto ao ponto

**REGRAS DE ATUALIZAÇÃO CRÍTICAS:**
- **NUNCA** use informações de datas passadas como se fossem atuais
- **SEMPRE** verifique se eventos mencionados já aconteceram
- **SE** a informação for antiga, busque dados atualizados
- **INDIQUE** claramente quando a informação é de uma data específica
- **PREFIRA** informações em tempo real sobre dados históricos
- **SEMPRE** busque dados atualizados para clima, notícias, eventos
- **NUNCA** use dados de 2024 como se fossem atuais em 2025
- **VERIFIQUE** sempre a data atual antes de responder
- **SE** não conseguir dados atualizados, ADMITA a limitação

**EXEMPLOS DE RESPOSTAS CONCISAS:**
- Para clima: "**Clima em São Paulo:** 25°C, ensolarado. Fonte: Google"
- Para notícias: "**Notícias:** [título principal + fonte]"
- Para pesquisa: "**Pesquisa:** [resultado principal + link]"
- Para IA: "**Machine Learning:** [conceito principal em 1-2 frases]"

**IMPORTANTE:** 
- **SEMPRE** dê respostas específicas e precisas
- **USE** dados reais quando disponíveis
- **SEJA** técnico quando apropriado
- **MANTENHA** o alto nível de conhecimento
- **NUNCA USE EMOJIS**
- **SEJA CONCISO** - só expanda se solicitado
- **VERIFIQUE DATAS** - não use informações desatualizadas
- **LEMBRE DO CONTEXTO** - use informações anteriores
- **RESOLVA REFERÊNCIAS** - use o contexto para entender "ele", "ela", "isso"

**IMPORTANTE FINAL:**
- **SEMPRE** busque dados em tempo real
- **NUNCA** use informações antigas como atuais
- **ADMITA** quando não conseguir dados atualizados
- **VERIFIQUE** sempre a data atual antes de responder
- **SE** os dados forem de 2024, diga que são antigos
- **DATA ATUAL É:** ${currentDay}/${currentMonth}/${currentYear}
- **NUNCA** use dados de 2024 como se fossem atuais em 2025
- **SEMPRE** verifique se as datas mencionadas são atuais
- **RESOLVA** referências de contexto antes de responder

Responda como um assistente de IA de última geração, com precisão e conhecimento avançado, SEM EMOJIS e de forma CONCISA, SEMPRE buscando dados atualizados e ADMITINDO limitações quando não conseguir informações em tempo real.
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log('Resposta do Jarvis:', response);

      // Adicionar resposta ao histórico
      const aiMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      this.chatHistory.push(aiMessage);
      
      // Salvar resposta no Firestore
      try {
        await this.saveMessageToFirestore(aiMessage);
      } catch (error) {
        console.error('Erro ao salvar resposta do Jarvis:', error);
      }

      return response;
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      throw new Error('Não foi possível processar sua mensagem. Tente novamente.');
    }
  }

  // Enviar mensagem com limites
  async sendMessage(message: string): Promise<string> {
    try {
      // Verificar se o serviço foi inicializado
      if (!this.isInitialized) {
        throw new Error('Serviço não inicializado. Faça login primeiro.');
      }

      // Verificar tamanho da mensagem
      if (message.length > USER_LIMITS.maxMessageLength) {
        throw new Error(`Mensagem muito longa. Máximo ${USER_LIMITS.maxMessageLength} caracteres.`);
      }

      // Verificar cache primeiro
      const cachedResponse = this.getCachedResponse(message);
      if (cachedResponse) {
        try {
          await this.updateUsage(50); // Estimativa para resposta cacheada
        } catch (error) {
          console.error('Erro ao atualizar uso (cache):', error);
        }
        return cachedResponse;
      }

      // Verificar comandos especiais
      const specialCommands = await this.handleSpecialCommands(message);
      if (specialCommands) {
        return specialCommands;
      }

      // Verificar se é uma pergunta comum
      const commonQuestions: Record<string, string> = {
        'oi': this.getRandomGreeting(),
        'olá': this.getRandomGreeting(),
        'oi jarvis': this.getRandomGreeting(),
        'olá jarvis': this.getRandomGreeting(),
        'ajuda': 'Estou aqui para ajudar! Pode me fazer qualquer pergunta.',
        'quem é você': 'Sou o Jarvis, seu assistente de IA avançado. Tenho conhecimentos em tecnologia, ciências, história e muito mais. Como posso te ajudar?',
        'bom dia': 'Bom dia! Como posso te ajudar hoje?',
        'boa tarde': 'Boa tarde! Em que posso ser útil?',
        'boa noite': 'Boa noite! Como posso te auxiliar?'
      };

      const normalizedMessage = message.toLowerCase().trim();
      if (commonQuestions[normalizedMessage]) {
        const response = commonQuestions[normalizedMessage];
        this.saveToCache(message, response);
        try {
          await this.updateUsage(20); // Resposta pré-definida
        } catch (error) {
          console.error('Erro ao atualizar uso (pergunta comum):', error);
        }
        return response;
      }

      // Processar com Google AI
      const response = await this.processWithGoogleAI(message);
      
      // Salvar no cache
      this.saveToCache(message, response);
      
      // Atualizar uso (estimativa de tokens)
      try {
        const estimatedTokens = Math.ceil((message.length + response.length) / 4);
        await this.updateUsage(estimatedTokens);
      } catch (error) {
        console.error('Erro ao atualizar uso (Google AI):', error);
      }

      return response;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      throw error;
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

  async clearHistory(): Promise<void> {
    await this.clearUserHistory();
  }

  // Obter estatísticas do usuário
  async getUserStats(): Promise<{
    dailyRequests: number;
    monthlyTokens: number;
    totalMessages: number;
    limits: typeof USER_LIMITS;
  }> {
    if (!this.userId) {
      return {
        dailyRequests: 0,
        monthlyTokens: 0,
        totalMessages: 0,
        limits: USER_LIMITS
      };
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Usar getDocs diretamente sem query complexa para evitar listeners
      const usageRef = collection(db, 'usage');
      const usageSnapshot = await getDocs(usageRef);
      
      let dailyRequests = 0;
      let monthlyTokens = 0;

      usageSnapshot.forEach((doc) => {
        const data = doc.data();
        // Filtrar apenas dados do usuário atual e de hoje
        if (data.userId === this.userId && data.date && data.date.toDate() >= today) {
          dailyRequests += data.requests || 0;
          monthlyTokens += data.tokens || 0;
        }
      });

      return {
        dailyRequests,
        monthlyTokens,
        totalMessages: this.chatHistory.length,
        limits: USER_LIMITS
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        dailyRequests: 0,
        monthlyTokens: 0,
        totalMessages: 0,
        limits: USER_LIMITS
      };
    }
  }
}

export const googleAIService = new GoogleAIService();