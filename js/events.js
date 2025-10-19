// js/events.js
/*
 * Este módulo centraliza a gestão de todos os eventos da aplicação.
 * Segue o padrão de delegação de eventos sempre que possível para otimizar a performance.
 */
import { toggleTheme } from "./theme.js";
import { exitExercise } from "./ui.js";
import { startExercise, checkAnswer, nextExercise, startNewRound, exercises } from "./exercise.js";
import { safeFocus } from "./utils/mobile-utils.js";
import {
  generateNewMathFact,
  stopAutoFactRotation,
  startAutoFactRotation,
  gamification,
  renderGamificationBar,
  saveGamification,
} from "./features/gamification.js";
import { safeSetItem } from "./utils/storage.js";
import { showSection, showThemes } from "./app.js"; // Importar de app.js

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
  // Variável para rastrear o input de fração ativo
  let activeFractionInput = null;

  /**
   * Reset do estado de frações para quando se muda de exercício
   */
  window.resetFractionState = function() {
    activeFractionInput = null;
    // Limpar atributos data-active de qualquer input remanescente
    const allInputs = document.querySelectorAll('.fraction-missing-input, .inline-missing-input');
    allInputs.forEach(input => input.removeAttribute('data-active'));
  };
  bindCardActions(DOM, state);

  DOM.themeToggleButton?.addEventListener("click", toggleTheme);

  DOM.backButton?.addEventListener("click", () => exitExercise(DOM, state));
  DOM.checkButton?.addEventListener("click", () => checkAnswer(DOM, state));
  DOM.nextButton?.addEventListener("click", () => nextExercise(DOM, state));
  DOM.nextLevelButton?.addEventListener("click", () => startNewRound(DOM, state));

  // Gamification and User Profile
  // Achievements handled via new tab-navigation system (not modal)
  // DOM.achievementsButton?.addEventListener("click", () => showAchievementsPanel(DOM, state));
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
    // Inputs de frações equivalentes ou simplificação
    const fractionInputs = document.querySelectorAll('.fraction-missing-input');
    
    // Determina qual input usar com nova lógica melhorada
    let targetInput = DOM.answerInput;
    
    if (fractionInputs.length > 0) {
      // 1. Tentar usar o input marcado como ativo
      let activeInput = document.querySelector('.fraction-missing-input[data-active="true"]');
      
      // 2. Se não houver ativo, procurar o que tem foco
      if (!activeInput) {
        activeInput = document.querySelector('.fraction-missing-input:focus');
      }
      
      // 3. Se ainda não houver, usar o último que foi tocado/clicado
      if (!activeInput) {
        activeInput = activeFractionInput && document.contains(activeFractionInput) 
                     ? activeFractionInput 
                     : fractionInputs[0];
      }
      
      if (activeInput) {
        targetInput = activeInput;
        // Marcar como ativo e desmarcar outros
        fractionInputs.forEach(input => input.removeAttribute('data-active'));
        activeInput.setAttribute('data-active', 'true');
        activeFractionInput = activeInput;
      }
    } else if (inlineInput) {
      // Para inputs inline normais, aplicar também o sistema de marcação ativa
      targetInput = inlineInput;
      inlineInput.setAttribute('data-active', 'true');
    }

    if (value === "delete") {
      targetInput.value = targetInput.value.slice(0, -1);
    } else if (value === "clear") {
      targetInput.value = "";
    } else if (value === "tab") {
      // Navegar para o próximo campo editável
      const allInputs = document.querySelectorAll('.fraction-missing-input, .inline-missing-input');

      if (allInputs.length > 1) {
        // Encontrar o input atualmente ativo/focado
        let currentInput = document.querySelector('.fraction-missing-input[data-active="true"]') ||
                          document.querySelector('.fraction-missing-input:focus') ||
                          document.querySelector('.inline-missing-input[data-active="true"]') ||
                          document.querySelector('.inline-missing-input:focus');

        // Se não encontrou nenhum ativo/focado, usar o primeiro
        if (!currentInput) {
          currentInput = allInputs[0];
        }

        const currentIndex = Array.from(allInputs).indexOf(currentInput);
        const nextIndex = (currentIndex + 1) % allInputs.length;
        const nextInput = allInputs[nextIndex];

        // Desmarcar todos os inputs ativos
        document.querySelectorAll('.fraction-missing-input[data-active="true"], .inline-missing-input[data-active="true"]').forEach(input => {
          input.removeAttribute('data-active');
        });

        // Marcar próximo input como ativo
        nextInput.setAttribute('data-active', 'true');

        // Dar foco no próximo input imediatamente
        // Evitar abrir o teclado nativo em mobile se o input estiver marcado para prevenir
        if (nextInput.hasAttribute && nextInput.hasAttribute('data-prevent-native-keyboard')) {
          safeFocus(nextInput);
        } else {
          nextInput.focus();
        }

        // Atualizar targetInput para o próximo input para evitar conflitos de foco
        targetInput = nextInput;

        // Atualizar variável global se for fração
        if (nextInput.classList.contains('fraction-missing-input')) {
          activeFractionInput = nextInput;
        }
      }
    } else if (value === "enter") {
      checkAnswer(DOM, state);
    } else {
      targetInput.value += value;
    }

    // Se o input inline existir, sincroniza o seu valor com o input principal (oculto)
    if (inlineInput && targetInput === inlineInput) {
      DOM.answerInput.value = inlineInput.value;
    }
    // Se for um input de fração, mantém o foco nele e atualiza o rastreamento
    if (targetInput.classList.contains('fraction-missing-input')) {
      activeFractionInput = targetInput;
      // Evitar foco nativo em mobile quando estiver prevenindo teclado
      if (targetInput.hasAttribute && targetInput.hasAttribute('data-prevent-native-keyboard')) {
        safeFocus(targetInput);
      } else {
        targetInput.focus();
      }
      // Garantir que está marcado como ativo
      fractionInputs.forEach(input => input.removeAttribute('data-active'));
      targetInput.setAttribute('data-active', 'true');
    }
    // Se for um input inline normal, também mantém o foco
    if (targetInput.classList.contains('inline-missing-input')) {
      targetInput.focus();
      targetInput.setAttribute('data-active', 'true');
    }
  });

  // Event listener para fechar o popup da narrativa
  DOM.closeNarrativePopup?.addEventListener("click", () => {
    DOM.narrativePopup.classList.add("hidden");
    // Devolve o foco para o input do exercício
    const inlineInput = document.getElementById("inline-missing-input");
    const targetInput = inlineInput || DOM.answerInput;
    if (DOM.customKeyboard) DOM.customKeyboard.classList.remove("hidden");
    safeFocus(targetInput);
  });

  // Função para rastrear inputs de frações ativos
  function trackActiveFractionInput() {
    // Adicionar listeners a todos os inputs de fração e inline quando são criados
    const observer = new MutationObserver(() => {
      const fractionInputs = document.querySelectorAll('.fraction-missing-input');
      const inlineInputs = document.querySelectorAll('.inline-missing-input');
      
      [...fractionInputs, ...inlineInputs].forEach(input => {
        // Remover listeners existentes para evitar duplicação
  input.removeEventListener('focus', handleFractionFocus);
  input.removeEventListener('click', handleFractionFocus);
  input.removeEventListener('pointerdown', handleFractionFocus);
        
  // Adicionar novos listeners
  input.addEventListener('focus', handleFractionFocus);
  input.addEventListener('click', handleFractionFocus);
  input.addEventListener('pointerdown', handleFractionFocus);
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  function handleFractionFocus(event) {
    const input = event.target;
    // Marcar este input como ativo e desmarcar outros
    const allFractionInputs = document.querySelectorAll('.fraction-missing-input');
    allFractionInputs.forEach(inp => inp.removeAttribute('data-active'));
    input.setAttribute('data-active', 'true');
    activeFractionInput = input;
  }

  // Iniciar o rastreamento
  trackActiveFractionInput();
}