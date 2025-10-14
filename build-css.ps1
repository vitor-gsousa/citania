# Script para fazer build do CSS concatenado (main.css)
# Concatena todos os arquivos CSS modulares na ordem correta

Write-Host "🔨 Fazendo build do CSS..." -ForegroundColor Green

# Ordem dos arquivos CSS conforme especificado no comentário do main.css
$cssFiles = @(
    "css/variables.css",
    "css/base.css",
    "css/layout.css",
    "css/components/cards.css",
    "css/components/buttons.css",
    "css/components/progress-score.css",
    "css/components/keyboard.css",
    "css/components/achievements.css",
    "css/components/fractions.css",
    "css/components/curiosidade.css",
    "css/components/narrative.css"
    # responsive.css será carregado separadamente para evitar duplicação
)

# Verificar se todos os arquivos existem
$allFilesExist = $true
foreach ($file in $cssFiles) {
    if (-not (Test-Path $file)) {
        Write-Host "❌ Arquivo não encontrado: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host "❌ Alguns arquivos CSS estão faltando. Abortando build." -ForegroundColor Red
    exit 1
}

# Criar o conteúdo do bundle
$bundleContent = @"
/* main.css is a production bundle that concatenates the modules in this order:
    variables.css, base.css, layout.css, components/cards.css, components/buttons.css,
    components/progress-score.css, components/keyboard.css, components/achievements.css,
    components/fractions.css, components/curiosidade.css, components/narrative.css */
"@

foreach ($file in $cssFiles) {
    Write-Host "📄 Adicionando $file..." -ForegroundColor Yellow

    # Adicionar comentário de início
    $fileName = [System.IO.Path]::GetFileName($file)
    $bundleContent += "`n`n/* CONCAT START: $fileName */`n"

    # Adicionar conteúdo do arquivo
    $content = Get-Content $file -Raw
    $bundleContent += $content

    # Adicionar comentário de fim
    $bundleContent += "`n/* CONCAT END: $fileName */"
}

# Escrever o arquivo main.css
$bundleContent | Out-File -FilePath "css/main.css" -Encoding UTF8 -Force

Write-Host "✅ Build do CSS concluído com sucesso!" -ForegroundColor Green
Write-Host "📦 Arquivo css/main.css atualizado com todos os módulos." -ForegroundColor Green

# Verificar se o arquivo foi criado corretamente
if (Test-Path "css/main.css") {
    $fileSize = (Get-Item "css/main.css").Length
    Write-Host "📊 Tamanho do bundle: $([math]::Round($fileSize/1024, 2)) KB" -ForegroundColor Cyan
} else {
    Write-Host "❌ Erro: Arquivo css/main.css não foi criado!" -ForegroundColor Red
    exit 1
}