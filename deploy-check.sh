#!/bin/bash

# Script de deployment para Citânia PWA no Vercel
# Este script pode ser executado localmente antes do deployment

echo "🚀 Preparando deployment da Citânia para o Vercel..."

# Verificar se os ficheiros essenciais existem
echo "📁 Verificando ficheiros essenciais..."
essential_files=("index.html" "manifest.json" "sw.js" "css/main.css" "js/app.js")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "❌ $file não encontrado!"
        exit 1
    fi
done

# Verificar se o manifest.json é válido
echo "📱 Validando manifest.json..."
if command -v node &> /dev/null; then
    node -e "
        const fs = require('fs');
        try {
            const manifest = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));
            console.log('✓ Manifest válido:', manifest.name);
            if (!manifest.start_url) throw new Error('start_url em falta');
            if (!manifest.display) throw new Error('display em falta');
            if (!manifest.name) throw new Error('name em falta');
        } catch (e) {
            console.error('❌ Erro no manifest.json:', e.message);
            process.exit(1);
        }
    "
else
    echo "⚠️ Node.js não encontrado - a validar apenas sintaxe JSON..."
    if python3 -c "import json; json.load(open('manifest.json'))" 2>/dev/null; then
        echo "✓ Manifest JSON válido"
    else
        echo "❌ Erro na sintaxe do manifest.json"
        exit 1
    fi
fi

# Verificar vercel.json
echo "⚙️ Verificando vercel.json..."
if command -v node &> /dev/null; then
    node -e "
        const fs = require('fs');
        try {
            const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
            console.log('✓ vercel.json válido');
            
            // Verificar conflitos entre routes e outras configurações
            if (vercel.routes && (vercel.rewrites || vercel.redirects || vercel.headers || vercel.cleanUrls !== undefined || vercel.trailingSlash !== undefined)) {
                console.error('❌ ERRO: \\'routes\\' não pode ser usado com \\'rewrites\\', \\'redirects\\', \\'headers\\', \\'cleanUrls\\' ou \\'trailingSlash\\'');
                console.error('   Solução: Migrar \\'routes\\' para \\'rewrites\\' e \\'headers\\' separados');
                process.exit(1);
            }
            
            if (vercel.builds) console.log('⚠️ Aviso: configuração builds presente (pode não ser necessária para apps estáticas)');
            if (vercel.routes) console.log('⚠️ Aviso: \\'routes\\' é deprecated, considere usar \\'rewrites\\' e \\'headers\\'');
            if (vercel.rewrites) console.log('✓ Configuração moderna com rewrites');
        } catch (e) {
            console.error('❌ Erro no vercel.json:', e.message);
            process.exit(1);
        }
    "
else
    if python3 -c "import json; json.load(open('vercel.json'))" 2>/dev/null; then
        echo "✓ vercel.json JSON válido"
    else
        echo "❌ Erro na sintaxe do vercel.json"
        exit 1
    fi
fi

echo ""
echo "✅ Todas as verificações passaram!"
echo "🎯 Pronto para deployment no Vercel!"
echo ""
echo "Próximos passos:"
echo "1. git add ."
echo "2. git commit -m 'Corrigir configuração Vercel para app estática'"
echo "3. git push origin main"
echo "4. O Vercel fará redeploy automático"
echo ""
echo "💡 Alternativa para redeploy imediato:"
echo "   - Aceder ao dashboard do Vercel"
echo "   - Ir ao projeto 'citania'"
echo "   - Clicar em 'Redeploy'"