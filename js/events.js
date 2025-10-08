// js/events.js
/*
 * Este módulo centraliza a gestão de todos os eventos da aplicação.
 * Segue o padrão de delegação de eventos sempre que possível para otimizar a performance.
 */
import { toggleTheme } from "./theme.js";
import { showExerciseArea, exitExercise, showSection, showThemes } from "./ui.js";
import { startExercise, checkAnswer, nextExercise, startNewRound, exercises } from "./exercise.js";
import {
  showAchievementsPanel,
  generateNewMathFact,
  stopAutoFactRotation,
  startAutoFactRotation,
  gamification,
  renderGamificationBar,
  saveGamification,
} from "./features/gamification.js";
import { safeSetItem } from "./utils/storage.js";

let keyboardPointerDown = false;

/**
 * Associa as ações dos cartões do menu principal (iniciar exercício, abrir secção).
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
function bindCardActions(DOM, state) {
  const container = DOM.menuContainer || document.body;

  const handleAction = (actionEl) => {
    const action = actionEl.dataset.action || null;
    const target = actionEl.dataset.target || null;
    const type = actionEl.dataset.type || actionEl.dataset.action || null;

    if (action === "open-section" && target) {
      showSection(target);
      return;
    }
    if (action === "close-section") {
      showThemes();
      return;
    }
    if (!type) return;

    if (type === "achievements") {
      showAchievementsPanel(DOM, state);
    } else if (exercises[type]) {
      startExercise(type, DOM, state);
    }
  };

  container.addEventListener("click", (ev) => {
    const actionEl = ev.target.closest('[data-action], .card[data-type]');
    if (actionEl) handleAction(actionEl);
  });

  container.addEventListener("keydown", (ev) => {
    const actionEl = ev.target.closest('[data-action], .card[data-type]');
    if (actionEl && (ev.key === "Enter" || ev.key === " ")) {
      ev.preventDefault();
      handleAction(actionEl);
    }
  });
}

/**
 * Inicializa todos os event listeners da aplicação.
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
export function initEventListeners(DOM, state) {
  bindCardActions(DOM, state);

  DOM.themeToggleButton?.addEventListener("click", toggleTheme);

  DOM.backButton?.addEventListener("click", () => exitExercise(DOM, state));
  DOM.checkButton?.addEventListener("click", () => checkAnswer(DOM, state));
  DOM.nextButton?.addEventListener("click", () => nextExercise(DOM, state));
  DOM.nextLevelButton?.addEventListener("click", () => startNewRound(DOM, state));

  // Gamification and User Profile
  DOM.achievementsButton?.addEventListener("click", () => showAchievementsPanel(DOM, state));
  DOM.userButton?.addEventListener("click", () => {
    const name = (prompt("Escolhe o teu nome:", gamification.userName) || "").trim();
    if (name) {
      gamification.userName = name;
      safeSetItem("citaniaUserName", name);
      renderGamificationBar(DOM);
      saveGamification();
    }
  });

  // Math Fact Listeners
  DOM.novaCuriosidadeBtn?.addEventListener("click", generateNewMathFact);
  DOM.toggleRotacaoBtn?.addEventListener("click", () => {
    const isPaused = DOM.toggleRotacaoBtn.classList.toggle("paused");
    if (isPaused) {
      stopAutoFactRotation();
      DOM.toggleRotacaoBtn.textContent = "▶️";
      DOM.toggleRotacaoBtn.title = "Retomar rotação automática";
    } else {
      startAutoFactRotation();
      DOM.toggleRotacaoBtn.textContent = "⏸️";
      DOM.toggleRotacaoBtn.title = "Pausar rotação automática";
    }
  });

  // Custom Keyboard
  DOM.answerInput.addEventListener("focus", () => {
    const keyboard = DOM.customKeyboard;
    if (keyboard) keyboard.classList.remove("hidden");
  });

  // Prevenir digitação direta no input principal para forçar o uso do teclado personalizado
  DOM.answerInput.addEventListener("keydown", (ev) => {
    // Permitir teclas de navegação como Tab, setas, etc.
    if (ev.key.length === 1) ev.preventDefault();
  });

  DOM.answerInput.addEventListener("blur", () => {
    // Atraso para permitir que o novo foco seja registado
    setTimeout(() => {
      const keyboard = DOM.customKeyboard;
      const inlineInput = document.getElementById("inline-missing-input");
      // Esconder apenas se o ponteiro não estiver no teclado e o foco não estiver nem no teclado nem no input inline
      if (keyboard && !keyboardPointerDown && !keyboard.contains(document.activeElement) && document.activeElement !== inlineInput) {
        keyboard.classList.add("hidden");
      }
    }, 100);
  });

  DOM.customKeyboard?.addEventListener("pointerdown", () => { keyboardPointerDown = true; });
  document.addEventListener("pointerup", () => { keyboardPointerDown = false; });

  // Adiciona a lógica de clique para as teclas do teclado personalizado
  DOM.customKeyboard?.addEventListener("click", (ev) => {
    const key = ev.target.closest(".key");
    if (!key) return;

    const value = key.dataset.value;
    // O exercício 'addSub' pode ter um input inline
    const inlineInput = document.getElementById("inline-missing-input");
    const targetInput = inlineInput || DOM.answerInput;

    if (value === "delete") {
      targetInput.value = targetInput.value.slice(0, -1);
    } else if (value === "clear") {
      targetInput.value = "";
    } else if (value === "enter") {
      checkAnswer(DOM, state);
    } else {
      targetInput.value += value;
    }

    // Se o input inline existir, sincroniza o seu valor com o input principal (oculto)
    if (inlineInput) {
      DOM.answerInput.value = inlineInput.value;
    }
  });

  // Event listener para fechar o popup da narrativa
  DOM.closeNarrativePopup?.addEventListener("click", () => {
    DOM.narrativePopup.classList.add("hidden");
    // Devolve o foco para o input do exercício
    const inlineInput = document.getElementById("inline-missing-input");
    const targetInput = inlineInput || DOM.answerInput;
    if (DOM.customKeyboard) DOM.customKeyboard.classList.remove("hidden");
    targetInput.focus();
  });
}