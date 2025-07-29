interface SearchResult {
  title: string;
  snippet: string;
  link: string;
  date?: string;
  isNews?: boolean;
}

class RealTimeSearchService {
  private readonly GOOGLE_SEARCH_API_KEY = 'AIzaSyCBNtW8gMngS7RpWZeGv0DrWoaCwY_Moig';
  private readonly GOOGLE_SEARCH_ENGINE_ID = 'c3e876e20011f4a99';

  // Domínios de notícias confiáveis
  private readonly NEWS_DOMAINS = [
    'g1.globo.com', 'globo.com', 'oglobo.globo.com', 'extra.globo.com',
    'uol.com.br', 'noticias.uol.com.br', 'tilt.uol.com.br',
    'bbc.com', 'bbc.co.uk', 'bbc.com/portuguese',
    'cnn.com', 'cnnbrasil.com.br',
    'reuters.com', 'reuters.com.br',
    'bloomberg.com', 'bloomberg.com.br',
    'estadao.com.br', 'estadao.com',
    'folha.uol.com.br', 'folha.com',
    'correiobraziliense.com.br',
    'valor.com.br', 'valor.globo.com',
    'veja.abril.com.br', 'veja.com',
    'exame.com', 'exame.com.br',
    'terra.com.br', 'terra.com',
    'r7.com', 'noticias.r7.com',
    'band.uol.com.br', 'band.com.br',
    'recordtv.r7.com',
    'sbt.com.br', 'sbt.com',
    'metropoles.com',
    'correiobraziliense.com.br',
    'correio24horas.com.br',
    'bahianoticias.com.br',
    'atarde.uol.com.br',
    'tribunadabahia.com.br',
    'news.google.com',
    'noticias.google.com',
    'google.com/news',
    'yahoo.com/news',
    'msn.com/news',
    'bing.com/news'
  ];

  // Palavras-chave que indicam notícias
  private readonly NEWS_KEYWORDS = [
    'notícia', 'noticia', 'notícias', 'noticias', 'news',
    'reportagem', 'reportagem', 'reportagens',
    'política', 'politica', 'político', 'politico',
    'economia', 'econômico', 'economico',
    'tecnologia', 'tech', 'tecnológico', 'tecnologico',
    'esporte', 'esportes', 'futebol', 'basquete',
    'entretenimento', 'celebridade', 'celebridades',
    'saúde', 'saude', 'médico', 'medico',
    'educação', 'educacao', 'universidade',
    'meio ambiente', 'sustentabilidade',
    'internacional', 'mundo', 'global',
    'brasil', 'brasileiro', 'brasileira',
    'governo', 'presidente', 'ministro',
    'congresso', 'senado', 'câmara', 'camara',
    'eleição', 'eleicao', 'votação', 'votacao',
    'protesto', 'manifestação', 'manifestacao',
    'acidente', 'incidente', 'emergência', 'emergencia',
    'descoberta', 'pesquisa', 'estudo',
    'anúncio', 'anuncio', 'lançamento', 'lancamento'
  ];

  // Verificar se é um domínio de notícias
  private isNewsDomain(url: string): boolean {
    try {
      const domain = new URL(url).hostname.toLowerCase();
      return this.NEWS_DOMAINS.some(newsDomain => 
        domain.includes(newsDomain) || newsDomain.includes(domain)
      );
    } catch {
      return false;
    }
  }

  // Verificar se contém palavras-chave de notícias
  private hasNewsKeywords(text: string): boolean {
    const lowerText = text.toLowerCase();
    return this.NEWS_KEYWORDS.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  }

  // Extrair data do snippet ou metatags
  private extractDate(snippet: string, metatags?: any): string | null {
    // Padrões de data comuns
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{1,2}\.\d{1,2}\.\d{4})/g,
      /(\d{4}-\d{2}-\d{2})/g,
      /(\d{1,2} de [a-z]+ de \d{4})/gi,
      /(\d{1,2} [a-z]+ \d{4})/gi,
      /(hoje|ontem|amanhã|amanha)/gi
    ];

    // Tentar extrair do snippet
    for (const pattern of datePatterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[0];
      }
    }

    // Tentar extrair das metatags
    if (metatags) {
      const metaDate = metatags['article:published_time'] || 
                      metatags['og:updated_time'] || 
                      metatags['date'] ||
                      metatags['lastmod'];
      if (metaDate) {
        return metaDate;
      }
    }

    return null;
  }

  // Verificar se a data é recente (últimos 7 dias)
  private isRecentDate(dateStr: string): boolean {
    try {
      const now = new Date();
      const articleDate = new Date(dateStr);
      const diffTime = Math.abs(now.getTime() - articleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    } catch {
      return false;
    }
  }

  // Filtrar resultados de notícias
  private filterNewsResults(results: any[]): SearchResult[] {
    const filteredResults: SearchResult[] = [];

    for (const item of results) {
      const title = item.title || '';
      const snippet = item.snippet || '';
      const link = item.link || '';
      const metatags = item.pagemap?.metatags?.[0];

      // Ignorar links de redirecionamento
      if (link.includes('/sorry/') || 
          link.includes('redirect') || 
          link.includes('goo.gl') ||
          link.includes('bit.ly') ||
          link.includes('tinyurl.com')) {
        continue;
      }

      // Verificar se é notícia
      const isNewsDomain = this.isNewsDomain(link);
      const hasNewsKeywords = this.hasNewsKeywords(title + ' ' + snippet);
      
      if (!isNewsDomain && !hasNewsKeywords) {
        continue;
      }

      // Extrair data
      const date = this.extractDate(snippet, metatags);
      
      // Se tem data, verificar se é recente
      if (date && !this.isRecentDate(date)) {
        continue;
      }

      filteredResults.push({
        title,
        snippet,
        link,
        date: date || undefined,
        isNews: true
      });
    }

    return filteredResults;
  }

  // Pesquisa web em tempo real com filtros de notícias
  async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      console.log('Iniciando pesquisa web para:', query);
      
      // Adicionar termos para melhorar resultados de notícias
      const enhancedQuery = query.includes('notícia') || query.includes('noticia') 
        ? query 
        : `${query} notícias hoje atualizado`;
      
      const url = `https://www.googleapis.com/customsearch/v1?key=${this.GOOGLE_SEARCH_API_KEY}&cx=${this.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(enhancedQuery)}&num=10&dateRestrict=d7`;
      console.log('URL da pesquisa Google:', url);
      
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na resposta da API Google:', response.status, errorText);
        throw new Error(`Erro na pesquisa: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Resposta da API Google:', data);
      
      if (!data.items || data.items.length === 0) {
        console.log('Nenhum resultado encontrado no Google para:', query);
        return [];
      }

      // Filtrar resultados de notícias
      const filteredResults = this.filterNewsResults(data.items);
      console.log('Resultados filtrados:', filteredResults.length);
      
      return filteredResults;
    } catch (error) {
      console.error('Erro na pesquisa web:', error);
      return [];
    }
  }

  // Buscar informações específicas (clima, notícias, etc.) via Google
  async searchSpecificInfo(query: string): Promise<SearchResult[]> {
    return this.searchWeb(query);
  }
}

export const realTimeSearchService = new RealTimeSearchService(); 