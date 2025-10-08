# Deployment da Citânia no Vercel

## Configuração Automática

O projeto está configurado para deployment automático no Vercel através dos seguintes ficheiros:

### `package.json`
- Scripts de build e desenvolvimento
- Dependências necessárias para servir a aplicação
- Metadados do projeto

### `vercel.json`
- Configuração específica do Vercel
- Headers de segurança para PWA
- Cache otimizado para recursos estáticos
- Redirecionamentos para SPA

### `.vercelignore`
- Ficheiros excluídos do deployment
- Otimização do tamanho do build

## Processo de Deployment

### 1. Através do GitHub (Recomendado)

1. Fazer push das alterações para o repositório GitHub
2. Conectar o repositório ao Vercel Dashboard
3. O deployment será automático a cada push para `main`

### 2. Através da CLI do Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login no Vercel
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 3. Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Servidor de desenvolvimento
npm run dev

# Servidor de produção local
npm start

# Validar aplicação
npm run validate

# Testar PWA (requer Lighthouse)
npm run test:pwa
```

## Configurações Importantes

### Headers de Segurança
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### Cache Strategy
- **Service Worker**: `Cache-Control: public, max-age=0, must-revalidate`
- **Assets estáticos**: `Cache-Control: public, max-age=31536000, immutable`
- **Manifest**: Cache longo com immutable

### PWA Requirements
- ✅ Manifest configurado
- ✅ Service Worker ativo
- ✅ Icons para todas as plataformas
- ✅ HTTPS (automático no Vercel)

## Verificação Pré-Deployment

Execute o script de verificação:

```bash
chmod +x deploy-check.sh
./deploy-check.sh
```

Ou manualmente:

```bash
# Verificar manifest
npm run validate:manifest

# Testar servidor local
npm run dev
```

## URLs após Deployment

- **Produção**: `https://citania.vercel.app`
- **Preview**: URLs geradas automaticamente para cada PR
- **Development**: `http://localhost:8000`

## Resolução de Problemas

### Service Worker não carrega
- Verificar se o `sw.js` está na raiz
- Confirmar headers no `vercel.json`

### Recursos não carregam
- Verificar paths relativos no código
- Confirmar configuração de cache

### PWA não instala
- Validar `manifest.json`
- Verificar icons e configurações PWA

## Monitorização

Após deployment, verificar:
- Lighthouse PWA score
- Performance metrics no Vercel Dashboard
- Funcionamento offline
- Instalação PWA em diferentes dispositivos