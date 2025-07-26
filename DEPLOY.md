# Deploy e Configuração - Chat AI PWA

## 🚀 Opções de Deploy

### 1. Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 2. Netlify
```bash
# Build local
npm run build

# Arrastar pasta build/ para Netlify
# Ou usar Netlify CLI:
npm i -g netlify-cli
netlify deploy --prod --dir=build
```

### 3. Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init hosting

# Deploy
firebase deploy
```

### 4. GitHub Pages
```bash
# Instalar gh-pages
npm install --save-dev gh-pages

# Adicionar scripts no package.json:
"homepage": "https://seuusuario.github.io/chat-pwa",
"predeploy": "npm run build",
"deploy": "gh-pages -d build"

# Deploy
npm run deploy
```

## 🔧 Configurações de Produção

### Environment Variables
Crie um arquivo `.env` na raiz do projeto:
```
REACT_APP_GOOGLE_API_KEY=AIzaSyBvI-LCxl8u3tFjKZOIaNcpZr499pcVD9Q
REACT_APP_APP_NAME=Chat AI
REACT_APP_VERSION=1.0.0
```

### Configuração de Domínio Personalizado
1. **Vercel**: Adicione domínio no dashboard
2. **Netlify**: Configure DNS no painel
3. **Firebase**: Use `firebase hosting:channel:deploy`

## 📱 PWA Configuration

### Service Worker
O service worker está configurado em `/public/sw.js` e registrado em `src/index.tsx`.

### Manifest
O arquivo `/public/manifest.json` está configurado com:
- Nome do app
- Ícones para diferentes tamanhos
- Cores do tema
- Configurações de display

### Ícones PWA
Substitua os arquivos em `/public/`:
- `favicon.ico` (16x16, 32x32, 48x48)
- `logo192.png` (192x192)
- `logo512.png` (512x512)

## 🔒 Configurações de Segurança

### Content Security Policy
Adicione no `public/index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline'; 
               style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
               font-src 'self' https://fonts.gstatic.com;
               connect-src 'self' https://generativelanguage.googleapis.com;">
```

### HTTPS
Sempre use HTTPS em produção para funcionalidades PWA.

## 📊 Analytics e Monitoramento

### Google Analytics
```bash
npm install gtag

# Adicionar no index.html:
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

### Sentry (Error Tracking)
```bash
npm install @sentry/react

# Configurar no index.tsx
```

## 🎨 Customização

### Cores do Tema
Edite `tailwind.config.js`:
```javascript
colors: {
  primary: '#E60023',
  secondary: '#F9FAFB',
  accent: '#FF3040'
}
```

### Fontes
Modifique `src/index.css` para mudar a fonte principal.

## 📱 Testes em Dispositivos

### Lighthouse
```bash
npm install -g lighthouse
lighthouse http://localhost:3000 --view
```

### PWA Testing
1. Chrome DevTools > Application > Service Workers
2. Chrome DevTools > Application > Manifest
3. Teste de instalação em dispositivos móveis

## 🔄 CI/CD

### GitHub Actions
Crie `.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run deploy
```

## 🐛 Debugging

### Development
```bash
# Debug com source maps
npm start

# Verificar bundle size
npm run build
npm install -g serve
serve -s build
```

### Production
```bash
# Analisar bundle
npm install --save-dev webpack-bundle-analyzer
npm run build
npx webpack-bundle-analyzer build/static/js/*.js
```

## 📋 Checklist de Deploy

- [ ] Testes passando (`npm test`)
- [ ] Build sem erros (`npm run build`)
- [ ] PWA funcionando (manifest + service worker)
- [ ] Responsivo em todos os dispositivos
- [ ] Performance > 90 no Lighthouse
- [ ] Acessibilidade > 90 no Lighthouse
- [ ] SEO > 90 no Lighthouse
- [ ] HTTPS configurado
- [ ] Domínio personalizado (opcional)
- [ ] Analytics configurado (opcional)
- [ ] Error tracking configurado (opcional)

## 🆘 Troubleshooting

### Problemas Comuns

1. **Service Worker não funciona**
   - Verifique se está em HTTPS
   - Limpe cache do navegador
   - Verifique console do DevTools

2. **Tailwind não carrega**
   - Verifique `postcss.config.js`
   - Confirme que `@tailwind` está no CSS
   - Reinstale dependências

3. **API do Google não funciona**
   - Verifique chave da API
   - Confirme que a API está habilitada
   - Verifique cotas de uso

4. **PWA não instala**
   - Verifique manifest.json
   - Confirme service worker
   - Teste em HTTPS

## 📞 Suporte

Para problemas específicos:
1. Verifique logs do console
2. Teste em modo incógnito
3. Limpe cache e cookies
4. Teste em diferentes navegadores

---

**Última atualização**: Janeiro 2025