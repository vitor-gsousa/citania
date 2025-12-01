// js/exercise.js
/*
 * Este módulo gere o ciclo de vida dos exercícios:
 * - Definição dos tipos de exercícios.
 * - Geração de novos problemas.
 * - Verificação de respostas.
 * - Gestão da progressão de níveis e rondas.
 */
import { generateAddSub } from "./modules/arithmetic/progression.js";
import { generateMulDiv, checkMulDivAnswer } from "./modules/arithmetic/mulDiv.js";
import { generateFractions, checkFractionAnswer } from "./modules/arithmetic/fractions.js";
import { generateFractionToDecimal } from "./modules/arithmetic/fractionToDecimal.js";
import { generateIrreducibleFractions, checkIrreducibleAnswer } from "./modules/arithmetic/irreducibleFractions.js";
import { generateGcd } from "./modules/arithmetic/gcd.js";
import { generateLcm } from "./modules/arithmetic/lcm.js";
import { generatePowerDivision } from "./modules/arithmetic/powerDivision.js";
import { generatePowerMultiplication } from "./modules/arithmetic/powerMultiplication.js";
import { generatePrimeFactorization } from "./modules/arithmetic/primeFactorization.js";
import { sounds } from "./services/sounds.js";
import { loadProgressForType, saveProgressForType } from "./progress.js";
import { safeFocus, preventMobileKeyboard } from "./utils/mobile-utils.js";
import { updateFractionVisual } from "./utils/fraction-visual.js";
import {
  adicionarPontos,
  awardBadge,
  BADGES,
  gamification,
  mostrarNarrativa,
  renderGamificationBar,
  showNarrativePopup,
} from "./features/gamification.js";
import {
  updateProgressBar,
  showExerciseArea,
  triggerConfetti,
  showLevelUpUI,
  updateScoreDisplay,
} from "./ui.js";
import { updatePageTitle } from "./app.js";

// Mapa de exercícios disponíveis
export const exercises = {
  addSub: {
    generate: generateAddSub,
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim(), 10) === correctAnswer,
  },
  mulDiv: {
    generate: generateMulDiv,
    check: checkMulDivAnswer,
  },
  fractions: {
    generate: generateFractions,
    check: checkFractionAnswer,
  },
  fractionToDecimal: {
    generate: generateFractionToDecimal,
    check: (userAnswer, correctAnswer) => {
      const userValue = parseFloat(userAnswer.replace(",", ".").trim());
      return Math.abs(userValue - correctAnswer) < 0.0001; // Tolerância para precisão de floating point
    },
  },
  irreducibleFractions: {
    generate: generateIrreducibleFractions,
    check: checkIrreducibleAnswer,
  },
  primeFactorization: {
    generate: generatePrimeFactorization,
    check: (userAnswer, correctAnswerArray) => {
      const userFactors = userAnswer.match(/\d+/g)?.map(Number).sort((a, b) => a - b) || [];
      return JSON.stringify(userFactors) === JSON.stringify(correctAnswerArray.sort((a, b) => a - b));
    },
  },
  gcd: {
    generate: generateGcd,
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim(), 10) === correctAnswer,
  },
  lcm: {
    generate: generateLcm,
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim(), 10) === correctAnswer,
  },
  powerMultiplication: {
    generate: generatePowerMultiplication,
    check: (userAnswer, correctAnswer, checkType) => {
      if (checkType === "number") {
        return parseInt(userAnswer.trim(), 10) === correctAnswer;
      }
      return userAnswer.replace(/\s/g, "") === correctAnswer;
    },
  },
  powerDivision: {
    generate: generatePowerDivision,
    check: (userAnswer, correctAnswer) => userAnswer.replace(/\s/g, "") === correctAnswer,
  },
};

// Estado do exercício corrente
export let currentExercise = {};

/**
 * Limpa elementos visuais anteriores da área de exercícios
 * @param {HTMLElement} exerciseArea - Container da área de exercícios
 */
function clearExerciseVisuals(exerciseArea) {
  if (!exerciseArea) return;
  
  // Remover containers de frações
  const fractionContainers = exerciseArea.querySelectorAll('.fraction-container, .fraction-equivalent-with-input, .fraction-operation');
  fractionContainers.forEach(container => {
    if (container && container.parentNode) {
      container.remove();
    }
  });
  
  // Remover apenas inputs inline que NÃO estão dentro da pergunta
  const questionEl = exerciseArea.querySelector('.question');
  const inlineInputs = exerciseArea.querySelectorAll('.inline-missing-input');
  inlineInputs.forEach(input => {
    // Só remover se não estiver dentro da pergunta
    if (!questionEl || !questionEl.contains(input)) {
      if (input && input.parentNode) {
        input.remove();
      }
    }
  });
  
  // Limpar atributos data-active de inputs de frações remanescentes
  const fractionInputs = exerciseArea.querySelectorAll('.fraction-missing-input');
  fractionInputs.forEach(input => {
    if (input) {
      input.removeAttribute('data-active');
    }
  });
}

export function startExercise(type, DOM, state) {
  if (!exercises[type]) {
    console.error("Tipo de exercício inválido:", type);
    return;
  }

  state.level = loadProgressForType(type);
  currentExercise.type = type;
  currentExercise.attempts = 0;

  state.score.correct = 0;
  state.score.incorrect = 0;
  state.roundProgress = 0;

  // Limpar estado visual anterior
  clearExerciseVisuals(DOM.exerciseArea);
  
  // Resetar estado de frações se a função existir
  if (typeof window.resetFractionState === 'function') {
    window.resetFractionState();
  }

  // Configurar prevenção de teclado móvel no input principal
  preventMobileKeyboard(DOM.answerInput);

  showExerciseArea(DOM);
  updateProgressBar(DOM, state);
  updateScoreDisplay(DOM, state);
  generateNewExercise(DOM, state);
  showNarrativePopup(DOM); // Mostra o popup da narrativa em mobile APÓS o exercício estar pronto

  // Atualizar título da página
  updatePageTitle();
}

export function generateNewExercise(DOM, state) {
  const exercise = exercises[currentExercise.type];
  const problem = exercise.generate(state.level);

  currentExercise.answer = problem.answer;
  currentExercise.explanation = problem.explanation;
  currentExercise.checkType = problem.checkType;
  currentExercise.visualData = problem.visualData; // Guardar dados visuais para frações
  currentExercise.hasInlineInput = problem.hasInlineInput; // Nova propriedade para input inline
  currentExercise.usesKeyboard = problem.usesKeyboard; // Nova propriedade para exercícios que usam teclado numérico
  const isMissingTerm = problem.isMissingTerm || currentExercise.type === 'addSub';

  // Limpar qualquer conteúdo visual anterior da área de exercícios ANTES de inserir o novo
  clearExerciseVisuals(DOM.exerciseArea);
  
  // Resetar estado de frações se a função existir
  if (typeof window.resetFractionState === 'function') {
    window.resetFractionState();
  }

  DOM.questionEl.innerHTML = problem.question;
  DOM.answerInput.value = "";
  
  // Limpar também input inline se existir
  const inlineInput = document.querySelector(".inline-missing-input");
  if (inlineInput) {
    inlineInput.value = "";
  }
  
  DOM.feedbackEl.textContent = "";
  DOM.feedbackEl.className = "hidden";
  state.answered = false;

  // Adicionar representação visual para exercícios de frações
  if (currentExercise.type === 'fractions' && currentExercise.visualData) {
    updateFractionVisual(DOM.exerciseArea, currentExercise.visualData);
  }

  // Lógica para exercícios que usam teclado numérico (irreducibleFractions)
  if (currentExercise.usesKeyboard) {
    DOM.answerInput.classList.remove("hidden");
    preventMobileKeyboard(DOM.answerInput);
    safeFocus(DOM.answerInput);
    DOM.customKeyboard.classList.remove("hidden");
    // Não fazer return aqui para permitir que o checkButton/nextButton sejam inicializados corretamente
  } else if (isMissingTerm || currentExercise.hasInlineInput) {
    // Lógica para exercícios com input inline (addSub e frações equivalentes)
    DOM.answerInput.classList.add("hidden"); // Esconde o input principal
    
    // Para frações equivalentes, o input já está integrado na visualização
    if (currentExercise.hasInlineInput) {
      // Procurar inputs inline na visualização de frações
      const fractionInputs = DOM.exerciseArea.querySelectorAll('.fraction-missing-input');
      if (fractionInputs.length > 0) {
        // Preparar o primeiro input (numerador ou único input) sem forçar focus em mobile
        const firstInput = fractionInputs[0];
        preventMobileKeyboard(firstInput);
        // Mostrar teclado personalizado, mas só focar em ambientes desktop ou quando forçado
        if (!firstInput.hasAttribute('data-prevent-native-keyboard')) {
          safeFocus(firstInput);
        } else {
          // Em mobile com teclado personalizado, evitar focus direto para impedir teclado nativo.
          // Marcar como ativo para que o teclado personalizado escreva nele.
          firstInput.setAttribute('data-active', 'true');
        }
        DOM.customKeyboard.classList.remove("hidden");

        // Adicionar eventos para todos os inputs de frações (abrir teclado personalizado)
        fractionInputs.forEach(input => {
          input.addEventListener('focus', () => {
            DOM.customKeyboard.classList.remove("hidden");
          });
          // Em vez de touchstart que pode provocar comportamento inconsistente, usar pointerdown para rastrear interação sem prevenir foco nativo aqui.
          input.addEventListener('pointerdown', (e) => {
            // Marcar como ativo para que o teclado personalizado direcione a entrada
            fractionInputs.forEach(inp => inp.removeAttribute('data-active'));
            input.setAttribute('data-active', 'true');
            // Não chamar input.focus() diretamente em mobile para não abrir teclado nativo; o custom keyboard gerará os valores.
            DOM.customKeyboard.classList.remove("hidden");
          });
        });
      }
    } else {
      // Lógica original para addSub
      const inlineInput = document.querySelector(".inline-missing-input");
      if (inlineInput) {
        preventMobileKeyboard(inlineInput);
        safeFocus(inlineInput);
        // Para este tipo de exercício, o teclado deve estar sempre visível
        DOM.customKeyboard.classList.remove("hidden");
      }
    }
  } else {
    DOM.answerInput.classList.remove("hidden"); // Mostra o input principal para outros exercícios
    preventMobileKeyboard(DOM.answerInput);
    safeFocus(DOM.answerInput);
    DOM.customKeyboard.classList.add("hidden");
  }

  // Adicionar listeners para option-buttons (múltipla escolha)
  const optionButtons = DOM.exerciseArea.querySelectorAll('.option-button');
  if (optionButtons.length > 0) {
    optionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const optionValue = btn.getAttribute('data-option');
        if (optionValue) {
          DOM.answerInput.value = optionValue;
          // Quando clica numa opção, verifica automaticamente
          checkAnswer(DOM, state);
        }
      });
    });
  }

  DOM.checkButton.style.display = "block";
  DOM.nextButton.style.display = "none";
}

export function checkAnswer(DOM, state) {
  if (state.answered) return;

  currentExercise.attempts = (currentExercise.attempts || 0) + 1;
  
  // Verificar se existe input inline (para exercícios como addSub ou frações equivalentes)
  const inlineInput = document.querySelector(".inline-missing-input");
  const fractionInputs = DOM.exerciseArea.querySelectorAll('.fraction-missing-input');
  
  let userAnswer = '';
  if (currentExercise.hasInlineInput && fractionInputs.length > 0) {
    if (fractionInputs.length === 1) {
      // Para frações equivalentes, usar o input integrado na visualização
      userAnswer = fractionInputs[0].value;
    } else if (fractionInputs.length === 2) {
      // Para exercícios de simplificação, concatenar numerador/denominador
      const numeratorInput = DOM.exerciseArea.querySelector('.fraction-missing-input[data-part="numerator"]');
      const denominatorInput = DOM.exerciseArea.querySelector('.fraction-missing-input[data-part="denominator"]');
      
      if (numeratorInput && denominatorInput && numeratorInput.value && denominatorInput.value) {
        userAnswer = `${numeratorInput.value}/${denominatorInput.value}`;
      }
    }
  } else if (inlineInput) {
    // Para exercícios addSub, usar o input inline tradicional
    userAnswer = inlineInput.value;
  } else {
    // Para outros exercícios, usar o input principal
    userAnswer = DOM.answerInput.value;
  }
  
  if (!userAnswer.trim()) {
    DOM.feedbackEl.innerHTML = "⚠️ Por favor, escreve uma resposta.";
    DOM.feedbackEl.className = "incorrect";
    return;
  }

  const exerciseLogic = exercises[currentExercise.type];
  const isCorrect = exerciseLogic.check(userAnswer, currentExercise.answer, currentExercise.checkType);
  const correctAnswerFormatted = Array.isArray(currentExercise.answer) ? currentExercise.answer.join(" x ") : currentExercise.answer;

  if (isCorrect) {
    sounds.correct.play();
    DOM.feedbackEl.innerHTML = "✅ Muito bem! Resposta correta!";
    DOM.feedbackEl.className = "correct";
    state.score.correct++;
    state.streak++;
    adicionarPontos(DOM, 10);

    // Lógica para atribuir medalhas
    if (currentExercise.attempts === 1) awardBadge(DOM, BADGES.firstTry);
    if (state.streak >= 5) awardBadge(DOM, BADGES.streak5);
    if (gamification.pontos >= 50) awardBadge(DOM, BADGES.explorer);

  } else {
    sounds.incorrect.play();
    DOM.feedbackEl.innerHTML = `❌ Quase! A resposta certa é <strong>${correctAnswerFormatted}</strong>.`;
    DOM.feedbackEl.className = "incorrect";
    state.score.incorrect++;
    state.streak = 0;
    adicionarPontos(DOM, 2);
  }

  state.roundProgress++;
  updateScoreDisplay(DOM, state);
  updateProgressBar(DOM, state);

  if (state.roundProgress >= state.exercisesPerRound) {
    state.level++;
    saveProgressForType(currentExercise.type, state.level);
    state.roundProgress = 0;
    
    // Atribuir medalha de estudioso ao subir de nível
    if (state.level >= 3) awardBadge(DOM, BADGES.scholar);

    // Level up completo: som + confetti + UI
    sounds.levelup.play();
    triggerConfetti();
    showLevelUpUI(DOM, state);
  }

  if (state.roundProgress <= state.explanationLimit) {
    DOM.feedbackEl.innerHTML += `<br><small style="font-weight: normal; opacity: 0.9;">${currentExercise.explanation}</small>`;
  }

  state.answered = true;
  DOM.checkButton.style.display = "none";
  DOM.nextButton.style.display = "block";
  DOM.nextButton.focus();
}

export function nextExercise(DOM, state) {
  generateNewExercise(DOM, state);
}

export function startNewRound(DOM, state) {
  state.roundProgress = 0;
  DOM.summaryArea.classList.add("hidden");
  DOM.exerciseArea.classList.remove("hidden");
  
  // Garantir que o nível está atualizado na interface
  updateProgressBar(DOM, state);
  updateScoreDisplay(DOM, state);
  
  mostrarNarrativa(state.level);
  renderGamificationBar(DOM);
  generateNewExercise(DOM, state);
}