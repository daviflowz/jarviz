interface SearchResult {
  title: string;
  snippet: string;
  link: string;
}

class WebSearchService {
  private readonly API_KEY = 'AIzaSyCBNtW8gMngS7RpWZeGv0DrWoaCwY_Moig';
  private readonly SEARCH_ENGINE_ID = '017576662512468239146:omuauf_lfve';

  async searchWeb(query: string): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${this.API_KEY}&cx=${this.SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&num=5`
      );

      if (!response.ok) {
        throw new Error(`Erro na pesquisa: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items) {
        return [];
      }

      return data.items.map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        link: item.link
      }));
    } catch (error) {
      console.error('Erro na pesquisa web:', error);
      return [];
    }
  }

  async getCurrentTime(): Promise<string> {
    const now = new Date();
    return now.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async getWeather(city: string = 'São Paulo'): Promise<string> {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},BR&appid=YOUR_WEATHER_API_KEY&units=metric&lang=pt_br`
      );
      
      if (!response.ok) {
        return `Não foi possível obter o clima para ${city}`;
      }

      const data = await response.json();
      const temp = Math.round(data.main.temp);
      const description = data.weather[0].description;
      
      return `Em ${city}: ${temp}°C, ${description}`;
    } catch (error) {
      return `Não foi possível obter informações do clima`;
    }
  }
}

export const webSearchService = new WebSearchService(); 