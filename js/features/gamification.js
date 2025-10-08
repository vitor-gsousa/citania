// js/features/gamification.js
import { safeGetItem, safeSetItem } from "../utils/storage.js";

// Curiosidades de fallback embutidas
const FALLBACK_FACTS = [
  "🧠 A matemática é a linguagem universal do universo!",
  "🧠 Os números estão em toda a parte - desde as pétalas das flores até às galáxias!",
  "🧠 A soma de dois números ímpares é sempre par!",
  "🧠 O número zero foi uma das maiores invenções da humanidade!",
  "🧠 Pedro Nunes foi um grande matemático português do século XVI!",
  "🧠 O número Pi tem infinitas casas decimais que nunca se repetem!",
  "🧠 A sequência de Fibonacci aparece na natureza!",
  "🧠 As abelhas fazem favos hexagonais porque usam menos cera!",
  "🧠 Leonardo da Vinci usava a proporção áurea nas suas pinturas!",
  "🧠 O teorema de Pitágoras era conhecido antes de Pitágoras!"
];

// Funções de fallback
function getFallbackMathFact() {
  const randomIndex = Math.floor(Math.random() * FALLBACK_FACTS.length);
  return FALLBACK_FACTS[randomIndex];
}

// Variáveis para as funções importadas
let getRandomMathFact = getFallbackMathFact;
let getLevelBasedMathFact = getFallbackMathFact;
let startFactRotation = null;

// Tentar importar math-facts dinamicamente
async function loadMathFactsModule() {
  try {
    const mathFactsModule = await import("../modules/utils/math-facts.js");
    getRandomMathFact = mathFactsModule.getRandomMathFact;
    getLevelBasedMathFact = mathFactsModule.getLevelBasedMathFact;
    startFactRotation = mathFactsModule.startFactRotation;
    console.log("Módulo math-facts carregado com sucesso");
    return true;
  } catch (error) {
    console.warn("Usando funções de fallback para curiosidades:", error);
    return false;
  }
}

// Variável para controlar a rotação automática
let factRotationController = null;

export const GAMIFICATION_KEY = "citaniaGamification";
export const LEADERBOARD_KEY = "citaniaLeaderboard";

export const BADGES = {
  explorer: { id: "explorer", label: "Explorador", emoji: "🧭" },
  speedster: { id: "speedster", label: "Velocista", emoji: "⚡" },
  streak5: { id: "streak5", label: "Série Perfeita x5", emoji: "🔥" },
  firstTry: { id: "firstTry", label: "À Primeira", emoji: "🎯" },
  scholar: { id: "scholar", label: "Estudioso", emoji: "📚" },
};

export const gamification = {
  pontos: 0,
  medalhas: [],
  curiosidade:
    "Bem-vindo à Citânia! Prepare-se para descobrir curiosidades matemáticas fascinantes!",
  leaderboard: [],
  userName: localStorage.getItem("citaniaUserName") || "Jogador",
};

export async function loadGamification() {
  console.log("Carregando gamificação...");
  
  // Tentar carregar o módulo de math-facts
  await loadMathFactsModule();
  
  const saved = safeGetItem(GAMIFICATION_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      gamification.pontos = data.pontos ?? gamification.pontos;
      gamification.medalhas = Array.isArray(data.medalhas)
        ? data.medalhas
        : gamification.medalhas;
      gamification.curiosidade = data.curiosidade ?? gamification.curiosidade;
      gamification.userName = data.userName ?? gamification.userName;
    } catch {}
  }
  gamification.leaderboard = JSON.parse(safeGetItem(LEADERBOARD_KEY) || "[]");
  
  // Tentar gerar nova curiosidade com fallback
  try {
    generateNewMathFact();
    startAutoFactRotation();
    console.log("Rotação de curiosidades iniciada");
  } catch (error) {
    console.error("Erro ao iniciar curiosidades:", error);
    // Fallback - definir curiosidade estática
    gamification.curiosidade = "🧠 Sabia que a matemática está em toda a parte? Desde as pétalas das flores até às galáxias!";
    updateMathFactDisplay();
  }
}

export function saveGamification() {
  safeSetItem(
    GAMIFICATION_KEY,
    JSON.stringify({
      pontos: gamification.pontos,
      medalhas: gamification.medalhas,
      curiosidade: gamification.curiosidade,
      userName: gamification.userName,
    }),
  );
  safeSetItem(LEADERBOARD_KEY, JSON.stringify(gamification.leaderboard));
}

export function renderGamificationBar(DOM) {
  if (DOM.pointsCountEl) DOM.pointsCountEl.textContent = gamification.pontos;
  if (DOM.userNameEl) DOM.userNameEl.textContent = gamification.userName;
  const medalsList = DOM.medalhasList || DOM.medalhasEl || document.getElementById("medalhas");
  if (medalsList) {
    medalsList.innerHTML = (gamification.medalhas || [])
      .map(
        (b) =>
          `<span class="badge big" title="${b.label}">${b.emoji} ${b.label}</span>`,
      )
      .join(" ");
  }
}

// Renderiza o painel de conquistas (Achievements)
export function renderAchievementsPanel(DOM, state) {
  const panel = DOM.achievementsPanel;
  if (!panel) return;

  const total = (state.score?.correct || 0) + (state.score?.incorrect || 0);
  const badgesHtml =
    (gamification.medalhas || [])
      .map(
        (b) =>
          `<div class="ach-badge"><span class="badge">${b.emoji}</span><div class="ach-badge-label">${b.label}</div></div>`,
      )
      .join("") || '<div class="no-badges">Sem conquistas ainda.</div>';

  panel.innerHTML = `
        <div class="ach-header">
            <button id="close-achievements" aria-label="Fechar">✖</button>
            <h3>Conquistas</h3>
        </div>
        <div class="ach-body">
            <div class="ach-stats">
                <div><strong>Total respostas:</strong> ${total}</div>
                <div><strong>Corretas:</strong> ${state.score?.correct || 0}</div>
                <div><strong>Incorrretas:</strong> ${state.score?.incorrect || 0}</div>
                <div><strong>Pontos:</strong> ${gamification.pontos || 0}</div>
            </div>
            <h4>Medalhas</h4>
            <div class="ach-badges">${badgesHtml}</div>
        </div>
    `;

  // fechar
  const closeBtn = panel.querySelector("#close-achievements");
  closeBtn?.addEventListener("click", () => {
    // Primeiro move o foco para fora do painel antes de esconder
    const achievementsButton = document.getElementById("achievements-button");
    if (achievementsButton) {
      achievementsButton.focus();
    } else {
      // Fallback para o body se o botão não existir
      document.body.focus();
    }
    
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true"); // Agora é seguro restaurar aria-hidden
  });
}

// Abre o painel de achievements e renderiza o conteúdo
export function showAchievementsPanel(DOM, state) {
  const panel = DOM?.achievementsPanel;
  if (!panel) return;
  try {
    renderAchievementsPanel(DOM, state);
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false"); // Remove aria-hidden quando aberto
    const closeBtn = panel.querySelector("#close-achievements");
    closeBtn?.focus();
  } catch (e) {
    console.warn("showAchievementsPanel error", e);
  }
}

// Gera e mostra uma nova curiosidade matemática
export function generateNewMathFact(level = null) {
  try {
    let newFact;
    
    if (level) {
      // Se um nível for especificado, usar curiosidade baseada no nível
      newFact = getLevelBasedMathFact(level);
    } else {
      // Caso contrário, usar curiosidade aleatória
      newFact = getRandomMathFact();
    }
    
    gamification.curiosidade = newFact;
    updateMathFactDisplay();
    saveGamification();
  } catch (error) {
    console.error("Erro ao gerar curiosidade:", error);
    // Fallback para curiosidades estáticas usando a função de fallback
    gamification.curiosidade = getFallbackMathFact();
    updateMathFactDisplay();
    saveGamification();
  }
}

// Inicia a rotação automática de curiosidades
export function startAutoFactRotation(level = null) {
  try {
    // Parar rotação anterior se existir
    if (factRotationController) {
      factRotationController.stop();
    }
    
    // Função callback para atualizar a curiosidade
    const updateCallback = (fact) => {
      gamification.curiosidade = fact;
      updateMathFactDisplay();
      saveGamification();
    };
    
    // Iniciar nova rotação
    factRotationController = startFactRotation(updateCallback, !!level, level);
    console.log("Rotação automática iniciada");
  } catch (error) {
    console.error("Erro ao iniciar rotação automática:", error);
    // Fallback - usar timer simples
    factRotationController = {
      intervalId: setInterval(() => {
        generateNewMathFact(level);
      }, 15000), // 15 segundos
      stop: function() {
        if (this.intervalId) {
          clearInterval(this.intervalId);
        }
      }
    };
  }
}

// Para a rotação automática
export function stopAutoFactRotation() {
  try {
    if (factRotationController) {
      factRotationController.stop();
      factRotationController = null;
      console.log("Rotação automática parada");
    }
  } catch (error) {
    console.error("Erro ao parar rotação automática:", error);
  }
}

// Atualiza a exibição da curiosidade matemática no DOM
function updateMathFactDisplay() {
  try {
    const curiosidadeEl = document.getElementById("narrativa") || 
                          document.getElementById("curiosidade") ||
                          document.querySelector(".curiosidade-matematica");
    
    if (curiosidadeEl) {
      // Limpar conteúdo anterior
      curiosidadeEl.innerHTML = '';
      
      // Adicionar ícone de curiosidade
      const icon = document.createElement('span');
      icon.className = 'curiosidade-icon';
      icon.textContent = '🧠 ';
      icon.style.marginRight = '0.5rem';
      
      // Adicionar texto da curiosidade
      const textNode = document.createTextNode(gamification.curiosidade);
      
      curiosidadeEl.appendChild(icon);
      curiosidadeEl.appendChild(textNode);
      
      console.log("Curiosidade atualizada:", gamification.curiosidade.substring(0, 50) + "...");
    } else {
      console.warn("Elemento de curiosidade não encontrado");
    }
  } catch (error) {
    console.error("Erro ao atualizar curiosidade:", error);
  }
}

// Função de compatibilidade - substitui mostrarNarrativa
export function mostrarNarrativa(DOM, level) {
  generateNewMathFact(level);
}

export function mostrarFeedbackGamificacao(DOM, mensagem) {
  if (DOM.feedbackEl) {
    DOM.feedbackEl.innerHTML += `<br><span class="gamification-feedback">${mensagem}</span>`;
  }
}

export function adicionarPontos(DOM, valor) {
  gamification.pontos += valor;
  mostrarFeedbackGamificacao(
    DOM,
    `+${valor} pontos! Total: ${gamification.pontos}`,
  );
  renderGamificationBar(DOM);
  saveGamification();
}

export function hasBadge(id) {
  return gamification.medalhas.some((b) => b.id === id);
}
export function awardBadge(DOM, badge) {
  if (hasBadge(badge.id)) return;
  gamification.medalhas.push(badge);
  mostrarFeedbackGamificacao(
    DOM,
    `🏅 Medalha conquistada: ${badge.emoji} ${badge.label}!`,
  );
  renderGamificationBar(DOM);
  saveGamification();
}

export default {
  GAMIFICATION_KEY,
  LEADERBOARD_KEY,
  BADGES,
  gamification,
  loadGamification,
  saveGamification,
  renderGamificationBar,
  adicionarPontos,
  awardBadge,
};
