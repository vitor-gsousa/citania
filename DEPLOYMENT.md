# Deployment da Citânia no Vercel

## ⚠️ Resolução de Problemas de Deployment

Se o deployment resultou numa página vazia, siga estes passos:

### Verificação Rápida
Execute o script de verificação:

```powershell
# No Windows
.\deploy-check.ps1

# No Linux/Mac  
bash deploy-check.sh
```

### Configuração Corrigida

O projeto está agora configurado como **aplicação estática pura**, sem builds desnecessários.

#### Ficheiros Importantes:
- ✅ `vercel.json` - Configuração simplificada para apps estáticas
- ✅ `package.json` - Sem dependências de build
- ✅ `.vercelignore` - Exclui ficheiros desnecessários

## Configuração Automática

O projeto está configurado para deployment automático no Vercel através dos seguintes ficheiros:

### `vercel.json` (Simplificado)
- **SEM** secção `builds` (para apps estáticas)
- Headers de segurança para PWA  
- Cache otimizado para recursos estáticos
- Redirecionamentos para SPA

### `package.json` (Minimal)
- **SEM** scripts de build complexos
- **SEM** dependências desnecessárias
- Scripts apenas para desenvolvimento local

## Processo de Deployment

### 1. Corrigir Deployment Vazio

```bash
# 1. Fazer commit das correções
git add .
git commit -m "Corrigir configuração Vercel para app estática"
git push origin main

# 2. Redeploy automático acontecerá
# OU redeploy manual no dashboard Vercel
```

### 2. Através do GitHub (Recomendado)

1. Push para repositório GitHub ✅
2. Redeploy automático no Vercel ✅
3. Verificar em https://citania.vercel.app

### 3. Redeploy Manual

1. Aceder ao [Vercel Dashboard](https://vercel.com/dashboard)
2. Ir ao projeto "citania"
3. Clicar em "Redeploy" 
4. Selecionar "Use existing Build Cache" = **NÃO**

## Comandos de Desenvolvimento

```bash
# Validar configuração
npm run validate

# Servidor local (várias opções)
python -m http.server 8000
# ou
npx http-server -p 8000
# ou
npm run dev
```

## Principais Correções Feitas

### ❌ Problemas Anteriores:
- Configuração `@vercel/static-build` desnecessária
- Scripts de build que não fazem nada
- Dependências dev desnecessárias
- **CONFLITO**: Uso de `routes` junto com `headers` (não permitido)

### ✅ Soluções Aplicadas:
- Vercel.json simplificado para apps estáticas
- Package.json minimal sem builds
- Verificação automática de ficheiros essenciais
- **CORRIGIDO**: Migração de `routes` para `rewrites` + `headers` separados

## Verificação Pós-Deployment

### URLs para Testar:
- **Produção**: https://citania.vercel.app
- **PWA Manifest**: https://citania.vercel.app/manifest.json
- **Service Worker**: https://citania.vercel.app/sw.js

### Checklist PWA:
- ✅ Aplicação carrega
- ✅ Manifest disponível
- ✅ Service Worker ativo
- ✅ Instalação PWA funciona
- ✅ Funcionamento offline

## Resolução de Problemas Específicos

### Página Ainda Vazia?
1. Verificar se `index.html` está na raiz
2. Confirmar que não há erros no console do browser
3. Redeploy manual sem cache
4. Verificar logs de deployment no Vercel

### Service Worker não carrega?
- Verificar headers no `vercel.json`
- Path correto: `/sw.js` (na raiz)

### Assets não carregam?
- Verificar paths relativos no código
- Confirmar estrutura de pastas

## Monitorização

Após deployment, verificar:
- Lighthouse PWA score
- Performance metrics no Vercel Dashboard
- Funcionamento em diferentes dispositivos
- Instalação PWA