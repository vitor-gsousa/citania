// js/examples/fraction-examples.js

/**
 * Exemplos práticos de como usar o novo sistema de frações
 * Este ficheiro demonstra como implementar e usar os exercícios de frações
 */

import { generateFractions, checkFractionAnswer } from '../modules/arithmetic/fractions.js';
import { createFractionVisual, createFractionOperation, createEquivalentFractions } from '../utils/fraction-visual.js';

/**
 * Demonstração completa do sistema de frações
 * Execute no console do browser: demonstracaoFracoes()
 */
export function demonstracaoFracoes() {
  console.log('🔢 === DEMONSTRAÇÃO DO SISTEMA DE FRAÇÕES ===');
  
  // 1. Gerar diferentes tipos de exercícios
  console.log('\n📚 1. GERAÇÃO DE EXERCÍCIOS:');
  
  for (let nivel = 1; nivel <= 5; nivel++) {
    const exercicio = generateFractions(nivel);
    console.log(`\nNível ${nivel}:`);
    console.log(`- Pergunta: ${exercicio.question}`);
    console.log(`- Resposta: ${exercicio.answer}`);
    console.log(`- Explicação: ${exercicio.explanation}`);
    console.log(`- Tipo de verificação: ${exercicio.checkType}`);
    console.log(`- Dados visuais:`, exercicio.visualData);
  }
  
  // 2. Testar verificação de respostas
  console.log('\n✅ 2. VERIFICAÇÃO DE RESPOSTAS:');
  
  const testCases = [
    { user: '1/2', correct: '2/4', type: 'fraction' },
    { user: '3/6', correct: '1/2', type: 'fraction' },
    { user: '>', correct: '>', type: 'exact' },
    { user: '4', correct: '4', type: 'exact' }
  ];
  
  testCases.forEach((test, i) => {
    const isCorrect = checkFractionAnswer(test.user, test.correct, test.type);
    console.log(`Teste ${i + 1}: ${test.user} vs ${test.correct} (${test.type}) = ${isCorrect ? '✅' : '❌'}`);
  });
  
  // 3. Demonstrar representação visual
  console.log('\n🎨 3. REPRESENTAÇÃO VISUAL:');
  demonstrarVisualizacao();
}

/**
 * Cria exemplos visuais no DOM para demonstração
 */
function demonstrarVisualizacao() {
  // Encontrar ou criar container de demonstração
  let container = document.getElementById('demo-fracoes');
  if (!container) {
    container = document.createElement('div');
    container.id = 'demo-fracoes';
    container.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      width: 300px;
      max-height: 80vh;
      overflow-y: auto;
      background: var(--main-bg-color);
      border: 2px solid var(--primary-color);
      border-radius: 10px;
      padding: 1rem;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    document.body.appendChild(container);
  }
  
  container.innerHTML = `
    <h3 style="margin: 0 0 1rem 0; color: var(--primary-color);">
      🔢 Demonstração Frações
    </h3>
    <button onclick="this.parentElement.remove()" style="
      position: absolute;
      top: 5px;
      right: 10px;
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      color: var(--text-color);
    ">×</button>
  `;
  
  // Exemplo 1: Fração simples
  console.log('📐 Criando fração simples: 3/4');
  const fracao1 = createFractionVisual({ num: 3, den: 4 }, 'both');
  fracao1.style.marginBottom = '1rem';
  container.appendChild(fracao1);
  
  // Exemplo 2: Operação entre frações
  console.log('➕ Criando operação: 1/2 + 1/3 = 5/6');
  const operacao = createFractionOperation(
    { num: 1, den: 2 },
    { num: 1, den: 3 },
    '+',
    { num: 5, den: 6 }
  );
  operacao.style.marginBottom = '1rem';
  container.appendChild(operacao);
  
  // Exemplo 3: Frações equivalentes
  console.log('🔄 Criando equivalência: 2/4 = 1/2');
  const equivalente = createEquivalentFractions(
    { num: 2, den: 4 },
    { num: 1, den: 2 }
  );
  equivalente.style.marginBottom = '1rem';
  container.appendChild(equivalente);
  
  console.log('✨ Demonstração visual criada no canto superior direito da página!');
}

/**
 * Testa diferentes cenários de exercícios
 */
export function testarCenarios() {
  console.log('🧪 === TESTE DE CENÁRIOS ===');
  
  const scenarios = [
    { nome: 'Iniciante (nível 1)', nivel: 1, tentativas: 3 },
    { nome: 'Intermédio (nível 4)', nivel: 4, tentativas: 3 },
    { nome: 'Avançado (nível 8)', nivel: 8, tentativas: 3 }
  ];
  
  scenarios.forEach(scenario => {
    console.log(`\n${scenario.nome}:`);
    
    for (let i = 0; i < scenario.tentativas; i++) {
      const exercicio = generateFractions(scenario.nivel);
      console.log(`  ${i + 1}. ${exercicio.question}`);
      console.log(`     Resposta: ${exercicio.answer}`);
      console.log(`     Tipo: ${exercicio.visualData?.type || 'padrão'}`);
    }
  });
}

/**
 * Análise estatística dos tipos de exercícios gerados
 */
export function analiseTipos() {
  console.log('📊 === ANÁLISE DE TIPOS DE EXERCÍCIOS ===');
  
  const stats = {};
  const niveis = [1, 3, 5, 7, 9];
  
  niveis.forEach(nivel => {
    console.log(`\nNível ${nivel}:`);
    stats[nivel] = {};
    
    // Gerar 20 exercícios para análise
    for (let i = 0; i < 20; i++) {
      const exercicio = generateFractions(nivel);
      const tipo = exercicio.visualData?.type || 'desconhecido';
      
      stats[nivel][tipo] = (stats[nivel][tipo] || 0) + 1;
    }
    
    // Mostrar distribuição
    Object.entries(stats[nivel]).forEach(([tipo, count]) => {
      const percentage = ((count / 20) * 100).toFixed(1);
      console.log(`  ${tipo}: ${count}/20 (${percentage}%)`);
    });
  });
  
  return stats;
}

/**
 * Demonstração interativa - permite testar respostas
 */
export function modoInterativo() {
  console.log('🎮 === MODO INTERATIVO ===');
  console.log('Execute: testarResposta("sua_resposta") para verificar');
  
  // Gerar exercício aleatório
  const nivel = Math.floor(Math.random() * 5) + 1;
  const exercicio = generateFractions(nivel);
  
  console.log(`\n📝 Exercício (Nível ${nivel}):`);
  console.log(`${exercicio.question}`);
  
  // Criar função global temporária para testar
  window.testarResposta = function(resposta) {
    const isCorrect = checkFractionAnswer(resposta, exercicio.answer, exercicio.checkType);
    
    if (isCorrect) {
      console.log('✅ Correto! Parabéns!');
      console.log(`Explicação: ${exercicio.explanation}`);
    } else {
      console.log('❌ Incorreto. Tenta novamente!');
      console.log(`💡 Dica: A resposta correta é ${exercicio.answer}`);
      console.log(`Explicação: ${exercicio.explanation}`);
    }
    
    // Gerar novo exercício
    setTimeout(() => {
      console.log('\n🔄 Novo exercício:');
      modoInterativo();
    }, 2000);
  };
}

// Exportar função principal para uso no console
if (typeof window !== 'undefined') {
  window.demonstracaoFracoes = demonstracaoFracoes;
  window.testarCenarios = testarCenarios;
  window.analiseTipos = analiseTipos;
  window.modoInterativo = modoInterativo;
  
  console.log('🚀 Funções disponíveis no console:');
  console.log('- demonstracaoFracoes()');
  console.log('- testarCenarios()');
  console.log('- analiseTipos()');
  console.log('- modoInterativo()');
}