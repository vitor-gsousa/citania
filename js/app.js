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
  showAchievementsPanel,
} from "./features/gamification.js";
import { safeGetItem, safeSetItem } from "./utils/storage.js";

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
  medalhasList: document.getElementById("medalhas-list"),
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
  if (DOM.feedbackEl) DOM.feedbackEl.textContent = "";
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
}

// Função para mostrar confetti
function triggerConfetti() {
  // Implementação stub
  console.log("Confetti triggered");
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
  if (DOM.feedbackEl) DOM.feedbackEl.textContent = "";

  // Garantir scroll para o topo do menu
  try {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (e) {
    /* silent */
  }
}

// --- Lógica dos Exercícios ---
const exercises = {
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

// Inline external SVG images so they can inherit currentColor
async function inlineSvgs() {
  const imgs = Array.from(
    document.querySelectorAll('img.card-icon[src$=".svg"]'),
  );
  await Promise.all(
    imgs.map(async (img) => {
      try {
        const src = img.getAttribute("src");
        const resp = await fetch(src);
        if (!resp.ok) return;
        const text = await resp.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svg = doc.querySelector("svg");
        if (!svg) return;
        // copy width/height from img to svg if present
        if (img.hasAttribute("width"))
          svg.setAttribute("width", img.getAttribute("width"));
        if (img.hasAttribute("height"))
          svg.setAttribute("height", img.getAttribute("height"));
        // ensure svg uses currentColor as fallback
        svg.setAttribute(
          "aria-hidden",
          img.getAttribute("aria-hidden") || "true",
        );
        svg.classList.add(...(img.className ? img.className.split(" ") : []));
        img.replaceWith(svg);
      } catch (e) {
        // ignore, keep the <img>
        console.warn("inlineSvgs error for", img, e);
      }
    }),
  );
}

// Normaliza ícones SVG que por acaso têm fills/strokes não herdados.
// Executar no DOMContentLoaded para corrigir SVGs inline gerados no HTML.
function normalizeSvgIcons() {
  document.querySelectorAll("svg.card-icon").forEach((svg) => {
    // assegura que o svg tem a propriedade color herdada (usado por currentColor)
    svg.style.color =
      getComputedStyle(svg.closest(".card") || svg).color || "currentColor";

    // percorre nós gráficos e aplica currentColor quando aplicável
    svg.querySelectorAll("*").forEach((el) => {
      const tag = el.tagName.toLowerCase();
      // mantém explicitamente 'none' quando presente (ex.: stroke="none" intentional)
      if (!el.hasAttribute("fill") || el.getAttribute("fill") === "null") {
        if (tag !== "svg" && tag !== "defs")
          el.setAttribute("fill", "currentColor");
      }
      if (!el.hasAttribute("stroke") || el.getAttribute("stroke") === "null") {
        if (tag !== "svg" && tag !== "defs")
          el.setAttribute("stroke", "currentColor");
      }
    });
  });
}

// Dispatcher centralizado para actions/data-type dos cartões.
// - exercise types -> startExercise(type)
// - achievements -> showAchievementsPanel()
// - theme -> toggleTheme()
function bindCardActions() {
  const container = document.getElementById("menu-container") || document.body;
  container.addEventListener("click", (ev) => {
    const card = ev.target.closest(".card");
    if (!card) return;
    const type = card.dataset.type || card.dataset.action;
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
    const card = ev.target.closest(".card");
    if (!card) return;
    if (ev.key === "Enter" || ev.key === " ") {
      ev.preventDefault();
      const type = card.dataset.type || card.dataset.action;
      if (!type) return;
      if (
        type === "achievements" &&
        typeof showAchievementsPanel === "function"
      ) {
        showAchievementsPanel(DOM, state);
        return;
      }
      if (
        (type === "theme" || type === "toggle-theme") &&
        typeof toggleTheme === "function"
      ) {
        toggleTheme();
        return;
      }
      if (typeof startExercise === "function") startExercise(type);
    }
  });
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
    normalizeSvgIcons();
  } catch (e) {
    console.warn("normalizeSvgIcons failed", e);
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
      triggerConfetti?.();
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

function initApp() {
  // 1. Aplicar tema guardado
  const savedTheme = localStorage.getItem("matematicaAppTheme") || "light";
  applyTheme(savedTheme);

  // 2. Carregar dados persistidos
  migrateOldProgress();
  // Inline external SVGs so they inherit currentColor
  inlineSvgs().catch(() => {});
  loadGamification();
  renderGamificationBar(DOM);
  mostrarNarrativa(DOM, state.level);

  // 3. Inicializar sons
  initSounds();

  // 4. Configurar todos os event listeners
  // Botão de tema
  DOM.themeToggleButton?.addEventListener("click", () => {
    const currentTheme = document.body.classList.contains("dark-mode")
      ? "light"
      : "dark";
    localStorage.setItem("matematicaAppTheme", currentTheme);
    applyTheme(currentTheme);
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
