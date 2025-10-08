#!/bin/bash

# Script de deployment para Citânia PWA no Vercel
# Este script pode ser executado localmente antes do deployment

echo "🚀 Preparando deployment da Citânia para o Vercel..."

# Verificar se o package.json existe
if [ ! -f "package.json" ]; then
    echo "❌ Erro: package.json não encontrado!"
    exit 1
fi

# Verificar se o manifest.json é válido
echo "📱 Validando manifest.json..."
if [ -f "manifest.json" ]; then
    node -e "
        const fs = require('fs');
        try {
            const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            console.log('✓ Manifest válido:', manifest.name);
        } catch (e) {
            console.error('❌ Erro no manifest.json:', e.message);
            process.exit(1);
        }
    "
else
    echo "❌ Erro: manifest.json não encontrado!"
    exit 1
fi

# Verificar Service Worker
echo "⚙️ Verificando Service Worker..."
if [ -f "sw.js" ]; then
    echo "✓ Service Worker encontrado"
else
    echo "⚠️ Aviso: Service Worker não encontrado"
fi

# Verificar ficheiros essenciais
echo "📁 Verificando ficheiros essenciais..."
essential_files=("index.html" "css/style.css" "js/app.js")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "❌ $file não encontrado!"
        exit 1
    fi
done

echo "✅ Todos os verificações passaram!"
echo "🎯 Pronto para deployment no Vercel!"
echo ""
echo "Próximos passos:"
echo "1. git add ."
echo "2. git commit -m 'Adicionar configuração Vercel'"
echo "3. git push origin main"
echo "4. Fazer deployment no Vercel Dashboard"