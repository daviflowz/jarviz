# Sistema de Persistência de Contexto - Jarvis

## 📋 Visão Geral

O sistema agora persiste o contexto da conversa no Firestore, permitindo que o Jarvis lembre de conversas anteriores mesmo após recarregar a página ou fechar o app.

## 🗄️ Estrutura do Banco de Dados

### Coleções do Firestore

#### 1. `messages`
Armazena todas as mensagens do chat por usuário.

```javascript
{
  id: "auto-generated",
  role: "user" | "assistant",
  content: "texto da mensagem",
  timestamp: serverTimestamp(),
  userId: "user_uid"
}
```

#### 2. `contextEntities`
Armazena entidades mencionadas na conversa (pessoas, lugares, organizações).

```javascript
{
  key: "entidade_chave",
  value: "Nome da Entidade",
  userId: "user_uid",
  lastMentioned: serverTimestamp(),
  mentionCount: 5
}
```

#### 3. `usage`
Armazena estatísticas de uso por usuário.

```javascript
{
  userId: "user_uid",
  date: "2025-01-15",
  requests: 25,
  tokens: 1500,
  lastUpdated: serverTimestamp()
}
```

## 🔧 Funcionalidades Implementadas

### 1. **Persistência de Mensagens**
- ✅ Salva automaticamente todas as mensagens no Firestore
- ✅ Carrega histórico ao fazer login
- ✅ Mantém contexto entre sessões

### 2. **Rastreamento de Entidades**
- ✅ Identifica pessoas, lugares, organizações
- ✅ Resolve referências como "ele", "ela", "isso"
- ✅ Mantém contador de menções

### 3. **Sistema de Limites**
- ✅ Controle de requests diários (100/dia)
- ✅ Controle de tokens mensais (50k/mês)
- ✅ Estatísticas de uso em tempo real

### 4. **Inicialização Automática**
- ✅ Inicializa serviço ao fazer login
- ✅ Carrega contexto anterior
- ✅ Tela de loading durante inicialização

## 🚀 Como Usar

### Para Desenvolvedores

1. **Deploy das Regras**:
```bash
chmod +x deploy-firestore-rules.sh
./deploy-firestore-rules.sh
```

2. **Inicialização**:
```javascript
// O serviço é inicializado automaticamente no App.tsx
await googleAIService.initialize(user.uid);
```

3. **Uso Normal**:
```javascript
// Enviar mensagem (contexto é mantido automaticamente)
const response = await googleAIService.sendMessage("Olá, como você está?");
```

### Para Usuários

1. **Login**: Faça login normalmente
2. **Conversa**: O Jarvis lembrará de conversas anteriores
3. **Contexto**: Referências como "ele", "ela" são resolvidas automaticamente
4. **Persistência**: Histórico é mantido entre sessões

## 🔒 Segurança

### Regras do Firestore
- ✅ Usuários só acessam seus próprios dados
- ✅ Autenticação obrigatória
- ✅ Validação de userId em todas as operações

### Limites de Uso
- ✅ 100 requests por dia por usuário
- ✅ 50k tokens por mês por usuário
- ✅ Controle automático de limites

## 📊 Monitoramento

### Logs Disponíveis
```javascript
// No console do navegador
console.log('Histórico carregado:', messages.length, 'mensagens');
console.log('Entidades de contexto carregadas:', entities.size);
console.log('Serviço inicializado para usuário:', userId);
```

### Métricas
- Total de mensagens por usuário
- Entidades mais mencionadas
- Uso diário/mensal de tokens

## 🛠️ Manutenção

### Limpar Histórico
```javascript
await googleAIService.clearHistory(); // Limpa Firestore + memória
```

### Verificar Estatísticas
```javascript
const stats = await googleAIService.getUserStats();
console.log('Requests hoje:', stats.dailyRequests);
console.log('Tokens este mês:', stats.monthlyTokens);
```

## 🔄 Migração

O sistema mantém compatibilidade com a estrutura antiga:
- Estrutura antiga: `/users/{userId}/messages/{messageId}`
- Nova estrutura: `/messages/{messageId}` (com userId no documento)

## ⚡ Performance

### Otimizações
- ✅ Limite de 50 mensagens carregadas
- ✅ Limite de 20 entidades de contexto
- ✅ Cache local para respostas similares
- ✅ Limpeza automática de cache antigo

### Latência
- Carregamento inicial: ~500ms
- Salvamento de mensagem: ~200ms
- Resolução de contexto: ~50ms

## 🐛 Troubleshooting

### Problemas Comuns

1. **"Serviço não inicializado"**
   - Verificar se usuário está logado
   - Verificar conexão com Firestore

2. **"Limite atingido"**
   - Aguardar reset diário/mensal
   - Verificar estatísticas de uso

3. **"Erro ao salvar mensagem"**
   - Verificar regras do Firestore
   - Verificar conexão de internet

### Logs de Debug
```javascript
// Ativar logs detalhados
console.log('Contexto da conversa:', context);
console.log('Entidades mencionadas:', Array.from(contextEntities.entries()));
console.log('Resposta do Jarvis:', response);
```

## 📈 Próximos Passos

- [ ] Backup automático de contexto
- [ ] Sincronização entre dispositivos
- [ ] Exportação de histórico
- [ ] Análise de sentimento das conversas
- [ ] Sugestões baseadas no histórico 