#!/bin/bash

echo "🚀 Script para enviar Chat AI PWA para o GitHub"
echo "=============================================="
echo ""

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script no diretório do projeto (chat-pwa)"
    exit 1
fi

echo "📋 Verificando status do Git..."
git status --short

echo ""
echo "🔐 Fazendo login no GitHub CLI..."
echo "   Você será redirecionado para o navegador para fazer login"
gh auth login

echo ""
echo "📦 Criando repositório no GitHub..."
echo "   Nome: chat-ai-pwa"
echo "   Descrição: Chat AI PWA - Aplicativo moderno para conversar com IA"

gh repo create chat-ai-pwa \
    --public \
    --description "Chat AI PWA - Aplicativo moderno para conversar com IA, construído com React, TypeScript e Tailwind CSS. Design inspirado no Pinterest, mobile-first com integração Google Gemini AI." \
    --source=. \
    --remote=origin \
    --push

echo ""
if [ $? -eq 0 ]; then
    echo "✅ Sucesso! Repositório criado e código enviado!"
    echo ""
    echo "🔗 Links importantes:"
    echo "   Repositório: https://github.com/$(gh api user --jq .login)/chat-ai-pwa"
    echo "   Clone: git clone https://github.com/$(gh api user --jq .login)/chat-ai-pwa.git"
    echo ""
    echo "🚀 Próximos passos:"
    echo "   - Acesse o repositório no GitHub"
    echo "   - Configure GitHub Pages para deploy automático"
    echo "   - Ou faça deploy no Vercel/Netlify"
    echo ""
    echo "📱 Para testar localmente:"
    echo "   npm install"
    echo "   npm start"
else
    echo "❌ Erro ao criar repositório. Verifique sua autenticação."
    echo ""
    echo "🔧 Alternativa manual:"
    echo "1. Crie um repositório manualmente no GitHub"
    echo "2. Execute os comandos:"
    echo "   git remote add origin https://github.com/SEU_USUARIO/chat-ai-pwa.git"
    echo "   git push -u origin main"
fi

echo ""
echo "🎉 Script finalizado!"