// js/utils/fraction-visual.js

/**
 * Utilitários para renderização visual de frações
 * Cria representações visuais em HTML/CSS para exercícios de frações
 */

import { preventMobileKeyboard } from './mobile-utils.js';

/**
 * Cria representação visual de uma fração
 * @param {Object} fraction - Objeto com numerador e denominador {num, den}
 * @param {string} visualType - Tipo de visualização ('notation', 'bar', 'circle')
 * @param {Object} options - Opções adicionais
 * @returns {HTMLElement} Elemento DOM com a representação visual
 */
export function createFractionVisual(fraction, visualType = 'notation', options = {}) {
  const container = document.createElement('div');
  container.className = 'fraction-visual';
  
  switch (visualType) {
    case 'notation':
      container.appendChild(createFractionNotation(fraction, options));
      break;
    case 'bar':
      container.appendChild(createFractionBar(fraction, options));
      break;
    case 'circle':
      container.appendChild(createFractionCircle(fraction, options));
      break;
    case 'both':
      container.appendChild(createFractionNotation(fraction, options));
      container.appendChild(createFractionBar(fraction, options));
      break;
    default:
      container.appendChild(createFractionNotation(fraction, options));
  }
  
  return container;
}

/**
 * Cria notação matemática da fração (numerador/denominador)
 * @param {Object} fraction - Fração {num, den}
 * @param {Object} options - Opções (allowInput, missing)
 * @returns {HTMLElement} Elemento com notação matemática
 */
function createFractionNotation(fraction, options = {}) {
  const notation = document.createElement('div');
  notation.className = 'fraction-notation';
  notation.setAttribute('role', 'img');
  notation.setAttribute('aria-label', `Fração ${fraction.num} sobre ${fraction.den}`);
  
  // Numerador
  const numerator = document.createElement('div');
  numerator.className = 'fraction-numerator';
  
  if (options.missing === 'numerator' || options.missing === 'both') {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'fraction-missing-input';
    input.placeholder = options.inputPlaceholder || '?';
    input.setAttribute('aria-label', 'Numerador em falta');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    // Para simplificação, adicionar atributo para identificar o tipo
    if (options.missing === 'both') {
      input.setAttribute('data-part', 'numerator');
    }
    preventMobileKeyboard(input);
    numerator.appendChild(input);
  } else {
    numerator.textContent = fraction.num;
  }
  
  // Linha divisória
  const line = document.createElement('div');
  line.className = 'fraction-line';
  line.setAttribute('aria-hidden', 'true');
  
  // Denominador
  const denominator = document.createElement('div');
  denominator.className = 'fraction-denominator';
  
  if (options.missing === 'denominator' || options.missing === 'both') {
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'fraction-missing-input';
    input.placeholder = options.inputPlaceholder || '?';
    input.setAttribute('aria-label', 'Denominador em falta');
    input.setAttribute('inputmode', 'numeric');
    input.setAttribute('autocomplete', 'off');
    // Para simplificação, adicionar atributo para identificar o tipo
    if (options.missing === 'both') {
      input.setAttribute('data-part', 'denominator');
    }
    preventMobileKeyboard(input);
    denominator.appendChild(input);
  } else {
    denominator.textContent = fraction.den;
  }
  
  notation.appendChild(numerator);
  notation.appendChild(line);
  notation.appendChild(denominator);
  
  return notation;
}

/**
 * Cria representação visual em barra da fração
 * @param {Object} fraction - Fração {num, den}
 * @param {Object} options - Opções de renderização
 * @returns {HTMLElement} Elemento com representação em barra
 */
function createFractionBar(fraction, options = {}) {
  const container = document.createElement('div');
  container.className = 'fraction-bar-visual';
  
  const bar = document.createElement('div');
  bar.className = 'fraction-bar';
  bar.setAttribute('role', 'img');
  bar.setAttribute('aria-label', `Representação visual: ${fraction.num} de ${fraction.den} partes preenchidas`);
  
  // Criar segmentos
  for (let i = 0; i < fraction.den; i++) {
    const segment = document.createElement('div');
    segment.className = 'fraction-segment';
    
    if (i < fraction.num) {
      segment.classList.add('filled');
      segment.setAttribute('aria-label', 'Parte preenchida');
    } else {
      segment.classList.add('empty');
      segment.setAttribute('aria-label', 'Parte vazia');
    }
    
    bar.appendChild(segment);
  }
  
  container.appendChild(bar);
  
  // Adicionar legenda
  if (options.showLegend !== false) {
    const legend = createFractionLegend();
    container.appendChild(legend);
  }
  
  return container;
}

/**
 * Cria representação circular da fração (pizza/tarte)
 * @param {Object} fraction - Fração {num, den}
 * @param {Object} options - Opções de renderização
 * @returns {HTMLElement} Elemento com representação circular
 */
function createFractionCircle(fraction, options = {}) {
  const container = document.createElement('div');
  container.className = 'fraction-circle-visual';
  
  const circle = document.createElement('div');
  circle.className = 'fraction-circle';
  circle.setAttribute('role', 'img');
  circle.setAttribute('aria-label', `Representação circular: ${fraction.num} de ${fraction.den} partes preenchidas`);
  
  // Calcular ângulos para cada segmento
  const segmentAngle = 360 / fraction.den;
  
  for (let i = 0; i < fraction.den; i++) {
    const segment = document.createElement('div');
    segment.className = 'fraction-circle-segment';
    
    if (i < fraction.num) {
      segment.classList.add('filled');
    }
    
    // Aplicar rotação para posicionar o segmento
    const rotation = i * segmentAngle;
    segment.style.transform = `rotate(${rotation}deg)`;
    segment.style.clipPath = `polygon(0 0, 100% 0, 50% 100%)`;
    
    circle.appendChild(segment);
  }
  
  container.appendChild(circle);
  
  return container;
}

/**
 * Cria operação visual entre duas frações
 * @param {Object} fraction1 - Primeira fração
 * @param {Object} fraction2 - Segunda fração
 * @param {string} operator - Operador (+, -, ×, ÷)
 * @param {Object} result - Resultado da operação
 * @param {Object} options - Opções de renderização
 * @returns {HTMLElement} Elemento com operação visual
 */
export function createFractionOperation(fraction1, fraction2, operator, result, options = {}) {
  const container = document.createElement('div');
  container.className = 'fraction-operation';
  
  // Primeira fração
  const visual1 = createFractionVisual(fraction1, options.visualType || 'notation');
  container.appendChild(visual1);
  
  // Operador
  const operatorElement = document.createElement('span');
  operatorElement.className = 'fraction-operator';
  operatorElement.textContent = operator;
  operatorElement.setAttribute('aria-label', `Operador ${getOperatorName(operator)}`);
  container.appendChild(operatorElement);
  
  // Segunda fração
  const visual2 = createFractionVisual(fraction2, options.visualType || 'notation');
  container.appendChild(visual2);
  
  // Igual
  const equals = document.createElement('span');
  equals.className = 'fraction-equals';
  equals.textContent = '=';
  equals.setAttribute('aria-label', 'igual a');
  container.appendChild(equals);
  
  // Resultado
  if (result) {
    const resultVisual = createFractionVisual(result, options.visualType || 'notation', options.resultOptions);
    container.appendChild(resultVisual);
  } else {
    // Placeholder meramente visual – evita classes de input para não interferir com o teclado personalizado
    const placeholder = document.createElement('div');
    placeholder.className = 'fraction-visual fraction-placeholder';

    const placeholderSlot = document.createElement('span');
    placeholderSlot.className = 'fraction-placeholder-slot';
    placeholderSlot.textContent = '?/?';

    placeholder.appendChild(placeholderSlot);
    container.appendChild(placeholder);
  }
  
  return container;
}

/**
 * Cria demonstração de frações equivalentes com input inline integrado
 * @param {Object} fraction1 - Primeira fração
 * @param {Object} fraction2 - Segunda fração (equivalente)
 * @param {Object} options - Opções de renderização
 * @returns {HTMLElement} Elemento com demonstração de equivalência
 */
export function createEquivalentFractions(fraction1, fraction2, options = {}) {
  const container = document.createElement('div');
  container.className = 'fraction-equivalent';
  
  // Se é um exercício com input inline, criar interface especial
  if (options.missing && options.question) {
    return createEquivalentFractionsWithInput(fraction1, fraction2, options);
  }
  
  const operation = document.createElement('div');
  operation.className = 'fraction-operation';
  
  // Primeira fração
  const visual1 = createFractionVisual(fraction1, 'both', options);
  operation.appendChild(visual1);
  
  // Sinal de equivalência
  const equals = document.createElement('span');
  equals.className = 'fraction-equals';
  equals.textContent = '=';
  equals.setAttribute('aria-label', 'é equivalente a');
  operation.appendChild(equals);
  
  // Segunda fração
  const visual2 = createFractionVisual(fraction2, 'both', options);
  operation.appendChild(visual2);
  
  container.appendChild(operation);
  
  return container;
}

/**
 * Cria interface especial para exercícios de equivalência com input inline
 * @param {Object} fraction1 - Primeira fração
 * @param {Object} fraction2 - Segunda fração
 * @param {Object} options - Opções com missing e question
 * @returns {HTMLElement} Interface integrada
 */
function createEquivalentFractionsWithInput(fraction1, fraction2, options) {
  const container = document.createElement('div');
  container.className = 'fraction-equivalent-with-input';
  
  // Remover o título da pergunta pois já está incluído na notação das frações
  // (conforme solicitado para melhorar o layout em móveis)
  
  // Container da operação
  const operation = document.createElement('div');
  operation.className = 'fraction-operation-inline';
  
  // Primeira fração (sempre completa)
  const visual1 = createFractionVisual(fraction1, 'notation');
  operation.appendChild(visual1);
  
  // Sinal de equivalência
  const equals = document.createElement('span');
  equals.className = 'fraction-equals';
  equals.textContent = '=';
  equals.setAttribute('aria-label', 'é equivalente a');
  operation.appendChild(equals);
  
  // Segunda fração (com input inline)
  const fractionWithInput = createFractionNotation(fraction2, { missing: options.missing });
  operation.appendChild(fractionWithInput);
  
  container.appendChild(operation);
  
  // Representação visual em barras (apenas da fração completa)
  const visualBars = document.createElement('div');
  visualBars.className = 'fraction-visual-help';
  
  const helpTitle = document.createElement('h4');
  helpTitle.textContent = 'Representação visual:';
  helpTitle.className = 'fraction-help-title';
  visualBars.appendChild(helpTitle);
  
  const barVisual = createFractionBar(fraction1, { showLegend: true });
  visualBars.appendChild(barVisual);
  
  container.appendChild(visualBars);
  
  return container;
}

/**
 * Cria legenda para explicar as cores utilizadas
 * @returns {HTMLElement} Elemento com legenda
 */
function createFractionLegend() {
  const legend = document.createElement('div');
  legend.className = 'fraction-legend';
  
  // Parte preenchida
  const filledItem = document.createElement('div');
  filledItem.className = 'fraction-legend-item';
  
  const filledColor = document.createElement('div');
  filledColor.className = 'fraction-legend-color filled';
  filledColor.setAttribute('aria-hidden', 'true');
  
  const filledText = document.createElement('span');
  filledText.textContent = 'Preenchido';
  
  filledItem.appendChild(filledColor);
  filledItem.appendChild(filledText);
  
  // Parte vazia
  const emptyItem = document.createElement('div');
  emptyItem.className = 'fraction-legend-item';
  
  const emptyColor = document.createElement('div');
  emptyColor.className = 'fraction-legend-color empty';
  emptyColor.setAttribute('aria-hidden', 'true');
  
  const emptyText = document.createElement('span');
  emptyText.textContent = 'Vazio';
  
  emptyItem.appendChild(emptyColor);
  emptyItem.appendChild(emptyText);
  
  legend.appendChild(filledItem);
  legend.appendChild(emptyItem);
  
  return legend;
}

/**
 * Atualiza o conteúdo visual do exercício baseado nos dados
 * @param {HTMLElement} container - Container do exercício
 * @param {Object} visualData - Dados do exercício
 */
export function updateFractionVisual(container, visualData) {
  // Limpar conteúdo visual anterior
  const existingVisual = container.querySelector('.fraction-container');
  if (existingVisual) {
    existingVisual.remove();
  }
  
  // Criar novo conteúdo visual
  const visualContainer = document.createElement('div');
  visualContainer.className = 'fraction-container';
  
  switch (visualData.type) {
    case 'equivalent':
      const equivalentVisual = createEquivalentFractions(
        visualData.fraction1, 
        visualData.fraction2, 
        { 
          missing: visualData.missing,
          question: visualData.question
        }
      );
      visualContainer.appendChild(equivalentVisual);
      break;
      
    case 'simplify':
      // Para simplificação, criamos um layout especial
      const simplifyContainer = document.createElement('div');
      simplifyContainer.className = 'fraction-operation';
      
      // Fração original
      const originalVisual = createFractionVisual(visualData.original, 'notation');
      simplifyContainer.appendChild(originalVisual);
      
      // Sinal de igual
      const equals = document.createElement('span');
      equals.className = 'fraction-equals';
      equals.textContent = '=';
      equals.setAttribute('aria-label', 'igual a');
      simplifyContainer.appendChild(equals);
      
      // Fração simplificada (com inputs para resposta)
      const simplifiedOptions = {
        missing: 'both',
        inputPlaceholder: '?'
      };
      const simplifiedVisual = createFractionVisual(visualData.simplified, 'notation', simplifiedOptions);
      simplifyContainer.appendChild(simplifiedVisual);
      
      visualContainer.appendChild(simplifyContainer);
      break;
      
    case 'operation':
      const operationVisual = createFractionOperation(
        visualData.fraction1,
        visualData.fraction2,
        getOperatorSymbol(visualData.operation),
        visualData.result,
        { visualType: 'notation' }
      );
      visualContainer.appendChild(operationVisual);
      break;
      
    case 'compare':
      const compareVisual = createFractionOperation(
        visualData.fraction1,
        visualData.fraction2,
        visualData.comparison,
        null,
        { visualType: 'both' }
      );
      visualContainer.appendChild(compareVisual);
      break;
      
    default:
      // Visualização padrão
      const defaultVisual = createFractionVisual(visualData.fraction1 || visualData, 'both');
      visualContainer.appendChild(defaultVisual);
  }
  
  // Inserir o container visual de forma mais segura
  const questionElement = container.querySelector('#question');
  if (questionElement) {
    // Usar insertAdjacentElement que é mais seguro
    try {
      questionElement.insertAdjacentElement('afterend', visualContainer);
    } catch (error) {
      console.warn('Erro ao inserir visual após pergunta, usando fallback:', error);
      container.appendChild(visualContainer);
    }
  } else {
    // Se não encontrar a pergunta, adicionar no final do container
    container.appendChild(visualContainer);
  }
}

/**
 * Obtém o símbolo do operador para exibição
 * @param {string} operation - Nome da operação
 * @returns {string} Símbolo do operador
 */
function getOperatorSymbol(operation) {
  const symbols = {
    'add': '+',
    'subtract': '-',
    'multiply': '×',
    'divide': '÷'
  };
  return symbols[operation] || operation;
}

/**
 * Obtém o nome do operador para acessibilidade
 * @param {string} operator - Símbolo do operador
 * @returns {string} Nome do operador
 */
function getOperatorName(operator) {
  const names = {
    '+': 'mais',
    '-': 'menos',
    '×': 'multiplicado por',
    '÷': 'dividido por',
    '=': 'igual',
    '>': 'maior que',
    '<': 'menor que'
  };
  return names[operator] || operator;
}