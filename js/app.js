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
import { initTabNavigation, updatePlayerStats } from "./tab-navigation.js";
import { initAchievementsPanel } from "./features/achievements-panel.js";

// Import templates e configuração
import { initializeTemplates } from "./templates/template-manager.js";
import { EXERCISE_TYPES } from "./config/exercise-types.js";
import { getExercisesByArea, getExerciseInfo } from "./config/exercise-types.js";
import { currentExercise } from "./exercise.js";

// Elementos do DOM
const DOM = typeof document !== 'undefined' ? {
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
} : {};

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
  currentArea: null,
};

// Define a constante para a duração da animação, correspondente a var(--transition-medium)
// REDUZIDO para melhor responsividade - transições rápidas não prejudicam a UX
const ANIMATION_DURATION_MS = 240;
let swCheckIntervalId = null;

// --- Funções de atualização de título ---

/**
 * Atualiza o título da página baseado no estado atual
 */
export function updatePageTitle() {
  const pageTitleEl = document.getElementById('page-title');
  if (!pageTitleEl) return;

  if (!state.currentArea) {
    // Estado inicial: apenas o título principal
    pageTitleEl.innerHTML = '<h1>Citânia - Matemática Divertida</h1>';
  } else if (!currentExercise.type) {
    // Área selecionada: título principal em h2, nome da área em h1
    const areaData = getExercisesByArea(state.currentArea);
    if (areaData) {
      pageTitleEl.innerHTML = '<h2>Citânia - Matemática Divertida</h2><h1>' + areaData.title + '</h1>';
    }
  } else {
    // Exercício iniciado: nome da área em h2, nome do exercício em h1
    const areaData = getExercisesByArea(state.currentArea);
    const exerciseInfo = getExerciseInfo(currentExercise.type);
    if (areaData && exerciseInfo) {
      pageTitleEl.innerHTML = '<h2>' + areaData.title + '</h2><h1>' + exerciseInfo.text + '</h1>';
    }
  }
}

// Mostra a secção identificada por id e esconde o menu principal
export async function showSection(sectionId) {
  // Mostrar a secção pedida e esconder apenas a grid de temas (#themes)
  const themesList = document.getElementById("themes");
  const section = document.getElementById(sectionId);
  const mainElement = document.querySelector('main');
  if (!section) return;
  
  // Atualizar estado da área atual
  state.currentArea = sectionId.replace('section-', '');
  updatePageTitle();
  
  // Preservar altura atual do main durante a transição
  if (mainElement) {
    const currentHeight = mainElement.offsetHeight;
    mainElement.style.setProperty('--preserved-height', `${currentHeight}px`);
    mainElement.classList.add('transitioning');
  }
  
  // 1. Animar a saída da lista de temas PRIMEIRO
  if (themesList) {
    console.debug("showSection: hiding themesList", themesList);
    ensureFocusNotInside(themesList);
    themesList.inert = true; // Usar inert para desativar interação e acessibilidade
    await animateHide(themesList);
  }
  
  // 2. esconder todas as outras sections (sem animar, apenas hidden)
  const sections = Array.from(document.querySelectorAll(".theme-section"));
  sections.forEach((s) => {
    if (s !== section) {
      console.debug("showSection: marking aria-hidden on section", s.id || s);
      s.inert = true; // Usar inert
      s.classList.add("hidden");
    }
  });
  
  // 3. Mostrar a secção alvo e animar entrada
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
  } catch (e) {
    // Scroll falhou - não é crítico
  }
}

// Regressa ao menu de temas
export async function showThemes() {
  // Pré-carregar a lista de temas para calcular layout
  const themesList = document.getElementById("themes");
  const firstThemeCard = themesList?.querySelector('.card[role="button"]');
  const mainElement = document.querySelector('main');
  
  // Atualizar estado da área atual
  state.currentArea = null;
  updatePageTitle();
  
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
  
  // esconder todas as sections com animação AGUARDANDO para ter transição suave ao voltar
  const sections = Array.from(document.querySelectorAll(".theme-section"));
  await Promise.all(
    sections.map(async (s) => {
      console.debug("showThemes: animating hide for section", s.id || s);
      s.inert = true; // Marcar como inerte imediatamente
      await animateHide(s, true); // Passar true para garantir a remoção do foco
    }),
  );
  
  if (themesList) {
    themesList.classList.remove("hidden");
    themesList.inert = false; // Reativar a lista de temas
    await animateShow(themesList);
  }
  
  // 4. Remover preservação de altura após transição
  if (mainElement) {
    setTimeout(() => {
      mainElement.classList.remove('transitioning');
      mainElement.style.removeProperty('--preserved-height');
    }, ANIMATION_DURATION_MS);
  }
  
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    // Scroll falhou - não é crítico
  }
}

// A função `waitForLayout` foi removida, pois para animações de opacidade e transformação,
// o browser geralmente lida bem com o layout sem a necessidade de forçar um cálculo explícito.

// Helpers de animação: aplicam classes temporárias para forçar transições
function animateShow(el, setFocus = false) {
  return new Promise((resolve) => {
    if (!el) { return resolve(); }
    // Respeitar preferências do utilizador
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      el.classList.remove("animating-in");
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
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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
      el.classList.remove("animating-out");
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
        } catch (e) {
          // Blur falhou - não é crítico
        }
      }
    }
  } catch (e) {
    /* silent */
  }
}

// --- Inicialização da Aplicação ---

/**
 * Atualiza as referências DOM após os templates serem carregados
 * Necessário porque os elements são criados dinamicamente
 */
function updateDOMReferences() {
  DOM.menuContainer = document.getElementById("menu-container");
  DOM.exerciseArea = document.getElementById("exercise-area");
  DOM.summaryArea = document.getElementById("summary-area");
  DOM.questionEl = document.getElementById("question");
  DOM.answerInput = document.getElementById("answer-input");
  DOM.checkButton = document.getElementById("check-button");
  DOM.feedbackEl = document.getElementById("feedback");
  DOM.nextButton = document.getElementById("next-button");
  DOM.backButton = document.getElementById("back-to-menu");
  DOM.nextLevelButton = document.getElementById("next-level-button");
  DOM.currentLevelEl = document.getElementById("current-level");
  DOM.progressBar = document.getElementById("progress-bar");
  DOM.summaryCorrect = document.getElementById("summary-correct");
  DOM.summaryTotal = document.getElementById("summary-total");
  DOM.themeToggleButton = document.getElementById("theme-toggle");
  DOM.summaryRecordMessage = document.getElementById("summary-record-message");
  DOM.exerciseCards = document.querySelectorAll(".card");
  DOM.gamificationBar = document.getElementById("gamification-bar");
  DOM.pointsCountEl = document.getElementById("points-count");
  DOM.badgesStripEl = document.getElementById("badges-strip");
  DOM.userButton = document.getElementById("user-button");
  DOM.userNameEl = document.getElementById("user-name");
  DOM.medalhasList = document.getElementById("medalhas-list") || document.getElementById("medalhas");
  DOM.narrativa = document.getElementById("narrativa");
  DOM.achievementsPanel = document.getElementById("achievements-panel");
  DOM.achievementsButton = document.getElementById("achievements-button");
  DOM.leaderboard = document.getElementById("leaderboard");
  DOM.medalhasEl = document.getElementById("medalhas");
  DOM.customKeyboard = document.getElementById("custom-keyboard");
  DOM.levelBadgeEl = document.getElementById("level-badge");
  DOM.novaCuriosidadeBtn = document.getElementById("nova-curiosidade");
  DOM.toggleRotacaoBtn = document.getElementById("toggle-rotacao");
  DOM.narrativePopup = document.getElementById("narrative-popup");
  DOM.narrativePopupText = document.getElementById("narrative-popup-text");
  DOM.closeNarrativePopup = document.getElementById("close-narrative-popup");

  console.log(`Referências DOM atualizadas: ${DOM.exerciseCards.length} cards encontrados`);
}

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
    setHeaderHeight(); // Definir altura do header após renderizar
    mostrarNarrativa(state.level);
    
    // 3. Inicializar templates dinâmicos
    console.log("Inicializando templates...");
    initializeTemplates();
    
    // 4. Atualizar referências DOM após templates carregados
    updateDOMReferences();
    
    console.log("Gamificação carregada com sucesso");
  } catch (error) {
    console.error("Erro na inicialização da gamificação:", error);
    // Fallback - definir curiosidade manualmente se a importação falhar
    const narrativaEl = document.getElementById("narrativa");
    if (narrativaEl) {
      narrativaEl.textContent = "🧠 Bem-vindos à Citânia! Vamos explorar a matemática juntos!";
    }
  }

  // 5. Inicializar sons
  initSounds();

  // 6. Configurar event listeners dos cards/menus
  initEventListeners(DOM, state);

  // 6.5 Inicializar navegação de abas (footer tabs em mobile)
  initTabNavigation();

  // 6.6 Inicializar painel de conquistas (desktop)
  initAchievementsPanel();

  // 7. Inicializar funcionalidade de instalação PWA
  initPWAInstall();

  // 8. Registar Service Worker (após o load para não bloquear o render inicial)
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then((reg) => {
          console.log("Service Worker registado:", reg.scope);

          // Se houver um service worker em espera, avisa o utilizador
          if (reg.waiting) {
            promptUserToRefresh(reg);
          }

          // Solicita imediatamente ao navegador uma verificação por uma nova versão do sw.js
          // Isto ajuda a detetar atualizações sem a necessidade de um hard refresh
          try {
            reg.update().catch(() => {
              // Erro ao atualizar SW - não é crítico
            });
          } catch (e) {
            // Erro inesperado - não é crítico
          }

          // Quando um novo SW for instalado (statechange para 'installed')
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Nova versão disponível
                  promptUserToRefresh(reg);
                }
              }
            });
          });

          // Opcional: escuta mensagens vindas do SW
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data) {
              console.log('Mensagem do SW:', event.data);
            }
          });
        })
        .catch((err) =>
          console.log("Falha ao registar o Service Worker:", err),
        );
    });
  }

  // Função utilitária para verificar e aplicar atualizações do Service Worker
  function checkForSWUpdate() {
    try {
      navigator.serviceWorker.getRegistration().then((r) => {
        if (!r) return;
        // Se já houver um SW em waiting, mostra o prompt
        if (r.waiting) {
          promptUserToRefresh(r);
          return;
        }
        // Caso contrário, pede ao browser para verificar nova versão do script
        r.update().catch(() => {
          // Erro ao atualizar SW - não é crítico
        });
      }).catch(() => {
        // Erro ao obter registro do SW - não é crítico
      });
    } catch (e) {
      // Erro inesperado - não é crítico
    }
  }

  // Verifica quando a página fica visível (útil em mobile quando o utilizador abre a app)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForSWUpdate();
  });

  // Também verifica quando a janela ganha foco (fallback)
  window.addEventListener('focus', () => checkForSWUpdate());

  // Verificação periódica (cada 30 minutos) - opcional mas útil para sessões longas
  if (!swCheckIntervalId) {
    swCheckIntervalId = setInterval(() => checkForSWUpdate(), 30 * 60 * 1000);
  }

  // Checagem inicial ao iniciar a app
  checkForSWUpdate();

  // Mostra um prompt simples no canto inferior direito para o utilizador atualizar
  function promptUserToRefresh(registration) {
    try {
      let container = document.getElementById('sw-update-notice');
      if (!container) {
        container = document.createElement('div');
        container.id = 'sw-update-notice';
        container.className = 'sw-update-notice';

        const text = document.createElement('span');
        text.className = 'sw-text';
        text.textContent = 'Nova versão disponível';
        container.appendChild(text);

        const actions = document.createElement('div');
        actions.className = 'sw-actions';

        const btn = document.createElement('button');
        btn.className = 'btn primary btn--small';
        btn.textContent = 'Atualizar';
        btn.addEventListener('click', () => {
          if (!registration || !registration.waiting) return;
          registration.waiting.postMessage('skip-waiting');
        });

        const dismiss = document.createElement('button');
        dismiss.className = 'btn dismiss btn--small';
        dismiss.textContent = 'Depois';
        dismiss.addEventListener('click', () => {
          try {
            if (container && container.parentNode) container.parentNode.removeChild(container);
          } catch (e) {
            // Falha ao remover container - não é crítico
          }
        });

        actions.appendChild(btn);
        actions.appendChild(dismiss);
        container.appendChild(actions);
        document.body.appendChild(container);

        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
            window.location.reload();
          }
        });
      }
    } catch (e) {
      console.error('Erro ao mostrar prompt de atualização', e);
    }
  }

  console.log("App initialized successfully");
}

// Função para definir a altura do header dinamicamente
function setHeaderHeight() {
  const header = document.querySelector('.app-header');
  if (header) {
    const height = header.offsetHeight;
    document.documentElement.style.setProperty('--header-height', height + 'px');
  }
}

// ResizeObserver para monitorar mudanças do header em tempo real
function initHeaderHeightObserver() {
  const header = document.querySelector('.app-header');
  if (header && 'ResizeObserver' in window) {
    const observer = new ResizeObserver(() => {
      setHeaderHeight();
    });
    observer.observe(header);
    return observer;
  }
}

// Atualizar altura do header em resize e orientação change
if (typeof window !== 'undefined') {
  window.addEventListener('resize', setHeaderHeight);
  window.addEventListener('orientationchange', () => {
    setTimeout(setHeaderHeight, 100); // Pequeno delay para garantir que o layout atualizou
  });
  initHeaderHeightObserver();
}

// Ponto de entrada único da aplicação
if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", initApp);
  document.addEventListener("DOMContentLoaded", normalizeIcons);
}
