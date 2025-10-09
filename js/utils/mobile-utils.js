// js/utils/mobile-utils.js
/**
 * Utilitários para detectar dispositivos móveis e prevenir comportamentos indesejados
 */

/**
 * Detecta se o dispositivo é móvel
 * @returns {boolean} True se for dispositivo móvel
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
         window.innerWidth <= 768;
}

/**
 * Detecta se é um dispositivo touch
 * @returns {boolean} True se suportar touch
 */
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Faz focus seguro em input sem ativar teclado móvel
 * @param {HTMLElement} element - O elemento para fazer focus
 * @param {boolean} force - Forçar focus mesmo em mobile
 */
export function safeFocus(element, force = false) {
  if (!element || typeof element.focus !== 'function') return;
  
  // Em dispositivos móveis, só faz focus se forçado ou se há teclado personalizado visível
  if (isMobileDevice() && !force) {
    const customKeyboard = document.getElementById('custom-keyboard');
    if (customKeyboard && !customKeyboard.classList.contains('hidden')) {
      // Há teclado personalizado visível, pode fazer focus
      element.focus();
    } else {
      // Em mobile sem teclado personalizado, apenas mostra teclado sem focus
      const customKeyboard = document.getElementById('custom-keyboard');
      if (customKeyboard) customKeyboard.classList.remove('hidden');
    }
  } else {
    // Desktop ou forçado: focus normal
    element.focus();
  }
}

/**
 * Previne o teclado móvel de aparecer
 * @param {HTMLElement} element - O input element
 */
export function preventMobileKeyboard(element) {
  if (!element) return;
  
  // Adicionar atributos para prevenir teclado móvel
  element.setAttribute('inputmode', 'none');
  element.setAttribute('autocomplete', 'off');
  element.setAttribute('readonly', 'true');
  
  // Remover readonly quando há interação (para permitir seleção de texto)
  element.addEventListener('focus', () => {
    if (isMobileDevice()) {
      setTimeout(() => {
        element.removeAttribute('readonly');
      }, 100);
    }
  });
  
  // Restaurar readonly quando perde focus
  element.addEventListener('blur', () => {
    if (isMobileDevice()) {
      element.setAttribute('readonly', 'true');
    }
  });
}