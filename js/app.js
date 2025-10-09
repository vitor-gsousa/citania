// js/app.js

// Import utilitários ESM
import { initSounds } from "./services/sounds.js";
import {
  loadGamification,
  renderGamificationBar,
  mostrarNarrativa,
} from "./features/gamification.js";
import { initPWAInstall } from "./features/pwa-install.js";
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
export async function showSection(sectionId) {
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
    themesList.inert = true; // Usar inert para desativar interação e acessibilidade
    await animateHide(themesList);
  }
  
  // esconder todas as outras sections
  const sections = Array.from(document.querySelectorAll(".theme-section"));
  sections.forEach((s) => {
    if (s !== section) {
      console.debug("showSection: marking aria-hidden on section", s.id || s);
      s.inert = true; // Usar inert
    }
  });
  
  // Mostrar a secção alvo e animar entrada
  section.classList.remove("hidden");
  section.inert = false; // Reativar a secção alvo
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
export async function showThemes() {
  // Pré-carregar a lista de temas para calcular layout
  const themesList = document.getElementById("themes");
  const firstThemeCard = themesList?.querySelector('.card[role="button"]');
  const mainElement = document.querySelector('main');
  // Áreas que podem precisar de ser escondidas
  const exerciseArea = document.getElementById("exercise-area");
  const summaryArea = document.getElementById("summary-area");
  
  // 1. Mover o foco para um elemento seguro ANTES de esconder qualquer coisa.
  // Isto é crucial para resolver o aviso de acessibilidade.
  if (firstThemeCard) {
    firstThemeCard.focus({ preventScroll: true });
  } else {
    document.body.focus();
  }

  // 2. Preservar altura atual do main durante a transição
  if (mainElement) {
    const currentHeight = mainElement.offsetHeight;
    mainElement.style.setProperty('--preserved-height', `${currentHeight}px`);
    mainElement.classList.add('transitioning');
  }
  
  // 3. Esconder todas as secções de sub-temas, a área de exercício e o sumário.
  const elementsToHide = [
    ...Array.from(document.querySelectorAll(".theme-section")),
    exerciseArea,
    summaryArea
  ].filter(Boolean); // Filtra nulos se algum elemento não existir

  await Promise.all(
    elementsToHide.map(async (el) => {
      // Apenas animar se não estiver já escondido
      if (!el.classList.contains('hidden')) {
        console.debug("showThemes: hiding element", el.id || el);
        el.inert = true; // Marcar como inerte imediatamente
        await animateHide(el, true); // Passar true para garantir a remoção do foco
      } else {
        el.inert = true; // Garantir que está inerte mesmo que já esteja escondido
      }
    })
  );
  
  // CORREÇÃO CRÍTICA: Garantir que o contentor principal do menu está visível.
  const menuContainer = document.getElementById("menu-container");
  if (menuContainer) {
    menuContainer.classList.remove("hidden");
  }

  if (themesList) {
    console.debug("showThemes: showing themesList", themesList); // NOSONAR
    themesList.classList.remove("hidden");
    themesList.inert = false; // Reativar a lista de temas
    await animateShow(themesList);
  }
  
  // 4. Remover preservação de altura após transição
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
// o browser geralmente lida bem com o layout sem a necessidade de forçar um cálculo explícito. // NOSONAR

// Helpers de animação: aplicam classes temporárias para forçar transições
function animateShow(el, setFocus = false) {
  return new Promise((resolve) => {
    if (!el) { return resolve(); }
    // Respeitar preferências do utilizador
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { // NOSONAR
      el.classList.remove("hidden");
      return resolve();
    }

    // 1. Definir o estado inicial da animação (invisível e deslocado)
    el.classList.add("animating-in"); // Define opacity: 0, transform: translateY(...)
    // 2. Tornar o elemento visível (display: block)
    el.classList.remove("hidden");

    // 3. Forçar um reflow para que o browser renderize o estado inicial ANTES da transição
    void el.offsetWidth; // Crucial para que a transição seja percebida

    // 4. No próximo frame, remover a classe 'animating-in' para que o elemento transite para o seu estado final (visível)
    requestAnimationFrame(() => {
      el.classList.remove("animating-in"); // NOSONAR
      if (setFocus) el.focus({ preventScroll: true });
    });

    // 5. Concluir: Após a duração total da animação, resolvemos a promessa.
    setTimeout(() => {
      resolve();
    }, ANIMATION_DURATION_MS);
  });
}

function animateHide(el, ensureNoFocus = false) {
  return new Promise((resolve) => {
    if (!el) { return resolve(); }
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) { // NOSONAR
      // Mesmo com movimento reduzido, garantir que o foco é removido
      if (ensureNoFocus) ensureFocusNotInside(el);
      el.classList.add("hidden");
      return resolve();
    }

    // 1. Iniciar animação: Adicionar a classe que o fará transitar para o estado invisível.
    el.classList.add("animating-out");

    // Garantir que o foco é removido no início da animação
    if (ensureNoFocus) ensureFocusNotInside(el);

    // 2. Concluir: Após a animação, escondemos o elemento com display:none e limpamos a classe.
    setTimeout(() => {
      el.classList.add("hidden");
      el.classList.remove("animating-out"); // NOSONAR
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
    mostrarNarrativa(state.level);
    
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

  // 5. Inicializar funcionalidade de instalação PWA
  initPWAInstall();

  // 6. Registar Service Worker (após o load para não bloquear o render inicial)
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
