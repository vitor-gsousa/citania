// js/features/gamification.js
import { safeGetItem, safeSetItem } from "../utils/storage.js";
import { getRandomMathFact, getLevelBasedMathFact, startFactRotation } from "../modules/utils/math-facts.js";

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

export function loadGamification() {
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
  
  // Gerar nova curiosidade e iniciar rotação automática
  generateNewMathFact();
  startAutoFactRotation();
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
    panel.classList.remove("open");
  });
}

// Abre o painel de achievements e renderiza o conteúdo
export function showAchievementsPanel(DOM, state) {
  const panel = DOM?.achievementsPanel;
  if (!panel) return;
  try {
    renderAchievementsPanel(DOM, state);
    panel.classList.add("open");
    const closeBtn = panel.querySelector("#close-achievements");
    closeBtn?.focus();
  } catch (e) {
    console.warn("showAchievementsPanel error", e);
  }
}

// Gera e mostra uma nova curiosidade matemática
export function generateNewMathFact(level = null) {
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
}

// Inicia a rotação automática de curiosidades
export function startAutoFactRotation(level = null) {
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
}

// Para a rotação automática
export function stopAutoFactRotation() {
  if (factRotationController) {
    factRotationController.stop();
    factRotationController = null;
  }
}

// Atualiza a exibição da curiosidade matemática no DOM
function updateMathFactDisplay() {
  const curiosidadeEl = document.getElementById("narrativa") || 
                        document.getElementById("curiosidade") ||
                        document.querySelector(".curiosidade-matematica");
  
  if (curiosidadeEl) {
    curiosidadeEl.textContent = gamification.curiosidade;
    
    // Adicionar ícone de curiosidade se não existir
    if (!curiosidadeEl.querySelector('.curiosidade-icon')) {
      const icon = document.createElement('span');
      icon.className = 'curiosidade-icon';
      icon.textContent = '🧠 ';
      icon.style.marginRight = '0.5rem';
      curiosidadeEl.insertBefore(icon, curiosidadeEl.firstChild);
    }
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
