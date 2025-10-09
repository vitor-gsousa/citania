// js/templates/exercise-card.js

/**
 * Templates para geração dinâmica de cards de exercícios
 * Mantém consistência visual e facilita manutenção
 */

/**
 * Cria um card individual de exercício
 * @param {Object} exercise - Dados do exercício
 * @param {string} exercise.type - Tipo do exercício (data-type)
 * @param {string} exercise.icon - Nome do ícone Material Symbols
 * @param {string} exercise.text - Texto a exibir no card
 * @param {string} exercise.ariaLabel - Label para acessibilidade
 * @returns {string} HTML do card gerado
 */
export function createExerciseCard(exercise) {
  const { type, icon, text, ariaLabel } = exercise;
  
  return `
    <div
      class="card"
      data-type="${type}"
      role="button"
      tabindex="0"
      aria-label="${ariaLabel}"
    >
      <span class="material-symbols-outlined card-icon">${icon}</span>
      <span class="card-text">${text}</span>
    </div>`;
}

/**
 * Cria um card de área matemática principal
 * @param {Object} area - Dados da área matemática
 * @param {string} area.id - ID da área (usado para data-target)
 * @param {string} area.icon - Nome do ícone Material Symbols
 * @param {string} area.text - Texto a exibir no card
 * @param {string} area.ariaLabel - Label para acessibilidade
 * @returns {string} HTML do card de área gerado
 */
export function createThemeAreaCard(area) {
  const { id, icon, text, ariaLabel } = area;
  
  return `
    <div
      class="card area-card"
      role="button"
      tabindex="0"
      aria-label="${ariaLabel}"
      data-action="open-section"
      data-target="section-${id}"
    >
      <span class="material-symbols-outlined card-icon">${icon}</span>
      <span class="card-text">${text}</span>
    </div>`;
}

/**
 * Gera múltiplos cards de exercícios a partir de um array
 * @param {Array} exercises - Array de objetos de exercício
 * @returns {string} HTML concatenado de todos os cards
 */
export function createExerciseCards(exercises) {
  if (!Array.isArray(exercises) || exercises.length === 0) {
    return '<p class="no-exercises">Nenhum exercício disponível nesta área.</p>';
  }
  
  return exercises
    .map(exercise => createExerciseCard(exercise))
    .join('\n    ');
}

/**
 * Gera todos os cards de áreas matemáticas
 * @param {Array} areas - Array de objetos de área matemática
 * @returns {string} HTML concatenado de todos os cards de área
 */
export function createThemeAreaCards(areas) {
  if (!Array.isArray(areas) || areas.length === 0) {
    return '<p class="no-areas">Nenhuma área disponível.</p>';
  }
  
  return areas
    .map(area => createThemeAreaCard(area))
    .join('\n        ');
}

/**
 * Cria o container completo da grid de temas
 * @param {Array} areas - Array de áreas matemáticas
 * @returns {string} HTML completo da secção de temas
 */
export function createThemesSection(areas) {
  const cardsHtml = createThemeAreaCards(areas);
  
  return `
    <section id="themes" class="themes">
      <h2>Áreas</h2>
      <div class="card-container themes-grid">
        ${cardsHtml}
      </div>
    </section>`;
}

/**
 * Cria o botão de voltar padrão para secções
 * @param {string} label - Texto do botão (opcional)
 * @returns {string} HTML do botão de voltar
 */
export function createBackButton(label = "Voltar às Áreas") {
  return `
    <button 
      class="close-section" 
      data-action="close-section" 
      aria-label="${label}"
    >
      ← ${label}
    </button>`;
}