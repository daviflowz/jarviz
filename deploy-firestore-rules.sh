#!/bin/bash

echo "🚀 Deployando regras do Firestore..."

# Verificar se o Firebase CLI está instalado
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI não encontrado. Instale com: npm install -g firebase-tools"
    exit 1
fi

# Fazer login no Firebase (se necessário)
firebase login --no-localhost

# Deploy das regras do Firestore
firebase deploy --only firestore:rules

echo "✅ Regras do Firestore deployadas com sucesso!"
echo "📋 Regras atualizadas incluem:"
echo "   - Coleção 'messages' (mensagens do chat)"
echo "   - Coleção 'contextEntities' (entidades de contexto)"
echo "   - Coleção 'usage' (estatísticas de uso)"
echo "   - Estrutura antiga mantida para compatibilidade" 