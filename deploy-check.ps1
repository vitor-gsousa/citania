# Script de deployment para Citânia PWA no Vercel
# Este script pode ser executado localmente antes do deployment

Write-Host "🚀 Preparando deployment da Citânia para o Vercel..." -ForegroundColor Green

# Verificar se os ficheiros essenciais existem
Write-Host "📁 Verificando ficheiros essenciais..." -ForegroundColor Yellow
$essentialFiles = @("index.html", "manifest.json", "sw.js", "css/style.css", "js/app.js", "vercel.json")
$allFilesExist = $true

foreach ($file in $essentialFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file não encontrado!" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    exit 1
}

# Verificar se o manifest.json é válido
Write-Host "📱 Validando manifest.json..." -ForegroundColor Yellow
try {
    $manifest = Get-Content "manifest.json" -Raw | ConvertFrom-Json
    Write-Host "✓ Manifest válido: $($manifest.name)" -ForegroundColor Green
    
    if (-not $manifest.start_url) {
        throw "start_url em falta"
    }
    if (-not $manifest.display) {
        throw "display em falta"  
    }
    if (-not $manifest.name) {
        throw "name em falta"
    }
} catch {
    Write-Host "❌ Erro no manifest.json: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Verificar vercel.json
Write-Host "⚙️ Verificando vercel.json..." -ForegroundColor Yellow
try {
    $vercel = Get-Content "vercel.json" -Raw | ConvertFrom-Json
    Write-Host "✓ vercel.json válido" -ForegroundColor Green
    
    # Verificar conflitos entre routes e outras configurações
    if ($vercel.routes -and ($vercel.rewrites -or $vercel.redirects -or $vercel.headers -or $vercel.cleanUrls -or $vercel.trailingSlash)) {
        Write-Host "❌ ERRO: 'routes' não pode ser usado com 'rewrites', 'redirects', 'headers', 'cleanUrls' ou 'trailingSlash'" -ForegroundColor Red
        Write-Host "   Solução: Migrar 'routes' para 'rewrites' e 'headers' separados" -ForegroundColor Yellow
        exit 1
    }
    
    if ($vercel.builds) {
        Write-Host "⚠️ Aviso: configuração builds presente (pode não ser necessária para apps estáticas)" -ForegroundColor Yellow
    }
    
    if ($vercel.routes) {
        Write-Host "⚠️ Aviso: 'routes' é deprecated, considere usar 'rewrites' e 'headers'" -ForegroundColor Yellow
    }
    
    if ($vercel.rewrites) {
        Write-Host "✓ Configuração moderna com rewrites" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro no vercel.json: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Todas as verificações passaram!" -ForegroundColor Green
Write-Host "🎯 Pronto para deployment no Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "Próximos passos:" -ForegroundColor Cyan
Write-Host "1. git add ." -ForegroundColor White
Write-Host "2. git commit -m 'Corrigir configuração Vercel para app estática'" -ForegroundColor White
Write-Host "3. git push origin main" -ForegroundColor White
Write-Host "4. O Vercel fará redeploy automático" -ForegroundColor White
Write-Host ""
Write-Host "💡 Alternativa para redeploy imediato:" -ForegroundColor Cyan
Write-Host "   - Aceder ao dashboard do Vercel" -ForegroundColor White
Write-Host "   - Ir ao projeto 'citania'" -ForegroundColor White
Write-Host "   - Clicar em 'Redeploy'" -ForegroundColor White