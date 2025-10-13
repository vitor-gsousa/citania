# 🏛️ Citânia - Matemática Divertida

[![Citânia](https://img.shields.io/badge/PWA-Ready-brightgreen.svg)](https://github.com/vitor-gsousa/citania)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Uma aplicação web interativa de aprendizagem de matemática, gamificada e inspirada na **Citânia de Sanfins**, um antigo povoado fortificado (castro) em Paços de Ferreira, Portugal.

## 📖 Sobre o Projeto

Citânia é uma Progressive Web App (PWA) que transforma a aprendizagem de matemática numa missão arqueológica divertida. Os utilizadores exploram conceitos matemáticos fundamentais enquanto descobrem os segredos da cidade antiga, ganhando pontos, medalhas e avançando de nível.

### 🎯 Objetivos

- Tornar o estudo de matemática mais envolvente e divertido
- Utilizar gamificação para motivar a prática contínua
- Proporcionar feedback imediato e explicações educativas
- Conectar a aprendizagem com o património cultural português

## ✨ Funcionalidades

### 🧮 Temas de Exercícios

A aplicação oferece 6 tipos diferentes de exercícios matemáticos:

1. **📊 Frações para Decimais** - Converte frações em números decimais
2. **🧩 Decomposição em Fatores Primos** - Decompõe números em fatores primos
3. **🔗 Máximo Divisor Comum (MDC)** - Calcula o MDC entre dois números
4. **📈 Mínimo Múltiplo Comum (MMC)** - Determina o MMC entre dois números
5. **💥 Multiplicação de Potências** - Aplica regras de multiplicação de potências
6. **✂️ Divisão de Potências** - Aplica regras de divisão de potências

### 🎮 Sistema de Gamificação

- **Pontos**: Ganha pontos ao responder corretamente
- **Medalhas**: Conquista badges especiais:
  - 🧭 **Explorador** - Alcança 50 pontos
  - ⚡ **Velocista** - Responde em menos de 5 segundos
  - 🔥 **Série Perfeita x5** - Acerta 5 respostas seguidas
  - 🎯 **À Primeira** - Acerta na primeira tentativa
  - 📚 **Estudioso** - Atinge o nível 3
- **Níveis**: Sistema de progressão com dificuldade crescente
- **Narrativa**: História imersiva baseada na Citânia de Sanfins
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

```
citania/
├── index.html                 # Página principal
├── manifest.json              # Configuração PWA
├── sw.js                      # Service Worker para PWA
├── build-css.ps1              # Script para build do CSS
├── favicon.ico                # Ícone do site
├── css/
│   ├── main.css               # Bundle CSS concatenado (produção)
│   ├── variables.css          # Variáveis CSS globais
│   ├── base.css               # Estilos base e utilitários
│   ├── layout.css             # Layout e estrutura
│   ├── responsive.css         # Media queries responsivas
│   └── components/
│       ├── cards.css          # Estilos dos cards
│       ├── buttons.css        # Estilos dos botões
│       ├── progress-score.css # Barra de progresso e pontuação
│       ├── keyboard.css       # Teclado personalizado
│       ├── achievements.css   # Painel de conquistas
│       ├── fractions.css      # Sistema de frações visuais
│       ├── curiosidade.css    # Curiosidade matemática
│       └── narrative.css      # Popup de narrativa
├── js/
│   └── app.js                 # Lógica principal da aplicação
├── audio/
│   ├── correct.mp3            # Som para resposta correta
│   ├── incorrect.mp3          # Som para resposta incorreta
│   └── levelup.mp3            # Som para subida de nível
└── README.md                  # Este ficheiro
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

### Como Jogar

1. **Escolhe um Tema**: No menu principal, seleciona um dos 6 tipos de exercícios
2. **Responde às Questões**: Completa 8 exercícios por ronda
3. **Ganha Pontos e Medalhas**: Acerta para ganhar pontos e conquistar badges
4. **Avança de Nível**: Após cada ronda, progride para níveis mais desafiantes
5. **Descobre a História**: Acompanha a narrativa sobre a Citânia de Sanfins

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
- Conteúdo adicional sobre a Citânia de Sanfins

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

🏛️ *"Cada desafio matemático revela mais segredos da Citânia de Sanfins!"*
