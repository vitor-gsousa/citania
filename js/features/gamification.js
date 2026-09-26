import { safeGetItem, safeSetItem } from "../utils/storage.js";
import { getPlayerName, setPlayerName } from "../services/user-profile.js";
import {
  getRandomMathFact,
  getLevelBasedMathFact,
  startFactRotation,
} from "../modules/utils/math-facts.js";

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
  userName: getPlayerName(),
};

export async function loadGamification() {
  console.log("Carregando gamificação...");
  
  const saved = safeGetItem(GAMIFICATION_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      gamification.pontos = data.pontos ?? gamification.pontos;
      gamification.medalhas = Array.isArray(data.medalhas)
        ? data.medalhas
        : gamification.medalhas;
      gamification.curiosidade = data.curiosidade ?? gamification.curiosidade;
      gamification.userName = data.userName ? setPlayerName(data.userName) : getPlayerName();
    } catch (e) {
      console.warn("Erro ao parsear dados guardados de gamificação:", e);
    }
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
    gamification.curiosidade = "🧠 A matemática é a linguagem universal do universo!";
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
  if (typeof document === "undefined") return;

  const curiosidadeEl = document.getElementById("narrativa");
  const popupTextEl = document.getElementById("narrative-popup-text");

  // Atualiza o card no desktop
  if (curiosidadeEl) {
    curiosidadeEl.innerHTML = `
      <span class="curiosidade-icon">🧠</span>
      ${gamification.curiosidade}
    `;
  }

  // Atualiza o popup em mobile
  if (popupTextEl) {
    popupTextEl.textContent = gamification.curiosidade;
  }
}

// Função de compatibilidade - substitui mostrarNarrativa
export function mostrarNarrativa(level) {
  generateNewMathFact(level);
}

export function showNarrativePopup(DOM) {
  if (window.innerWidth > 768) return; // Apenas em mobile
  if (DOM.narrativePopup) {
    DOM.narrativePopup.classList.remove("hidden");
    DOM.closeNarrativePopup.focus();
  }
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
