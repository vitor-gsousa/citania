// js/app.js

// Import utilitários ESM
import { initSounds, sounds } from "./services/sounds.js";
import {
  loadGamification,
  saveGamification,
  renderGamificationBar,
  mostrarNarrativa,
} from "./features/gamification.js";
import { migrateOldProgress } from "./progress.js";
import { applyTheme } from "./theme.js";
import { initEventListeners } from "./events.js";
import normalizeIcons from "./utils/icon-utils.js";

// Elementos do DOM
const DOM = {
  menuContainer: document.getElementById("menu-container"),
  exerciseArea: document.getElementById("exercise-area"),
  summaryArea: document.getElementById("summary-area"),
  questionEl: document.getElementById("question"),
  answerInput: document.getElementById("answer-input"),
  checkButton: document.getElementById("check-button"),
  feedbackEl: document.getElementById("feedback"),
  nextButton: document.getElementById("next-button"),
  backButton: document.getElementById("back-to-menu"),
  nextLevelButton: document.getElementById("next-level-button"),
  currentLevelEl: document.getElementById("current-level"),
  progressBar: document.getElementById("progress-bar"),
  summaryCorrect: document.getElementById("summary-correct"),
  summaryTotal: document.getElementById("summary-total"),
  themeToggleButton: document.getElementById("theme-toggle"),
  summaryRecordMessage: document.getElementById("summary-record-message"),
  exerciseCards: document.querySelectorAll(".card"),
  gamificationBar: document.getElementById("gamification-bar"),
  pointsCountEl: document.getElementById("points-count"),
  badgesStripEl: document.getElementById("badges-strip"),
  userButton: document.getElementById("user-button"),
  userNameEl: document.getElementById("user-name"),
  // elementos adicionais referenciados no código
  medalhasList: document.getElementById("medalhas-list") || document.getElementById("medalhas"),
  narrativa: document.getElementById("narrativa"),
  achievementsPanel: document.getElementById("achievements-panel"),
  achievementsButton: document.getElementById("achievements-button"),
  leaderboard: document.getElementById("leaderboard"),
  medalhasEl: document.getElementById("medalhas"),
  customKeyboard: document.getElementById("custom-keyboard"),
  levelBadgeEl: document.getElementById("level-badge"),
  novaCuriosidadeBtn: document.getElementById("nova-curiosidade"),
  toggleRotacaoBtn: document.getElementById("toggle-rotacao"),
  // Popup da narrativa
  narrativePopup: document.getElementById("narrative-popup"),
  narrativePopupText: document.getElementById("narrative-popup-text"),
  closeNarrativePopup: document.getElementById("close-narrative-popup"),
};

// Estado global da aplicação
const state = {
  score: { correct: 0, incorrect: 0 },
  answered: false,
  level: 1,
  roundProgress: 0,
  exercisesPerRound: 8,
  explanationLimit: 5,
  exerciseStartTs: 0,
  streak: 0,
};

// Define a constante para a duração da animação, correspondente a var(--transition-medium)
const ANIMATION_DURATION_MS = 320;

// --- Lógica dos Exercícios ---

// Mostra a secção identificada por id e esconde o menu principal
async function showSection(sectionId) {
  // Mostrar a secção pedida e esconder apenas a grid de temas (#themes)
  const themesList = document.getElementById("themes");
  const section = document.getElementById(sectionId);
  const mainElement = document.querySelector('main');
  if (!section) return;
  
  // Preservar altura atual do main durante a transição
  if (mainElement) {
    const currentHeight = mainElement.offsetHeight;
    mainElement.style.setProperty('--preserved-height', `${currentHeight}px`);
    mainElement.classList.add('transitioning');
  }
  
  // Agora esconder a lista de temas e animar a entrada da secção
  if (themesList) {
    console.debug("showSection: hiding themesList", themesList);
    ensureFocusNotInside(themesList);
    await animateHide(themesList);
    themesList.classList.add("hidden");
    themesList.setAttribute("aria-hidden", "true"); // Esconder também para leitores de ecrã
  }
  
  // esconder todas as outras sections
  const sections = Array.from(document.querySelectorAll(".theme-section"));
  sections.forEach((s) => {
    if (s !== section) {
      console.debug("showSection: marking aria-hidden on section", s.id || s);
      ensureFocusNotInside(s);
      s.setAttribute("aria-hidden", "true");
    }
  });
  
  // Mostrar a secção alvo e animar entrada
  section.classList.remove("hidden");
  section.setAttribute("aria-hidden", "false");
  await animateShow(section);
  
  // Remover preservação de altura após transição
  if (mainElement) {
    setTimeout(() => { // NOSONAR
      mainElement.classList.remove('transitioning');
      mainElement.style.removeProperty('--preserved-height');
    }, ANIMATION_DURATION_MS);
  }
  
  // optional: scroll to top of main exercise area
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {}
}

// Regressa ao menu de temas
async function showThemes() {
  // Pré-carregar a lista de temas para calcular layout
  const themesList = document.getElementById("themes");
  const mainElement = document.querySelector('main');
  
  // Preservar altura atual do main durante a transição
  if (mainElement) { // NOSONAR
    const currentHeight = mainElement.offsetHeight;
    mainElement.style.setProperty('--preserved-height', `${currentHeight}px`);
    mainElement.classList.add('transitioning');
  }
  
  // esconder todas as sections com animação e só adicionar .hidden depois
  const sections = Array.from(document.querySelectorAll(".theme-section"));
  await Promise.all(
    sections.map(async (s) => {
      console.debug("showThemes: animating hide for section", s.id || s);
      ensureFocusNotInside(s);
      await animateHide(s);
      s.classList.add("hidden");
      s.setAttribute("aria-hidden", "true");
    }),
  );
  
  if (themesList) {
    console.debug("showThemes: showing themesList", themesList); // NOSONAR
    themesList.classList.remove("hidden");
    themesList.setAttribute("aria-hidden", "false");
    await animateShow(themesList);
  }
  
  // Remover preservação de altura após transição
  if (mainElement) {
    setTimeout(() => { // NOSONAR
      mainElement.classList.remove('transitioning');
      mainElement.style.removeProperty('--preserved-height');
    }, ANIMATION_DURATION_MS);
  }
  
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {}
}

// A função `waitForLayout` foi removida, pois para animações de opacidade e transformação,
// o browser geralmente lida bem com o layout sem a necessidade de forçar um cálculo explícito.

// Helpers de animação: aplicam classes temporárias para forçar transições
function animateShow(el) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    // Respeitar preferências do utilizador
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { // NOSONAR
      el.classList.remove("hidden");
      return resolve();
    }

    // 1. Definir o estado inicial da animação (invisível e deslocado)
    el.classList.add("animating-in");
    // 2. Tornar o elemento visível (display: block)
    el.classList.remove("hidden");

    // 3. Forçar um reflow para que o browser renderize o estado inicial ANTES da transição
    void el.offsetWidth; // Crucial para que a transição seja percebida

    // 4. No próximo frame, remover a classe 'animating-in' para que o elemento transite para o seu estado final (visível)
    requestAnimationFrame(() => {
      el.classList.remove("animating-in");
    });

    // 5. Concluir: Após a duração total da animação, resolvemos a promessa.
    setTimeout(() => {
      resolve();
    }, ANIMATION_DURATION_MS);
  });
}

function animateHide(el) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { // NOSONAR
      el.classList.add("hidden");
      return resolve();
    }

    // 1. Iniciar animação: Adicionar a classe que o fará transitar para o estado invisível.
    el.classList.add("animating-out");

    // 2. Concluir: Após a animação, escondemos o elemento com display:none e limpamos a classe.
    setTimeout(() => {
      el.classList.add("hidden"); // Adiciona display:none
      el.classList.remove("animating-out"); // Limpa a classe de animação
      resolve();
    }, ANIMATION_DURATION_MS);
  });
}

// Move focus out of `el` if any descendant currently has focus.
function ensureFocusNotInside(el) {
  try {
    const active = document.activeElement;
    if (!active) return;
    if (el && el.contains(active)) {
      // Tenta focar o container do menu ou o body como fallback
      const fallback = document.getElementById("menu-container") || document.body;
      if (fallback && typeof fallback.focus === "function") {
        // tornar focable temporariamente se necessário
        const prevTabIndex = fallback.getAttribute("tabindex");
        if (prevTabIndex === null) fallback.setAttribute("tabindex", "-1");
        fallback.focus();
        if (prevTabIndex === null) fallback.removeAttribute("tabindex");
      } else {
        // blur actual element
        try {
          active.blur();
        } catch (e) {}
      }
    }
  } catch (e) {
    /* silent */
  }
}

// Mostrar UI de Level Up: reproduz som e atualiza resumo
function showLevelUpUI() {
  // Reproduzir som levelup (se carregado)
  try {
    if (
      typeof sounds !== "undefined" &&
      sounds.levelup &&
      typeof sounds.levelup.play === "function"
    ) {
      sounds.levelup.play().catch(() => {}); // ignora Promise rejection por autoplay
    }
  } catch (e) {
    console.warn("Erro a reproduzir levelup sound:", e);
  }

  // Atualizar resumo das respostas (assume existence de elementos #summary-correct, #summary-total)
  const summaryCorrectEl =
    DOM.summaryCorrect ||
    document.querySelector("#summary-area #summary-correct");
  const summaryTotalEl =
    DOM.summaryTotal || document.querySelector("#summary-area #summary-total");

  const correct =
    state && state.score && Number.isFinite(state.score.correct)
      ? state.score.correct
      : 0;
  const incorrect =
    state && state.score && Number.isFinite(state.score.incorrect)
      ? state.score.incorrect
      : 0;

  if (summaryCorrectEl) summaryCorrectEl.textContent = String(correct);
  if (summaryTotalEl) summaryTotalEl.textContent = String(correct + incorrect);

  // mostra o painel de summary se existir
  const summaryPanel = DOM.summaryArea;
  if (summaryPanel) summaryPanel.classList.add("open");
}

// --- Inicialização da Aplicação ---

async function initApp() {
  console.log("Iniciando aplicação...");
  
  try {
    // 1. Aplicar tema guardado
    const savedTheme = localStorage.getItem("matematicaAppTheme") || "light";
    applyTheme(savedTheme);

    // 2. Carregar dados persistidos
    console.log("Carregando dados de gamificação...");
    migrateOldProgress();
    await loadGamification();
    renderGamificationBar(DOM);
    mostrarNarrativa(DOM, state.level);
    
    console.log("Gamificação carregada com sucesso");
  } catch (error) {
    console.error("Erro na inicialização da gamificação:", error);
    // Fallback - definir curiosidade manualmente se a importação falhar
    const narrativaEl = document.getElementById("narrativa");
    if (narrativaEl) {
      narrativaEl.textContent = "🧠 Bem-vindos à Citânia! Vamos explorar a matemática juntos!";
    }
  }

  // 3. Inicializar sons
  initSounds();

  // 4. Configurar event listeners dos cards/menus
  initEventListeners(DOM, state);

  // 5. Registar Service Worker (após o load para não bloquear o render inicial)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => console.log("Service Worker registado:", reg.scope))
        .catch((err) =>
          console.log("Falha ao registar o Service Worker:", err),
        );
    });
  }

  console.log("App initialized successfully");
}

// Ponto de entrada único da aplicação
document.addEventListener("DOMContentLoaded", initApp);
document.addEventListener("DOMContentLoaded", normalizeIcons);
