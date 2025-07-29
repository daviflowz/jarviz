# 🔑 Configuração de APIs para Jarvis Avançado

## APIs Necessárias

### 1. **NewsAPI** (Notícias em tempo real)
- **URL**: https://newsapi.org/
- **Chave**: `YOUR_NEWS_API_KEY`
- **Uso**: Buscar notícias atualizadas
- **Limite**: 100 requests/dia (gratuito)

### 2. **OpenWeatherMap** (Clima em tempo real)
- **URL**: https://openweathermap.org/
- **Chave**: `YOUR_WEATHER_API_KEY`
- **Uso**: Dados de temperatura, umidade, vento
- **Limite**: 1000 requests/dia (gratuito)

### 3. **Google Custom Search** (Pesquisa web)
- **URL**: https://developers.google.com/custom-search
- **Chave**: `AIzaSyDjunWvcLsfzl5ZFrLVcZh7YGC22DyHm4E` (já configurada)
- **Uso**: Pesquisa web em tempo real
- **Limite**: 100 requests/dia (gratuito)

### 4. **CoinGecko** (Criptomoedas)
- **URL**: https://www.coingecko.com/en/api
- **Chave**: Não necessária (gratuito)
- **Uso**: Preços de Bitcoin e outras criptos
- **Limite**: 50 requests/minuto

### 5. **Twelve Data** (Ações)
- **URL**: https://twelvedata.com/
- **Chave**: `YOUR_STOCK_API_KEY`
- **Uso**: Dados de ações e índices
- **Limite**: 800 requests/dia (gratuito)

### 6. **TomTom** (Trânsito)
- **URL**: https://developer.tomtom.com/
- **Chave**: `YOUR_TRAFFIC_API_KEY`
- **Uso**: Informações de trânsito
- **Limite**: 2500 requests/dia (gratuito)

## Como Configurar

1. **Registre-se** nas APIs necessárias
2. **Obtenha as chaves** de cada serviço
3. **Substitua** as chaves no arquivo `realTimeSearch.ts`
4. **Teste** as funcionalidades

## Funcionalidades Avançadas

### 🌡️ Clima em Tempo Real
```
"quantos graus está fazendo em São Paulo?"
"temperatura em Rio de Janeiro"
"clima em Brasília"
```

### 📰 Notícias Atualizadas
```
"me dê uma notícia sobre tecnologia"
"última notícia do Brasil"
"notícias sobre economia"
```

### ₿ Criptomoedas
```
"preço do bitcoin"
"valor do ethereum"
"criptomoedas hoje"
```

### 🔍 Pesquisa Web
```
"pesquise sobre inteligência artificial"
"busque informações sobre React"
"procure sobre física quântica"
```

### 📊 Ações (quando configurado)
```
"preço da Petrobras"
"valor da Vale"
"índice Bovespa"
```

## Status Atual

- ✅ **Google Search**: Configurado
- ❌ **NewsAPI**: Precisa de chave
- ❌ **OpenWeatherMap**: Precisa de chave
- ✅ **CoinGecko**: Funcionando
- ❌ **Twelve Data**: Precisa de chave
- ❌ **TomTom**: Precisa de chave

## Próximos Passos

1. Configure as APIs necessárias
2. Teste cada funcionalidade
3. Ajuste os limites conforme necessário
4. Implemente cache para otimizar performance 