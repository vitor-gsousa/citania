// js/templates/theme-section.js

import { createExerciseCards, createBackButton } from './exercise-card.js';

/**
 * Templates para geração dinâmica de secções de áreas matemáticas
 * Permite criar secções completas com exercícios de forma programática
 */

/**
 * Cria uma secção completa de área matemática
 * @param {string} areaId - ID da área (ex: 'aritmetica')
 * @param {Object} areaData - Dados da área matemática
 * @param {string} areaData.title - Título da área
 * @param {Array} areaData.exercises - Array de exercícios da área
 * @returns {string} HTML completo da secção
 */
export function createThemeSection(areaId, areaData) {
  const { title, exercises } = areaData;
  const exerciseCardsHtml = createExerciseCards(exercises);
  const backButtonHtml = createBackButton();
  
  return `
    <section
      id="section-${areaId}"
      class="theme-section hidden"
      aria-hidden="true"
    >
      <h3>${title}</h3>
      ${backButtonHtml}
      <div class="card-container">
        ${exerciseCardsHtml}
      </div>
    </section>`;
}

/**
 * Gera todas as secções de áreas matemáticas
 * @param {Object} exerciseTypes - Objeto com todas as áreas e exercícios
 * @returns {string} HTML concatenado de todas as secções
 */
export function createAllThemeSections(exerciseTypes) {
  const sections = [];
  
  for (const [areaId, areaData] of Object.entries(exerciseTypes)) {
    const sectionHtml = createThemeSection(areaId, areaData);
    sections.push(sectionHtml);
  }
  
  return sections.join('\n\n        ');
}

/**
 * Cria uma secção placeholder para áreas ainda não implementadas
 * @param {string} areaId - ID da área
 * @param {string} title - Título da área
 * @param {string} message - Mensagem a exibir (opcional)
 * @returns {string} HTML da secção placeholder
 */
export function createPlaceholderSection(areaId, title, message = "Em breve, novos exercícios!") {
  const backButtonHtml = createBackButton();
  
  return `
    <section
      id="section-${areaId}"
      class="theme-section hidden"
      aria-hidden="true"
    >
      <h3>${title}</h3>
      ${backButtonHtml}
      <div class="card-container">
        <div class="placeholder-message">
          <span class="material-symbols-outlined" style="font-size: 3rem; opacity: 0.5;">construction</span>
          <p>${message}</p>
        </div>
      </div>
    </section>`;
}

/**
 * Gera secção com exercícios específicos (útil para atualizações dinâmicas)
 * @param {string} areaId - ID da área
 * @param {string} title - Título da área  
 * @param {Array} exercises - Array específico de exercícios
 * @returns {string} HTML da secção personalizada
 */
export function createCustomThemeSection(areaId, title, exercises) {
  const exerciseCardsHtml = createExerciseCards(exercises);
  const backButtonHtml = createBackButton();
  
  return `
    <section
      id="section-${areaId}"
      class="theme-section hidden"
      aria-hidden="true"
    >
      <h3>${title}</h3>
      ${backButtonHtml}
      <div class="card-container">
        ${exerciseCardsHtml}
      </div>
    </section>`;
}

/**
 * Atualiza dinamicamente o conteúdo de uma secção existente
 * @param {string} areaId - ID da área a atualizar
 * @param {Array} exercises - Novos exercícios para a área
 * @returns {void} Atualiza o DOM diretamente
 */
export function updateThemeSectionContent(areaId, exercises) {
  const section = document.getElementById(`section-${areaId}`);
  if (!section) {
    console.warn(`Secção section-${areaId} não encontrada`);
    return;
  }
  
  const cardContainer = section.querySelector('.card-container');
  if (cardContainer) {
    cardContainer.innerHTML = createExerciseCards(exercises);
  }
}

/**
 * Adiciona um novo exercício a uma secção existente
 * @param {string} areaId - ID da área
 * @param {Object} newExercise - Dados do novo exercício
 * @returns {void} Atualiza o DOM diretamente
 */
export function addExerciseToSection(areaId, newExercise) {
  const section = document.getElementById(`section-${areaId}`);
  if (!section) {
    console.warn(`Secção section-${areaId} não encontrada`);
    return;
  }
  
  const cardContainer = section.querySelector('.card-container');
  if (cardContainer) {
    const exerciseCardHtml = createExerciseCard(newExercise);
    cardContainer.insertAdjacentHTML('beforeend', exerciseCardHtml);
  }
}