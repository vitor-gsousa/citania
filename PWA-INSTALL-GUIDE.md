# 📱 Guia de Instalação PWA - Citânia

## ✅ Problemas Corrigidos

Foram identificados e corrigidos os seguintes problemas que impediam a instalação da PWA:

### 1. **Ícones PWA em Falta** ✅
- **Problema**: Apenas existia um ícone de 512x512 (que nem sequer existia fisicamente)
- **Solução**: Criados ícones PWA em múltiplos tamanhos:
  - `icon-192x192.png` (9.6 KB)
  - `icon-256x256.png` (13.8 KB) 
  - `icon-384x384.png` (23.3 KB)
  - `icon-512x512.png` (36.9 KB)

### 2. **Manifest.json Incompleto** ✅
- **Problema**: Propriedades importantes em falta
- **Solução**: Adicionadas propriedades PWA obrigatórias:
  - `scope: "/"`
  - `orientation: "portrait-primary"`
  - `categories: ["education", "games"]`
  - `lang: "pt-PT"`
  - Ícones corrigidos com caminhos válidos

### 3. **Handler de Instalação Ausente** ✅
- **Problema**: Sem código para gerir `beforeinstallprompt`
- **Solução**: Criado módulo `js/features/pwa-install.js` que:
  - Interceta o evento `beforeinstallprompt`
  - Mostra botão personalizado de instalação
  - Gere o processo de instalação
  - Mostra feedback de sucesso

### 4. **Service Worker Desatualizado** ✅
- **Problema**: Novos ícones não estavam em cache
- **Solução**: 
  - Adicionados novos ícones ao cache
  - Atualizada versão para `v3` para forçar refresh

## 🚀 Como Testar

### Localmente (Desenvolvimento)
```bash
# Servir com HTTPS (necessário para PWA)
npx http-server -p 8080 --ssl

# Ou usar VS Code Live Server
# Extensão: "Live Server" por Ritwick Dey
```

### Em Produção (Vercel)
1. **Deploy automático**: Push para GitHub ativa deployment
2. **URL**: https://citania.vercel.app
3. **Teste móvel**: Aceder em Chrome/Edge móvel

## 📱 Comportamento Esperado

### Chrome/Edge Móvel
1. **Primeira visita**: Prompt de instalação aparece automaticamente após alguns segundos
2. **Botão personalizado**: Aparece no header ao lado do botão de tema
3. **Após instalação**: App funciona offline e aparece no ecrã inicial

### Safari iOS
- Não suporta `beforeinstallprompt`
- Instalação manual: Partilhar → "Adicionar ao Ecrã Inicial"

### Firefox Móvel
- Suporte limitado, melhor experiência com Chrome/Edge

## 🔧 Verificação

Execute o script de verificação:
```bash
node verify-pwa.js
```

## 📝 Critérios PWA Cumpridos

- ✅ **Manifest válido** com todas as propriedades obrigatórias
- ✅ **Service Worker** funcional com cache offline
- ✅ **HTTPS** (automático no Vercel)
- ✅ **Ícones múltiplos** (192px, 256px, 384px, 512px)
- ✅ **Handler de instalação** personalizado
- ✅ **Responsive design** para dispositivos móveis

## 🎯 Próximos Passos

1. **Deploy**: Fazer push das alterações para GitHub
2. **Teste**: Verificar em dispositivo móvel real
3. **Lighthouse**: Correr auditoria PWA para score final
4. **App Stores**: Considerar publicação via PWABuilder

---

**Nota**: O prompt de instalação só aparece em dispositivos que cumprem os critérios PWA do browser (HTTPS, Service Worker, Manifest válido, engagement do utilizador, etc.)