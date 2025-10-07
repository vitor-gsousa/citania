// js/app.js

// Import utilitários ESM
import {
  gcd as gcd_imported,
  lcm as lcm_imported,
  isPrime as isPrime_imported,
  getPrimeFactors as getPrimeFactors_imported,
} from "./modules/utils/math.js";
import {
  getRandomInt as getRandomInt_imported,
  choice as choice_imported,
} from "./modules/utils/rand.js";
import { initSounds, sounds } from "./services/sounds.js";
import {
  loadGamification,
  saveGamification,
  renderGamificationBar,
  adicionarPontos,
  awardBadge,
  gamification,
  BADGES,
  renderAchievementsPanel,
  mostrarNarrativa,
  generateNewMathFact,
  startAutoFactRotation,
  stopAutoFactRotation,
  showAchievementsPanel,
} from "./features/gamification.js";
import { safeGetItem, safeSetItem } from "./utils/storage.js";
import normalizeIcons from "./utils/icon-utils.js";
import { generateAddSub } from "./modules/arithmetic/progression.js";

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
  correctCountEl: document.getElementById("correct-count"),
  incorrectCountEl: document.getElementById("incorrect-count"),
  levelDisplayEl: document.getElementById("level-display"),
  currentLevelEl: document.getElementById("current-level"),
  progressBar: document.getElementById("progress-bar"),
  summaryCorrect: document.getElementById("summary-correct"),
  summaryTotal: document.getElementById("summary-total"),
  themeToggleButton: document.getElementById("theme-toggle"),
  summaryRecordMessage: document.getElementById("summary-record-message"),
  exerciseCards: document.querySelectorAll(".card"),
  // NOVOS elementos para gamificação
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
  // NOVO: teclado personalizado
  customKeyboard: document.getElementById("custom-keyboard"),
};

// Estado UI global — declarar cedo para evitar TDZ
if (typeof window.__citania_uiState__ === "undefined") {
  window.__citania_uiState__ = { inExercise: false };
}
const uiState = window.__citania_uiState__;

// Indicador para evitar que o blur do input esconda o teclado enquanto pointer está activo
let keyboardPointerDown = false;

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

// Mapa transitório de progresso por tipo
const transientProgress = {};

// Exercício corrente
let currentExercise = {};

// Função para gerar exercício
function generateNewExercise() {
  if (!currentExercise.type || !exercises[currentExercise.type]) {
    console.error("Tipo de exercício inválido:", currentExercise.type);
    return;
  }
  const exercise = exercises[currentExercise.type];
  const problem = exercise.generate(state.level);
  currentExercise.answer = problem.answer;
  currentExercise.explanation = problem.explanation;
  currentExercise.checkType = problem.checkType;

  // Atualizar UI
  if (DOM.questionEl) DOM.questionEl.innerHTML = problem.question;
  if (DOM.answerInput) {
    DOM.answerInput.value = "";
    // Garantir que a caixa de resposta está visível quando um novo exercício é gerado
    DOM.answerInput.classList.remove("hidden");
    // Reativar foco para permitir uso do teclado personalizado
    try {
      DOM.answerInput.focus();
    } catch (e) {
      /* silent */
    }
  }
  if (DOM.feedbackEl) {
    DOM.feedbackEl.textContent = "";
    DOM.feedbackEl.className = "hidden"; // Ocultar feedback vazio
  }
  state.answered = false;

  // Restaurar visibilidade dos botões
  DOM.checkButton.style.display = "block";
  DOM.nextButton.style.display = "none";
}

// (A verificação de resposta mais avançada está definida mais abaixo;
//  removida a versão simplificada para evitar duplicação.)

// Função para atualizar barra de progresso
function updateProgressBar() {
  const progressBar = DOM.progressBar;
  if (progressBar) {
    const pct = Math.min(
      100,
      (state.roundProgress / state.exercisesPerRound) * 100,
    );
    progressBar.style.width = pct + "%";
    progressBar.setAttribute("aria-valuenow", state.roundProgress);
    progressBar.setAttribute("aria-valuemax", state.exercisesPerRound);
  }
  
  // Atualizar indicador de nível
  if (DOM.currentLevelEl) {
    DOM.currentLevelEl.textContent = state.level;
  }
}

// Função para mostrar confetti
// Função para mostrar confetti usando canvas-confetti CDN (carrega dinamicamente)
async function triggerConfetti() {
  try {
    // Se já existir, usa directamente
    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      return;
    }

    // Carrega script CDN de forma dinâmica
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
      s.async = true;
      s.onload = () => resolve();
      s.onerror = (e) => reject(e);
      document.head.appendChild(s);
    });

    if (typeof window.confetti === "function") {
      window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    }
  } catch (e) {
    // fallback silencioso
    console.warn("triggerConfetti failed:", e);
  }
}

// Função para mostrar UI de level up (implementação completa mais abaixo)

// Função para atualizar o display de pontuação (mantida para compatibilidade)
function updateScoreDisplay() {
  if (DOM.correctCountEl) {
    DOM.correctCountEl.textContent = state.score.correct;
  }
  if (DOM.incorrectCountEl) {
    DOM.incorrectCountEl.textContent = state.score.incorrect;
  }
}

// Função para mostrar a área de exercício
function showExerciseArea() {
  const menu = DOM.menuContainer;
  const exercise = DOM.exerciseArea;
  if (menu) menu.classList.add("hidden");
  if (exercise) exercise.classList.remove("hidden");
}

// Função para sair do exercício
function exitExercise() {
  uiState.inExercise = false;
  if (currentExercise.type) {
    transientProgress[currentExercise.type] = 0;
  }
  state.roundProgress = 0;
  updateProgressBar();
  const exercise = document.getElementById("exercise-area");
  const menu = document.getElementById("menu-container");
  const summary = document.getElementById("summary-area");

  // Esconder a área de exercício e o resumo (se abertos)
  if (DOM.exerciseArea) DOM.exerciseArea.classList.add("hidden");
  if (DOM.summaryArea) DOM.summaryArea.classList.add("hidden");

  // Mostrar o menu principal com os cards
  if (DOM.menuContainer) DOM.menuContainer.classList.remove("hidden");

  // Restaurar estado dos controlos na UI de exercício para a próxima vez que entrar
  if (DOM.checkButton) DOM.checkButton.style.display = "block";
  if (DOM.nextButton) DOM.nextButton.style.display = "none";
  if (DOM.answerInput) {
    DOM.answerInput.classList.remove("hidden");
    DOM.answerInput.value = "";
  }
  if (DOM.feedbackEl) {
    DOM.feedbackEl.textContent = "";
    DOM.feedbackEl.className = "hidden"; // Ocultar feedback vazio
  }

  // Garantir scroll para o topo do menu
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    /* silent */
  }
}

// --- Lógica dos Exercícios ---
const exercises = {
  addSub: {
    generate: (level) => {
      return generateAddSub(level);
    },
    check: (userAnswer, correctAnswer) => {
      const val = parseInt(userAnswer.trim(), 10);
      return !Number.isNaN(val) && val === correctAnswer;
    },
  },
  fractionToDecimal: {
    generate: (level) => {
      let numerator, denominator;
      const maxNum = 10 + level * 2;
      do {
        numerator = getRandomInt(1, maxNum - 1);
        denominator = getRandomInt(2, maxNum);
      } while (numerator % denominator === 0);

      return {
        question: `Quanto é ${numerator}/${denominator} em decimal? (arredonda às centésimas)`,
        answer: (numerator / denominator).toFixed(2),
        explanation: `Para converter ${numerator}/${denominator} para decimal, divide-se o numerador (${numerator}) pelo denominador (${denominator}). O resultado é ${numerator / denominator}, que arredondado às centésimas fica ${(numerator / denominator).toFixed(2)}.`,
      };
    },
    check: (userAnswer, correctAnswer) => {
      const formattedUserAnswer = parseFloat(
        userAnswer.replace(",", ".").trim(),
      ).toFixed(2);
      return formattedUserAnswer === correctAnswer;
    },
  },
  primeFactorization: {
    generate: (level) => {
      let number;
      const minNum = 10 + (level - 1) * 10;
      const maxNum = 100 + (level - 1) * 20;
      do {
        number = getRandomInt(minNum, maxNum);
      } while (isPrime(number));

      const factors = getPrimeFactors(number);
      return {
        question: `Decompõe o número ${number} em fatores primos. (ex: 2 x 2 x 3)`,
        answer: factors,
        explanation: `Para decompor ${number}, dividimos sucessivamente por números primos: ${factors.join(" x ")}.`,
      };
    },
    check: (userAnswer, correctAnswerArray) => {
      const userFactors =
        userAnswer
          .match(/\d+/g)
          ?.map(Number)
          .sort((a, b) => a - b) || [];
      return (
        JSON.stringify(userFactors) ===
        JSON.stringify(correctAnswerArray.sort((a, b) => a - b))
      );
    },
  },
  gcd: {
    generate: (level) => {
      const factor = getRandomInt(2, 5 + level);
      const num1 = factor * getRandomInt(2, 5 + level);
      const num2 = factor * getRandomInt(2, 5 + level);
      const answer = gcd(num1, num2);
      return {
        question: `Qual é o Máximo Divisor Comum (MDC) entre ${num1} e ${num2}?`,
        answer,
        explanation: `O MDC é o maior número que divide ${num1} e ${num2} sem deixar resto. Neste caso, a resposta é ${answer}.`,
      };
    },
    check: (userAnswer, correctAnswer) => {
      return parseInt(userAnswer.trim()) === correctAnswer;
    },
  },
  lcm: {
    generate: (level) => {
      const num1 = getRandomInt(2, 10 + level);
      const num2 = getRandomInt(2, 10 + level);
      const answer = lcm(num1, num2);
      return {
        question: `Qual é o Mínimo Múltiplo Comum (MMC) entre ${num1} e ${num2}?`,
        answer,
        explanation: `O MMC é o menor número que é múltiplo de ${num1} e de ${num2}. A resposta é ${answer}. Uma forma de calcular é (num1 * num2) / MDC(num1, num2).`,
      };
    },
    check: (userAnswer, correctAnswer) => {
      return parseInt(userAnswer.trim()) === correctAnswer;
    },
  },
  powerMultiplication: {
    generate: (level) => {
      if (Math.random() < 0.5) {
        const base = getRandomInt(2, 5 + level);
        const exp1 = getRandomInt(2, 5 + level);
        const exp2 = getRandomInt(2, 5 + level);
        const finalExp = exp1 + exp2;

        return {
          question: `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &times; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
          answer: `${base}^${finalExp}`,
          explanation: `Para multiplicar potências com a mesma base, mantém-se a base (${base}) e somam-se os expoentes (${exp1} + ${exp2} = ${finalExp}).`,
          checkType: "string",
        };
      } else {
        let base1 = getRandomInt(2, 5);
        let base2 = getRandomInt(2, 5);
        if (base1 === base2) base2++;
        const exp1 = getRandomInt(2, 3);
        const exp2 = getRandomInt(2, 3);
        const result = Math.pow(base1, exp1) * Math.pow(base2, exp2);

        return {
          question: `Qual é o resultado de <strong>${base1}<sup>${exp1}</sup> &times; ${base2}<sup>${exp2}</sup></strong>?`,
          answer: result,
          explanation: `Como as bases são diferentes (${base1} e ${base2}), não podemos somar os expoentes. Calculamos o valor de cada potência e depois multiplicamos: ${base1 ** exp1} &times; ${base2 ** exp2} = ${result}.`,
          checkType: "number",
        };
      }
    },
    check: (userAnswer, correctAnswer, checkType) => {
      if (checkType === "number") {
        return parseInt(userAnswer.trim()) === correctAnswer;
      }
      return userAnswer.replace(/\s/g, "") === correctAnswer;
    },
  },
  powerDivision: {
    generate: (level) => {
      const base = getRandomInt(2, 5 + level);
      const exp1 = getRandomInt(3, 8 + level);
      const exp2 = getRandomInt(2, exp1 - 1);
      const finalExp = exp1 - exp2;

      const answer = `${base}^${finalExp}`;
      return {
        question: `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &divide; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
        answer,
        explanation: `Para dividir potências com a mesma base, mantém-se a base (${base}) e subtraem-se os expoentes (${exp1} - ${exp2} = ${finalExp}).`,
      };
    },
    check: (userAnswer, correctAnswer) => {
      return userAnswer.replace(/\s/g, "") === correctAnswer;
    },
  },
};

// --- Funções de Apoio ---
// Preferir os módulos carregados em js/modules/utils, mas manter fallback local
// Use explicit imports from js/modules/utils/math.js and js/modules/utils/rand.js
// Em vez de duplicar implementações, delegamos nas funções importadas.
function getRandomInt(min, max) {
  if (typeof getRandomInt_imported === "function")
    return getRandomInt_imported(min, max);
  // fallback mínimo seguro
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
const gcd = gcd_imported;
const lcm = lcm_imported;
const isPrime = isPrime_imported;
const getPrimeFactors = getPrimeFactors_imported;

// medalhasList fallback will be initialized below inside DOM map usage

// normalizeIcons() handles both svg.card-icon and .material-symbols-outlined.card-icon

// Dispatcher centralizado para actions/data-type dos cartões.
// - exercise types -> startExercise(type)
// - achievements -> showAchievementsPanel()
// - theme -> toggleTheme()
function bindCardActions() {
  // Delegar no container que agrupa a lista de temas e as secções
  const container = document.getElementById("menu-container") || document.body;
  container.addEventListener("click", (ev) => {
    // Aceitar tanto cartões (.card) como elementos com data-action (ex.: close buttons)
    const actionEl = ev.target.closest('[data-action], .card');
    if (!actionEl) return;
    const action = actionEl.dataset.action || null;
    const target = actionEl.dataset.target || null;
    const type = actionEl.dataset.type || actionEl.dataset.action || null;
    // Tratamento de actions customizadas
    if (action === "open-section" && target) {
      try {
        showSection(target);
      } catch (e) {
        console.warn("open-section failed", e);
      }
      return;
    }
    if (action === "close-section") {
      try {
        showThemes();
      } catch (e) {
        console.warn("close-section failed", e);
      }
      return;
    }
    if (!type) return;

    // Mapeamento simples
    if (type === "achievements" || type === "achievement") {
      if (typeof showAchievementsPanel === "function") {
        showAchievementsPanel(DOM, state);
        return;
      }
    }

    if (type === "theme" || type === "toggle-theme") {
      if (typeof toggleTheme === "function") {
        toggleTheme();
        return;
      }
    }

    // Assume exercício
    if (typeof startExercise === "function") {
      startExercise(type);
      return;
    }

    console.warn("No handler for card type/action:", type);
  });

  // Keyboard accessibility
  container.addEventListener("keydown", (ev) => {
    const actionEl = ev.target.closest('[data-action], .card');
    if (!actionEl) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      const type = actionEl.dataset.type || actionEl.dataset.action;
      if (!type) return;
      if (type === "achievements" && typeof showAchievementsPanel === "function") {
        showAchievementsPanel(DOM, state);
        return;
      }
      if ((type === "theme" || type === "toggle-theme") && typeof toggleTheme === "function") {
        toggleTheme();
        return;
      }
      if (typeof startExercise === "function") startExercise(type);
    }
  });
}

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
    mainElement.style.setProperty('--preserved-height', currentHeight + 'px');
    mainElement.classList.add('transitioning');
  }
  
  // Pré-carregar a secção para calcular layout
  section.classList.remove("hidden");
  section.classList.add("preloading");
  section.setAttribute("aria-hidden", "false");
  
  // Aguardar que o layout seja calculado
  await waitForLayout(section);
  
  // Agora esconder a lista de temas e animar a entrada da secção
  if (themesList) {
    console.debug("showSection: hiding themesList", themesList);
    ensureFocusNotInside(themesList);
    await animateHide(themesList);
    themesList.classList.add("hidden");
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
  
  // Remover preloading e animar entrada
  section.classList.remove("preloading");
  await animateShow(section);
  
  // Remover preservação de altura após transição
  if (mainElement) {
    setTimeout(() => {
      mainElement.classList.remove('transitioning');
      mainElement.style.removeProperty('--preserved-height');
    }, 50);
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
  if (mainElement) {
    const currentHeight = mainElement.offsetHeight;
    mainElement.style.setProperty('--preserved-height', currentHeight + 'px');
    mainElement.classList.add('transitioning');
  }
  
  if (themesList) {
    themesList.classList.remove("hidden");
    themesList.classList.add("preloading");
    
    // Aguardar que o layout seja calculado
    await waitForLayout(themesList);
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
    console.debug("showThemes: showing themesList", themesList);
    ensureFocusNotInside(themesList);
    themesList.classList.remove("preloading");
    await animateShow(themesList);
  }
  
  // Remover preservação de altura após transição
  if (mainElement) {
    setTimeout(() => {
      mainElement.classList.remove('transitioning');
      mainElement.style.removeProperty('--preserved-height');
    }, 50);
  }
  
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {}
}

// Helper para aguardar que o layout seja calculado
function waitForLayout(element) {
  return new Promise((resolve) => {
    // Se não há cards para aguardar, resolve imediatamente
    const cards = element.querySelectorAll('.card');
    if (cards.length === 0) {
      resolve();
      return;
    }
    
    // Aguarda que as imagens estejam carregadas (se houver)
    const images = element.querySelectorAll('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise(resolve => {
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      });
    });
    
    Promise.all(imagePromises).then(() => {
      // Aguarda um frame para garantir que o layout foi calculado
      requestAnimationFrame(() => {
        // Força o browser a calcular as dimensões
        void element.offsetHeight;
        
        // Aguarda mais um frame para estabilizar
        requestAnimationFrame(() => {
          resolve();
        });
      });
    });
  });
}

// Helpers de animação: aplicam classes temporárias para forçar transições
function animateShow(el) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    // Respeitar preferências do utilizador
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return resolve();
    }
  console.debug("animateShow: element", el);
  // limpar qualquer classe de saída
    el.classList.remove("animating-out");
    // preparar para entrada
    el.classList.add("animating-in");
    // forçar repaint
    void el.offsetWidth;
    // remover a classe animating-in para deixar a transição ocorrer até o estado natural
    requestAnimationFrame(() => {
      el.classList.remove("animating-in");
    });
    const handler = (ev) => {
      if (ev.target !== el) return;
      console.debug("animateShow: transitionend on", el);
      el.removeEventListener("transitionend", handler);
      resolve();
    };
    el.addEventListener("transitionend", handler);
    // Debug: log computed transition style
    try {
      const cs = getComputedStyle(el);
      console.debug("animateShow: computed transition", cs.transition || cs.transitionProperty, cs.transitionDuration);
    } catch (e) {}
    setTimeout(() => {
      el.removeEventListener("transitionend", handler);
      resolve();
    }, 600);
  });
}

function animateHide(el) {
  return new Promise((resolve) => {
    if (!el) return resolve();
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return resolve();
    }
  console.debug("animateHide: element", el);
  // garantir que não estamos num estado animating-in
    el.classList.remove("animating-in");
    // adicionar classe de saída — transição irá correr para o estado definido por .animating-out
    // forçar repaint
    void el.offsetWidth;
    requestAnimationFrame(() => {
      el.classList.add("animating-out");
    });
    const handler = (ev) => {
      if (ev.target !== el) return;
      console.debug("animateHide: transitionend on", el);
      el.removeEventListener("transitionend", handler);
      resolve();
    };
    el.addEventListener("transitionend", handler);
    try {
      const cs = getComputedStyle(el);
      console.debug("animateHide: computed transition", cs.transition || cs.transitionProperty, cs.transitionDuration);
    } catch (e) {}
    setTimeout(() => {
      el.removeEventListener("transitionend", handler);
      resolve();
    }, 600);
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

// Executar inicializações quando DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  try {
    normalizeIcons();
  } catch (e) {
    console.warn("normalizeIcons failed", e);
  }
  try {
    bindCardActions();
  } catch (e) {
    console.warn("bindCardActions failed", e);
  }

  // expor helper para debugging (opcional)
  window.showLevelUpUI = showLevelUpUI;
});

// --- Funções de Persistência (LocalStorage) ---

const STORAGE_KEY = "matematicaDivertidaHighScores";

function loadHighScores() {
  const scores = localStorage.getItem(STORAGE_KEY);
  return scores ? JSON.parse(scores) : {};
}

function saveHighScore(exerciseType, level) {
  const highScores = loadHighScores();
  const currentHighScore = highScores[exerciseType] || 0;
  if (level > currentHighScore) {
    highScores[exerciseType] = level;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
  }
}

// Persistência de progresso por tipo de exercício
const PROGRESS_KEY = "citania_progress_v1";

// Leitura/escrita seguras em localStorage (implementadas em js/utils/storage.js)

// Guarda o nível para um tipo de exercício
function saveProgressForType(exerciseType, level) {
  if (!exerciseType) return;
  const raw = safeGetItem(PROGRESS_KEY) || "{}";
  let map;
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }
  map[exerciseType] = Number(level) || 1;
  safeSetItem(PROGRESS_KEY, JSON.stringify(map));
}

// Carrega o nível guardado para um tipo (retorna 1 se não houver)
function loadProgressForType(exerciseType) {
  if (!exerciseType) return 1;
  const raw = safeGetItem(PROGRESS_KEY);
  if (!raw) return 1;
  try {
    const map = JSON.parse(raw);
    const lvl = Number(map[exerciseType]);
    return Number.isFinite(lvl) && lvl > 0 ? lvl : 1;
  } catch {
    return 1;
  }
}

// Gamificação moved to js/features/gamification.js

// Narrativa por nível (Citânia de Sanfins)
// Narrativa e painel de conquistas moved to js/features/gamification.js

// Verificar medalhas (com contexto)
function verificarMedalhas(ctx = {}) {
  const { isCorrect = false, responseMs = null } = ctx;
  if (gamification.pontos >= 50) awardBadge(DOM, BADGES.explorer);
  if (isCorrect && responseMs !== null && responseMs <= 5000)
    awardBadge(DOM, BADGES.speedster);
  if (state.streak >= 5) awardBadge(DOM, BADGES.streak5);
  if (isCorrect && currentExercise.attempts === 1)
    awardBadge(DOM, BADGES.firstTry);
  if (state.level >= 3) awardBadge(DOM, BADGES.scholar);
}

// --- Achievements panel ---
// Achievements and leaderboard are handled by js/features/gamification.js

// --- Funções Principais da Aplicação ---

function startNewRound() {
  state.roundProgress = 0;
  // Mantemos o nível, mas focamos na UI nova
  if (DOM.levelDisplayEl) {
    DOM.levelDisplayEl.textContent = state.level;
    DOM.levelDisplayEl.parentElement?.classList.add("hidden"); // esconder o container antigo
  }
  DOM.menuContainer.classList.add("hidden");
  DOM.summaryArea.classList.add("hidden");
  DOM.exerciseArea.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });

  mostrarNarrativa(); // narrativa por nível
  renderGamificationBar(DOM); // refresca barra
  generateNewExercise();
}

function startExercise(type) {
  if (!type) {
    console.warn("startExercise: type not provided");
    return;
  }

  if (uiState.inExercise) {
    console.debug("startExercise ignored: already in exercise", type);
    return;
  }

  // Validar elementos DOM críticos
  if (!DOM.exerciseArea || !DOM.menuContainer) {
    console.error("exerciseArea not found - cannot start exercise");
    return;
  }

  uiState.inExercise = true;

  // Restaurar nível guardado
  state.level = loadProgressForType(type) || state.level || 1;
  currentExercise.type = type;

  // Reset progresso transitório
  transientProgress[type] = 0;
  state.roundProgress = 0;

  // Mostrar área de exercício
  showExerciseArea();
  updateProgressBar();

  try {
    generateNewExercise();
  } catch (err) {
    console.error("generateNewExercise erro:", err);
    uiState.inExercise = false;
  }
}

// -------------------------------------------------------------------
// Substitui os handlers globais problemáticos por delegates no teclado
// -------------------------------------------------------------------

// Nota: chamadas anteriores para removeEventListener com 'this' eram ineficazes
// Se for necessário remover handlers, armazene a referência da função quando a registar
// e passe a mesma referência aqui. Removidas chamadas inválidas.

// Mostra o teclado quando o input recebe foco (único listener)
DOM.answerInput.addEventListener("focus", () => {
  DOM.customKeyboard.classList.remove("hidden");
});

// Blur seguro: só esconde se o foco não estiver no teclado e não houver pointer activo
DOM.answerInput.addEventListener("blur", () => {
  setTimeout(() => {
    if (keyboardPointerDown) return; // a interação com a tecla está em curso
    if (!DOM.customKeyboard.contains(document.activeElement)) {
      DOM.customKeyboard.classList.add("hidden");
    }
  }, 50);
});

// Pointer handlers na própria área do teclado — mais fiáveis em touch
DOM.customKeyboard?.addEventListener("pointerdown", (ev) => {
  const key = ev.target.closest(".key");
  if (!key) return;
  // Sinaliza que o utilizador está a interagir com o teclado (evita blur)
  keyboardPointerDown = true;
  // Não prevenir o evento se não necessário; mas prevenir seleções indesejadas
  ev.preventDefault();
});

// -------------------------------------------------------------------
// 4️⃣  Quando a resposta é verificada, esconder o teclado (já estava)
// -------------------------------------------------------------------
function checkAnswer() {
  if (state.answered) return;

  currentExercise.attempts = (currentExercise.attempts || 0) + 1; // NOVO
  const userAnswer = DOM.answerInput.value;
  if (!userAnswer.trim()) {
    DOM.feedbackEl.innerHTML = "⚠️ Por favor, escreve uma resposta.";
    DOM.feedbackEl.className = "incorrect";
    return;
  }

  const exerciseLogic = exercises[currentExercise.type];
  const isCorrect = exerciseLogic.check(
    userAnswer,
    currentExercise.answer,
    currentExercise.checkType,
  );
  const correctAnswerFormatted = Array.isArray(currentExercise.answer)
    ? currentExercise.answer.join(" x ")
    : currentExercise.answer;

  const responseMs = Date.now() - (state.exerciseStartTs || Date.now());

  if (isCorrect) {
    sounds.correct.currentTime = 0;
    sounds.correct.play();
    DOM.feedbackEl.innerHTML = "✅ Muito bem! Resposta correta!";
    DOM.feedbackEl.className = "correct";
    state.score.correct++;
    state.streak++;
    adicionarPontos(DOM, 10);
    verificarMedalhas({ isCorrect: true, responseMs });
    // feedback já mostrado — o incremento de progresso é feito abaixo (independente do resultado)
  } else {
    sounds.incorrect.currentTime = 0;
    sounds.incorrect.play();
    DOM.feedbackEl.innerHTML = `❌ Quase! A resposta certa é <strong>${correctAnswerFormatted}</strong>.`;
    DOM.feedbackEl.className = "incorrect";
    state.score.incorrect++;
    state.streak = 0;
    adicionarPontos(DOM, 2); // pequeno incentivo por tentativa
    verificarMedalhas({ isCorrect: false, responseMs });
  }

  // Incrementar progresso independentemente de correto/errado — garante número fixo de questões por nível
  transientProgress[currentExercise.type] =
    (transientProgress[currentExercise.type] || 0) + 1;
  state.roundProgress = transientProgress[currentExercise.type];
  updateScoreDisplay();
  updateProgressBar();

  // Se completou a ronda -> subir de nível e persistir nível para este exercício
  if (state.roundProgress >= (state.exercisesPerRound || 5)) {
    // Incrementa nível e grava
    state.level = (state.level || 1) + 1;
    if (typeof saveProgressForType === "function" && currentExercise?.type) {
      saveProgressForType(currentExercise.type, state.level);
    }
    // Limpar progresso transitório
    if (currentExercise?.type) transientProgress[currentExercise.type] = 0;
    state.roundProgress = 0;
    updateProgressBar();

    // Confetti / feedback / som / resumo
    try {
      // invoke confetti and ignore rejection (non-blocking)
      triggerConfetti().catch(() => {});
    } catch (e) {}
    try {
      showLevelUpUI();
    } catch (e) {
      console.warn("showLevelUpUI error", e);
    }
  }

  if (state.roundProgress <= state.explanationLimit) {
    DOM.feedbackEl.innerHTML += `<br><small style="font-weight: normal; opacity: 0.9;">${currentExercise.explanation}</small>`;
  }

  state.answered = true;
  updateScoreDisplay();

  DOM.checkButton.style.display = "none";
  DOM.nextButton.style.display = "block";
  DOM.nextButton.focus();

  // Esconde o teclado após verificar a resposta
  DOM.customKeyboard.classList.add("hidden");
}

// Função invocada quando o utilizador clica em Next: prepara e gera o próximo exercício
function nextExercise() {
  // Reativar a caixa de resposta e limpar feedback
  DOM.answerInput.classList.remove("hidden");
  DOM.answerInput.value = "";
  try {
    DOM.answerInput.focus();
  } catch (e) {
    /* silent */
  }
  DOM.feedbackEl.textContent = "";
  DOM.feedbackEl.className = "hidden"; // Ocultar feedback vazio

  // Restaurar botões
  DOM.checkButton.style.display = "block";
  DOM.nextButton.style.display = "none";

  // Marcar que estamos prontos para nova resposta
  state.answered = false;

  // Gerar novo problema
  generateNewExercise();
}

// Função para migrar progresso antigo (se existir)
function migrateOldProgress() {
  const old = safeGetItem("citania_progress"); // exemplo de chave antiga
  if (old && !safeGetItem(PROGRESS_KEY)) {
    safeSetItem(PROGRESS_KEY, old);
  }
}
document.addEventListener("DOMContentLoaded", migrateOldProgress);

// -----------------------------------------------------------------------------
// Substituir a declaração duplicada de uiState por reutilização do singleton
// -----------------------------------------------------------------------------

// EM VEZ DISSO reutilizar o uiState global já criado no topo:
// assegura-se que a propriedade existe sem redeclarar a variável
uiState.inExercise = uiState.inExercise || false;

// --- Lógica do Tema (Modo Escuro) ---
function applyTheme(theme) {
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    DOM.themeToggleButton.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");
    DOM.themeToggleButton.textContent = "🌙";
  }
}

// Audio services provided by js/services/sounds.js (imported above)

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
  try {
    bindCardActions();
    console.log("Event listeners dos cards configurados");
  } catch (error) {
    console.error("Erro ao configurar event listeners dos cards:", error);
  }

  // 5. Configurar todos os outros event listeners
  // Botão de tema
  DOM.themeToggleButton?.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("dark-mode")
      ? "light"
      : "dark";
    localStorage.setItem("matematicaAppTheme", currentTheme);
    applyTheme(currentTheme);
  });

  // Botão para nova curiosidade matemática
  const novaCuriosidadeBtn = document.getElementById("nova-curiosidade");
  novaCuriosidadeBtn?.addEventListener("click", () => {
    try {
      generateNewMathFact();
    } catch (error) {
      console.error("Erro ao gerar nova curiosidade:", error);
    }
  });

  // Botão para pausar/retomar rotação automática
  const toggleRotacaoBtn = document.getElementById("toggle-rotacao");
  let rotacaoPausada = false;
  
  toggleRotacaoBtn?.addEventListener("click", () => {
    try {
      rotacaoPausada = !rotacaoPausada;
      
      if (rotacaoPausada) {
        stopAutoFactRotation();
        toggleRotacaoBtn.textContent = "▶️";
        toggleRotacaoBtn.title = "Retomar rotação automática";
        toggleRotacaoBtn.classList.add("paused");
      } else {
        startAutoFactRotation();
        toggleRotacaoBtn.textContent = "⏸️";
        toggleRotacaoBtn.title = "Pausar rotação automática";
        toggleRotacaoBtn.classList.remove("paused");
      }
    } catch (error) {
      console.error("Erro ao controlar rotação:", error);
    }
  });

  // Cards do menu: os handlers são registados em bindCardActions() para centralizar o comportamento.
  // Evitamos registar handlers duplicados aqui.

  // Botões da área de exercício
  DOM.backButton?.addEventListener("click", exitExercise);
  DOM.checkButton?.addEventListener("click", checkAnswer);
  DOM.nextButton?.addEventListener("click", nextExercise);
  DOM.nextLevelButton?.addEventListener("click", () => {
    state.level++;
    startNewRound();
  });

  // Botão de utilizador
  DOM.userButton?.addEventListener("click", () => {
    const name = (
      prompt("Escolhe o teu nome:", gamification.userName) || ""
    ).trim();
    if (name) {
      gamification.userName = name;
      localStorage.setItem("citaniaUserName", name);
      renderGamificationBar();
      saveGamification();
    }
  });

  // Botão de Achievements (taça) - abre painel deslizante
  const achBtn = document.getElementById("achievements-button");
  achBtn?.addEventListener("click", () => {
    showAchievementsPanel(DOM, state);
  });

  // Teclado personalizado
  DOM.customKeyboard?.addEventListener("pointerup", (ev) => {
    const key = ev.target.closest(".key");
    if (!key) return;
    const value = key.dataset.value;
    if (value === "delete") {
      DOM.answerInput.value = DOM.answerInput.value.slice(0, -1);
    } else if (value === "clear") {
      DOM.answerInput.value = "";
    } else if (value === "enter") {
      checkAnswer();
    } else {
      DOM.answerInput.value += value;
    }
  });

  // 5. Registar Service Worker
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

  // 6. Expor funções para debugging
  window.startExercise = startExercise;

  console.log("App initialized successfully");
}

// Ponto de entrada único da aplicação
document.addEventListener("DOMContentLoaded", initApp);
