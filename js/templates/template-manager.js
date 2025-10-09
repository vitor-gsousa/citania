// js/templates/template-manager.js

import { THEME_AREAS, EXERCISE_TYPES } from '../config/exercise-types.js';
import { 
  createThemesSection, 
  createThemeAreaCards 
} from './exercise-card.js';
import { 
  createAllThemeSections, 
  updateThemeSectionContent 
} from './theme-section.js';

/**
 * Gestor central de templates para inicialização e atualizações dinâmicas
 * Coordena a geração de todo o conteúdo baseado em templates
 */

/**
 * Inicializa todo o conteúdo dinâmico da aplicação
 * Substitui o HTML estático por conteúdo gerado via templates
 * @returns {void} Atualiza o DOM diretamente
 */
export function initializeTemplates() {
  console.log('Inicializando templates dinâmicos...');
  
  try {
    // Gerar e inserir a secção de temas principais
    initializeThemesSection();
    
    // Gerar e inserir todas as secções de exercícios
    initializeExerciseSections();
    
    console.log('Templates inicializados com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar templates:', error);
  }
}

/**
 * Inicializa a secção principal de áreas matemáticas
 * @returns {void} Atualiza o DOM diretamente
 */
function initializeThemesSection() {
  const menuContainer = document.getElementById('menu-container');
  if (!menuContainer) {
    console.warn('Container do menu não encontrado');
    return;
  }
  
  // Verificar se já existe uma secção themes
  const existingThemes = document.getElementById('themes');
  if (existingThemes) {
    console.log('Secção themes já existe, a atualizar conteúdo...');
    updateThemesContent();
    return;
  }
  
  // Criar nova secção de temas
  const themesHtml = createThemesSection(THEME_AREAS);
  
  // Inserir no início do menu container
  menuContainer.insertAdjacentHTML('afterbegin', themesHtml);
}

/**
 * Atualiza o conteúdo da secção de temas existente
 * @returns {void} Atualiza o DOM diretamente
 */
function updateThemesContent() {
  const themesGrid = document.querySelector('.themes-grid');
  if (themesGrid) {
    const cardsHtml = createThemeAreaCards(THEME_AREAS);
    themesGrid.innerHTML = cardsHtml;
  }
}

/**
 * Inicializa todas as secções de exercícios
 * @returns {void} Atualiza o DOM diretamente
 */
function initializeExerciseSections() {
  const menuContainer = document.getElementById('menu-container');
  if (!menuContainer) {
    console.warn('Container do menu não encontrado');
    return;
  }
  
  // Remover secções antigas se existirem
  const existingSections = menuContainer.querySelectorAll('.theme-section');
  existingSections.forEach(section => section.remove());
  
  // Gerar todas as secções
  const allSectionsHtml = createAllThemeSections(EXERCISE_TYPES);
  
  // Inserir após a secção themes
  const themesSection = document.getElementById('themes');
  if (themesSection) {
    themesSection.insertAdjacentHTML('afterend', allSectionsHtml);
  } else {
    // Se não houver secção themes, inserir no final
    menuContainer.insertAdjacentHTML('beforeend', allSectionsHtml);
  }
}

/**
 * Atualiza uma área específica com novos exercícios
 * @param {string} areaId - ID da área a atualizar
 * @param {Array} newExercises - Novos exercícios para a área
 * @returns {void} Atualiza o DOM diretamente
 */
export function updateAreaExercises(areaId, newExercises) {
  updateThemeSectionContent(areaId, newExercises);
}

/**
 * Adiciona uma nova área matemática dinamicamente
 * @param {Object} newArea - Dados da nova área
 * @param {Object} newAreaExercises - Exercícios da nova área
 * @returns {void} Atualiza o DOM e configuração
 */
export function addNewArea(newArea, newAreaExercises) {
  // Adicionar à configuração
  THEME_AREAS.push(newArea);
  EXERCISE_TYPES[newArea.id] = newAreaExercises;
  
  // Atualizar UI
  updateThemesContent();
  initializeExerciseSections();
}

/**
 * Recarrega todos os templates (útil para desenvolvimento)
 * @returns {void} Atualiza o DOM diretamente
 */
export function reloadAllTemplates() {
  console.log('Recarregando todos os templates...');
  initializeTemplates();
}

/**
 * Verifica se os templates foram inicializados
 * @returns {boolean} True se os templates estão carregados
 */
export function areTemplatesInitialized() {
  const themes = document.getElementById('themes');
  const firstSection = document.querySelector('.theme-section');
  
  return themes !== null && firstSection !== null;
}