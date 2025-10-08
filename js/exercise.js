// js/exercise.js
/*
 * Este módulo gere o ciclo de vida dos exercícios:
 * - Definição dos tipos de exercícios.
 * - Geração de novos problemas.
 * - Verificação de respostas.
 * - Gestão da progressão de níveis e rondas.
 */
import { generateAddSub } from "./modules/arithmetic/progression.js";
import { generateFractionToDecimal } from "./modules/arithmetic/fractionToDecimal.js";
import { generateGcd } from "./modules/arithmetic/gcd.js";
import { generateLcm } from "./modules/arithmetic/lcm.js";
import { generatePowerDivision } from "./modules/arithmetic/powerDivision.js";
import { generatePowerMultiplication } from "./modules/arithmetic/powerMultiplication.js";
import { generatePrimeFactorization } from "./modules/arithmetic/primeFactorization.js";
import { sounds } from "./services/sounds.js";
import { loadProgressForType, saveProgressForType } from "./progress.js";
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

// Mapa de exercícios disponíveis
export const exercises = {
  addSub: {
    generate: generateAddSub,
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim(), 10) === correctAnswer,
  },
  fractionToDecimal: {
    generate: generateFractionToDecimal,
    check: (userAnswer, correctAnswer) => parseFloat(userAnswer.replace(",", ".").trim()).toFixed(2) === correctAnswer,
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
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim()) === correctAnswer,
  },
  lcm: {
    generate: generateLcm,
    check: (userAnswer, correctAnswer) => parseInt(userAnswer.trim()) === correctAnswer,
  },
  powerMultiplication: {
    generate: generatePowerMultiplication,
    check: (userAnswer, correctAnswer, checkType) => {
      if (checkType === "number") {
        return parseInt(userAnswer.trim()) === correctAnswer;
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

  showExerciseArea(DOM);
  updateProgressBar(DOM, state);
  updateScoreDisplay(DOM, state);
  generateNewExercise(DOM, state);
  showNarrativePopup(DOM); // Mostra o popup da narrativa em mobile APÓS o exercício estar pronto
}

export function generateNewExercise(DOM, state) {
  const exercise = exercises[currentExercise.type];
  const problem = exercise.generate(state.level);

  currentExercise.answer = problem.answer;
  currentExercise.explanation = problem.explanation;
  currentExercise.checkType = problem.checkType;
  const isMissingTerm = problem.isMissingTerm || currentExercise.type === 'addSub';

  DOM.questionEl.innerHTML = problem.question;
  DOM.answerInput.value = "";
  DOM.feedbackEl.textContent = "";
  DOM.feedbackEl.className = "hidden";
  state.answered = false;

  // Lógica específica para o tipo de exercício 'addSub' com input inline
  if (isMissingTerm) {
    DOM.answerInput.classList.add("hidden"); // Esconde o input principal
    const inlineInput = document.getElementById("inline-missing-input");
    if (inlineInput) {
      inlineInput.focus();
      // Para este tipo de exercício, o teclado deve estar sempre visível
      DOM.customKeyboard.classList.remove("hidden");
    }
  } else {
    DOM.answerInput.classList.remove("hidden"); // Mostra o input principal para outros exercícios
    DOM.answerInput.focus();
  }

  DOM.checkButton.style.display = "block";
  DOM.nextButton.style.display = "none";
}

export function checkAnswer(DOM, state) {
  if (state.answered) return;

  currentExercise.attempts = (currentExercise.attempts || 0) + 1;
  const userAnswer = DOM.answerInput.value;
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
  mostrarNarrativa(DOM, state.level);
  renderGamificationBar(DOM);
  generateNewExercise(DOM, state);
}