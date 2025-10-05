// js/features/gamification.js
import { safeGetItem, safeSetItem } from "../utils/storage.js";

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
  narrativa:
    "Bem-vindo à missão Citania! Descobre os segredos da cidade antiga completando desafios.",
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
      gamification.narrativa = data.narrativa ?? gamification.narrativa;
      gamification.userName = data.userName ?? gamification.userName;
    } catch {}
  }
  gamification.leaderboard = JSON.parse(safeGetItem(LEADERBOARD_KEY) || "[]");
}

export function saveGamification() {
  safeSetItem(
    GAMIFICATION_KEY,
    JSON.stringify({
      pontos: gamification.pontos,
      medalhas: gamification.medalhas,
      narrativa: gamification.narrativa,
      userName: gamification.userName,
    }),
  );
  safeSetItem(LEADERBOARD_KEY, JSON.stringify(gamification.leaderboard));
}

export function renderGamificationBar(DOM) {
  if (DOM.pointsCountEl) DOM.pointsCountEl.textContent = gamification.pontos;
  if (DOM.userNameEl) DOM.userNameEl.textContent = gamification.userName;
  const medalsList = DOM.medalhasList;
  if (medalsList) {
    medalsList.innerHTML = gamification.medalhas
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
    panel.classList.add('open');
    const closeBtn = panel.querySelector('#close-achievements');
    closeBtn?.focus();
  } catch (e) {
    console.warn('showAchievementsPanel error', e);
  }
}

// Mostra a narrativa/missão para o nível actual
export function mostrarNarrativa(DOM, level) {
  const lvl = Number(level) || 1;
  // Texto da narrativa (poderia ser externalizado)
  function narrativaPorNivel(level) {
    switch (level) {
      case 1:
        return "Bem-vindo à Citânia de Sanfins, um antigo povoado fortificado (castro) em Paços de Ferreira. Começa a explorar as primeiras casas e caminhos.";
      case 2:
        return "Observa as muralhas concêntricas que protegiam a comunidade e as casas circulares construídas em pedra. Avança com cuidado pelos becos do castro.";
      case 3:
        return "Chegam influências romanas: novas técnicas e objetos do dia a dia. Descobre como a romanização mudou a vida no povoado.";
      case 4:
        return "Visita o Museu Arqueológico da Citânia e liga as pistas: ferramentas, cerâmica e estruturas defensivas contam histórias de séculos.";
      default:
        return "Continua a tua missão arqueológica: cada desafio revela mais segredos da Citânia de Sanfins!";
    }
  }

  gamification.narrativa = narrativaPorNivel(lvl);
  if (DOM.narrativa) DOM.narrativa.textContent = gamification.narrativa;
  saveGamification();
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
