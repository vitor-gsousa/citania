# 🏛️ Citânia - Matemática Divertida

[![Citânia](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://github.com/vitor-gsousa/citania)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Uma aplicação web interativa de aprendizagem de matemática, gamificada e inspirada na **Citânia de Sanfins**, um antigo povoado fortificado (castro) em Paços de Ferreira, Portugal.

## 📖 Sobre o Projeto

Citânia é uma Progressive Web App (PWA) centrada em Curiosidades Matemáticas. A cada visita, apresentamos factos, padrões e pequenas histórias sobre matemática que despertam a curiosidade e convidam à descoberta. Em paralelo, oferecemos exercícios curtos e acessíveis para praticar conceitos fundamentais — com um toque de gamificação (pontos, medalhas e níveis) para motivar a progressão.

### 🎯 Objetivos

- Tornar o estudo de matemática mais envolvente e divertido
- Utilizar gamificação para motivar a prática contínua
- Proporcionar feedback imediato e explicações educativas
- Despertar a curiosidade através de factos e padrões matemáticos curtos

## ✨ Funcionalidades

### 🧠 Curiosidade Matemática

- Apresentação rotativa de curiosidades (factos, padrões e histórias curtas)
- Controles para gerar nova curiosidade e pausar/retomar a rotação
- Ajustes responsivos e modo escuro para leitura confortável

### 🧮 Temas de Exercícios (por Áreas)

A aplicação oferece mais de 6 tipos de exercícios, organizados por áreas:

- Área: Aritmética
  - **➕➖ Adição e Subtração**
  - **✖️➗ Multiplicação e Divisão**
  - **🍰 Operações com Frações**
  - **📊 Frações para Decimais**
  - **🧩 Decomposição em Fatores Primos**
  - **🔗 Máximo Divisor Comum (MDC)**
  - **📈 Mínimo Múltiplo Comum (MMC)**
  - **💥 Multiplicação de Potências**
  - **✂️ Divisão de Potências**

- Área: Geometria (em desenvolvimento)
  - Área e Perímetro (brevemente)
  - Triângulos (brevemente)

- Área: Álgebra (em desenvolvimento)
  - Equações (brevemente)

- Área: Probabilidade (em desenvolvimento)

- Área: Estatística (em desenvolvimento)

- Área: Trigonometria (em desenvolvimento)

### 🎮 Sistema de Gamificação

- **Pontos**: Ganha pontos ao responder corretamente
- **Medalhas**: Conquista badges especiais:
  - 🧭 **Explorador** - Alcança 50 pontos
  - ⚡ **Velocista** - Responde em menos de 5 segundos
  - 🔥 **Série Perfeita x5** - Acerta 5 respostas seguidas
  - 🎯 **À Primeira** - Acerta na primeira tentativa
  - 📚 **Estudioso** - Atinge o nível 3
- **Níveis**: Sistema de progressão com dificuldade crescente
- **Curiosidades**: Exploração de curiosidades matemáticas ao longo do uso
- **Leaderboard**: Classifica os melhores jogadores
- **Séries (Streaks)**: Mantém uma sequência de respostas corretas

### 🎨 Interface e Acessibilidade

- **Modo Escuro/Claro**: Alternância entre temas visuais
- **Design Responsivo**: Otimizado para desktop, tablet e mobile
- **Teclado Personalizado**: Teclado numérico integrado para facilitar input
- **Efeitos Visuais**: Animações confetti para celebrar conquistas
- **Feedback Sonoro**: Efeitos sonoros para respostas corretas, incorretas e subida de nível
- **Acessibilidade**: Suporte para navegação por teclado e leitores de ecrã

### 🚀 Progressive Web App (PWA)

- **Instalável**: Pode ser instalado como app no dispositivo
- **Offline**: Funciona sem ligação à internet (Service Worker)
- **Cache Inteligente**: Recursos guardados localmente para acesso rápido
- **Ícones Otimizados**: Ícones para diferentes tamanhos e dispositivos

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design moderno com variáveis CSS e animações
- **JavaScript (ES6+)**: Lógica da aplicação e interatividade
- **Service Worker**: Suporte PWA e funcionamento offline
- **LocalStorage**: Persistência de dados do utilizador
- **Canvas Confetti**: Efeitos visuais de celebração
- **Web Audio API**: Reprodução de efeitos sonoros

## 📂 Estrutura do Projeto

```text
📂citania/
├── 📄index.html
├── 📄manifest.json
├── 📄sw.js
├── 📄package.json
├── 📄vercel.json
├── 📄deploy-check.ps1
├── 📄deploy-check.sh
├── 📄verify-pwa.js
├── 📄verify-opengraph.js
├── 📄README.md
├── 📂css/
│   ├── 📄main.css
│   ├── 📄variables.css
│   ├── 📄base.css
│   ├── 📄layout.css
│   ├── 📄responsive.css
│   └── 📂components/
│       ├── 📄buttons.css
│       ├── 📄cards.css
│       ├── 📄keyboard.css
│       ├── 📄progress-score.css
│       ├── 📄achievements.css
│       ├── 📄fractions.css
│       ├── 📄curiosidade.css
│       └── 📄narrative.css
├── 📂js/
│   ├── 📄app.js
│   ├── 📄events.js
│   ├── 📄exercise.js
│   ├── 📄progress.js
│   ├── 📄theme.js
│   ├── 📄ui.js
│   ├── 📂config/
│   │   └── 📄exercise-types.js
│   ├── 📂examples/
│   │   ├── 📄fraction-examples.js
│   │   └── 📄template-examples.js
│   └── 📂features/
│       ├── 📄gamification.js
│       └── 📄pwa-install.js
├── 📂modules/
│   ├── 📂arithmetic/
│   │   ├── 📄fractions.js
│   │   ├── 📄fractionToDecimal.js
│   │   ├── 📄gcd.js
│   │   ├── 📄lcm.js
│   │   ├── 📄mulDiv.js
│   │   ├── 📄powerDivision.js
│   │   ├── 📄powerMultiplication.js
│   │   ├── 📄primeFactorization.js
│   │   └── 📄progression.js
│   └── 📂utils/
│       ├── 📄math-facts.js
│       ├── 📄math.js
│       └── 📄rand.js
├── 📂services/
│   └── 📄sounds.js
├── 📂templates/
│   ├── 📄exercise-card.js
│   ├── 📄template-manager.js
│   └── 📄theme-section.js
├── 📂utils/
│   ├── 📄fraction-visual.js
│   ├── 📄icon-utils.js
│   ├── 📄mobile-utils.js
│   └── 📄storage.js
├── 📂audio/
│   ├── 🔊correct.opus
│   ├── 🔊incorrect.opus
│   └── 🔊levelup.opus
├── 📂images/
│   ├── 🖼️ogcitania.jpg
│   └── 📂icons/
│       ├── 🖼️favicon.ico
│       ├── 🖼️icon-192x192.png
│       ├── 🖼️icon-256x256.png
│       ├── 🖼️icon-384x384.png
│       └── 🖼️icon-512x512.png
└── 📂vendor/
    └── 📄lottie.min.js
```

## 🚀 Como Usar

### Instalação Local

1. Clone o repositório:

   ```bash
   git clone https://github.com/vitor-gsousa/citania.git
   cd citania
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. **Construa os estilos CSS** (se modificou arquivos CSS modulares):

   ```bash
   npm run build:css
   # ou diretamente com PowerShell:
   .\build-css.ps1
   ```

4. Abra o ficheiro `index.html` num navegador web moderno:
   - Pode usar um servidor local simples:

     ```bash
     npm run dev  # servidor na porta 8000
     # ou
     npx http-server
     ```

   - Aceda a `http://localhost:8000`

#### Usar ícones localmente (opcional)

Se preferires embalar a família de ícones Material Symbols localmente (útil para PWA/offline), existe um pequeno script PowerShell que tenta descarregar um ficheiro WOFF2 para `./fonts/`:

```powershell
# a partir da raíz do repositório
pwsh ./tools/download-material-symbols.ps1
```

Depois de descarregares a fonte, faz um hard-refresh (Ctrl+F5) no browser para garantir que a nova fonte é usada. O CSS da aplicação tenta carregar primeiro a cópia local e recorre ao serviço remoto como fallback.

### Como Usar

1. **Escolhe uma Área**: No menu principal, seleciona uma área (ex.: Aritmética) e depois um tipo de exercício
2. **Responde às Questões**: Completa 8 exercícios por ronda
3. **Ganha Pontos e Medalhas**: Acerta para ganhar pontos e conquistar badges
4. **Avança de Nível**: Após cada ronda, progride para níveis mais desafiantes
5. **Explora Curiosidades**: Consulta e gere novas curiosidades matemáticas

### Atalhos de Teclado

- **Enter**: Submete a resposta
- **Tab**: Navega entre elementos
- **Espaço**: Ativa botões e cards (quando em foco)

## 🎓 Contexto Educativo

### Citânia de Sanfins

A Citânia de Sanfins é um dos mais importantes castros do noroeste peninsular, localizado em Paços de Ferreira. O povoado fortificado foi ocupado desde o período pré-romano até à romanização, apresentando:

- Muralhas concêntricas defensivas
- Casas circulares em pedra
- Influências da cultura castreja e romana
- Importante sítio arqueológico e museu

A aplicação usa esta rica herança cultural como tema para tornar a aprendizagem de matemática mais contextualizada e culturalmente relevante.

## 🔧 Desenvolvimento

### Extensões Futuras Possíveis

- Mais temas matemáticos (equações, geometria, estatística)
- Modo multiplayer com desafios entre jogadores
- Sistema de conquistas mais elaborado
- Exportação de progresso e estatísticas
- Integração com plataformas educativas
- Mais coleções de curiosidades matemáticas (por tópicos/níveis)

### Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:

- Reportar bugs ou sugerir melhorias através de issues
- Fazer fork do projeto e submeter pull requests
- Melhorar a documentação ou traduzir para outros idiomas

## 📄 Licença

Este projeto está disponível para uso educativo e de aprendizagem.

## 👏 Créditos

- **Desenvolvimento**: Vitor Sousa
- **Inspiração Cultural**: Citânia de Sanfins, Paços de Ferreira
- **Biblioteca de Confetti**: [canvas-confetti](https://github.com/catdad/canvas-confetti)

---

**Feito com ❤️ para tornar a matemática mais divertida!**
