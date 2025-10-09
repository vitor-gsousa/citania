// js/ui.js
/*
 * Este módulo é responsável por todas as manipulações diretas do DOM e atualizações da UI.
 * Inclui mostrar/esconder secções, atualizar barras de progresso, feedback, etc.
 */
import { showThemes } from "./app.js";

/**
 * Mostra a área de exercício e esconde o menu.
 * @param {object} DOM - Referências aos elementos do DOM.
 */
export function showExerciseArea(DOM) {
  DOM.menuContainer.classList.add("hidden");
  DOM.exerciseArea.classList.remove("hidden");

  // Em mobile, focar diretamente na área da questão para melhor visibilidade
  if (window.innerWidth <= 768) {
    DOM.questionEl.scrollIntoView({ behavior: "smooth", block: "center" });
  } else {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

/**
 * Sai da área de exercício e volta ao menu principal.
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
export function exitExercise(DOM, state) {
  state.roundProgress = 0;
  showThemes(); // Chama a função correta para voltar ao menu de temas

  // Restaura estado dos controlos
  DOM.checkButton.style.display = "block";
  DOM.nextButton.style.display = "none";
  DOM.answerInput.value = "";
  
  // Limpar também input inline se existir
  const inlineInput = document.getElementById("inline-missing-input");
  if (inlineInput) {
    inlineInput.value = "";
  }
  
  DOM.feedbackEl.textContent = "";
  DOM.feedbackEl.className = "hidden";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Atualiza a barra de progresso da ronda.
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
export function updateProgressBar(DOM, state) {
  const pct = Math.min(100, (state.roundProgress / state.exercisesPerRound) * 100);
  DOM.progressBar.style.width = pct + "%";
  DOM.progressBar.setAttribute("aria-valuenow", state.roundProgress);
  DOM.currentLevelEl.textContent = state.level;
}

/**
 * Atualiza a contagem de respostas certas e erradas.
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
export function updateScoreDisplay(DOM, state) {
  if (DOM.correctCountEl) DOM.correctCountEl.textContent = state.score.correct;
  if (DOM.incorrectCountEl) DOM.incorrectCountEl.textContent = state.score.incorrect;
}

/**
 * Mostra o ecrã de resumo e de subida de nível.
 * @param {object} DOM - Referências aos elementos do DOM.
 * @param {object} state - O estado global da aplicação.
 */
export function showLevelUpUI(DOM, state) {
  DOM.summaryCorrect.textContent = state.score.correct;
  DOM.summaryTotal.textContent = state.score.correct + state.score.incorrect;
  DOM.nextLevelButton.querySelector("span").textContent = state.level;
  
  // Atualizar também o contador de nível atual na interface
  if (DOM.currentLevelEl) {
    DOM.currentLevelEl.textContent = state.level;
  }

  DOM.exerciseArea.classList.add("hidden");
  DOM.summaryArea.classList.remove("hidden");
}

/**
 * Dispara uma animação de confetti.
 */
export async function triggerConfetti() {
  if (typeof window.confetti === "function") {
    window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    return;
  }
  // Carrega script do confetti se não existir
  try {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.2/dist/confetti.browser.min.js";
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    window.confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
  } catch (e) {
    console.warn("triggerConfetti failed:", e);
  }
}