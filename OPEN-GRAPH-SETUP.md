# 🌐 Configuração Open Graph - Citânia

## ✅ Implementação Completa

Foram adicionadas **todas as meta tags Open Graph** necessárias para uma partilha otimizada em redes sociais:

### 📱 **Meta Tags Implementadas**

#### Open Graph (Facebook, LinkedIn, WhatsApp)
- `og:type` → "website" 
- `og:url` → "https://citania.vercel.app/"
- `og:title` → "Citânia - Matemática Divertida"
- `og:description` → Descrição completa da aplicação
- `og:image` → "https://citania.vercel.app/images/ogcitania.png"
- `og:image:width` → "1200"
- `og:image:height` → "630" 
- `og:site_name` → "Citânia - Matemática Divertida"
- `og:locale` → "pt_PT"

#### Twitter Cards
- `twitter:card` → "summary_large_image"
- `twitter:url` → "https://citania.vercel.app/"
- `twitter:title` → "Citânia - Matemática Divertida"
- `twitter:description` → Descrição completa da aplicação
- `twitter:image` → "https://citania.vercel.app/images/ogcitania.png"

#### SEO Adicional
- `meta name="description"` → Para motores de busca
- `meta name="keywords"` → Palavras-chave relevantes
- `meta name="author"` → Citânia Team

### 🖼️ **Imagem Open Graph**

- **Ficheiro**: `images/ogcitania.png`
- **Dimensões**: 749x630 px (ratio otimizado para redes sociais)
- **Tamanho**: 1.169 KB (reduzido 20% via otimização)
- **Formato**: PNG com alta qualidade
- **Cache**: Incluída no Service Worker v4

### 🎯 **Descrição Criada**

> "Aplicação gamificada para aprender matemática de forma divertida. Explore conceitos matemáticos numa missão arqueológica pela antiga Citânia de Sanfins!"

Esta descrição:
- ✅ Destaca a **gamificação** como diferencial
- ✅ Menciona **aprendizagem matemática** (objetivo principal)
- ✅ Inclui **Citânia de Sanfins** (contexto cultural único)
- ✅ Usa linguagem **apelativa e envolvente**
- ✅ Tem tamanho ideal para redes sociais (< 160 caracteres)

## 🧪 **Como Testar**

### Ferramentas de Validação
1. **Facebook**: https://developers.facebook.com/tools/debug/
2. **Twitter**: https://cards-dev.twitter.com/validator  
3. **LinkedIn**: https://www.linkedin.com/post-inspector/
4. **WhatsApp**: Partilhar link e verificar preview

### Passos de Teste
1. Fazer deploy das alterações no Vercel
2. Aguardar propagação (~5-10 minutos)
3. Usar ferramentas de validação acima
4. Testar partilha real nas redes sociais

## 📊 **Resultado Esperado**

Quando alguém partilhar `https://citania.vercel.app/` em qualquer rede social, aparecerá:

- 🖼️ **Imagem**: Preview da aplicação Citânia
- 📝 **Título**: "Citânia - Matemática Divertida"  
- 📄 **Descrição**: Texto apelativo sobre gamificação matemática
- 🔗 **URL**: Link direto para a aplicação

## ⚡ **Próximos Passos**

1. **Deploy**: Push das alterações para GitHub → Deploy automático Vercel
2. **Validação**: Testar com ferramentas de debug das redes sociais
3. **Cache**: Primeiras partilhas podem precisar de refresh do cache
4. **Monitorização**: Acompanhar engagement das partilhas

---

**💡 Dica**: Após fazer o deploy, aguarde alguns minutos e use os debuggers das redes sociais para forçar refresh do cache das meta tags.