// js/examples/template-examples.js

/**
 * Exemplos de uso dos templates JavaScript para cards de exercícios
 * Demonstra como adicionar novos exercícios e áreas dinamicamente
 */

import { THEME_AREAS, EXERCISE_TYPES, getExercisesByArea } from '../config/exercise-types.js';
import { createExerciseCard, createThemeAreaCard } from '../templates/exercise-card.js';
import { createThemeSection } from '../templates/theme-section.js';
import { addNewArea, updateAreaExercises } from '../templates/template-manager.js';

/**
 * Exemplo 1: Criar um novo card de exercício
 */
export function exemploNovoCard() {
  const novoExercicio = {
    type: "exemploNovo",
    icon: "lightbulb",
    text: "Exemplo Novo Exercício",
    ariaLabel: "Exemplo de novo exercício"
  };
  
  const cardHtml = createExerciseCard(novoExercicio);
  console.log('HTML do novo card:', cardHtml);
  
  return cardHtml;
}

/**
 * Exemplo 2: Adicionar nova área matemática completa
 */
export function exemploNovaArea() {
  const novaArea = {
    id: "calculo",
    icon: "trending_up",
    text: "Cálculo",
    ariaLabel: "Cálculo"
  };
  
  const exerciciosCalculo = {
    title: "Cálculo",
    exercises: [
      {
        type: "derivatives",
        icon: "timeline",
        text: "Derivadas",
        ariaLabel: "Cálculo de derivadas"
      },
      {
        type: "integrals",
        icon: "insights",
        text: "Integrais",
        ariaLabel: "Cálculo de integrais"
      },
      {
        type: "limits",
        icon: "trending_flat",
        text: "Limites",
        ariaLabel: "Cálculo de limites"
      }
    ]
  };
  
  // Adicionar à aplicação
  addNewArea(novaArea, exerciciosCalculo);
  
  console.log('Nova área "Cálculo" adicionada com sucesso!');
}

/**
 * Exemplo 3: Adicionar exercício a uma área existente
 */
export function exemploAdicionarExercicio() {
  const novoExercicioAritmetica = {
    type: "complexNumbers",
    icon: "scatter_plot",
    text: "Números Complexos",
    ariaLabel: "Operações com números complexos"
  };
  
  // Obter exercícios atuais da aritmética
  const aritmeticaAtual = getExercisesByArea('aritmetica');
  const exerciciosAtualizados = [...aritmeticaAtual.exercises, novoExercicioAritmetica];
  
  // Atualizar a área
  updateAreaExercises('aritmetica', exerciciosAtualizados);
  
  console.log('Novo exercício adicionado à Aritmética!');
}

/**
 * Exemplo 4: Criar uma secção de exercícios personalizada
 */
export function exemploSecaoPersonalizada() {
  const exerciciosPersonalizados = [
    {
      type: "puzzle1",
      icon: "extension",
      text: "Puzzle Matemático 1",
      ariaLabel: "Primeiro puzzle matemático"
    },
    {
      type: "puzzle2", 
      icon: "psychology",
      text: "Puzzle Matemático 2",
      ariaLabel: "Segundo puzzle matemático"
    }
  ];
  
  const secaoHtml = createThemeSection('puzzles', {
    title: 'Puzzles Matemáticos',
    exercises: exerciciosPersonalizados
  });
  
  console.log('Secção personalizada criada:', secaoHtml);
  
  return secaoHtml;
}

/**
 * Exemplo 5: Mostrar estrutura atual dos dados
 */
export function mostrarEstrutura() {
  console.log('=== ESTRUTURA ATUAL ===');
  console.log('Áreas disponíveis:', THEME_AREAS.map(area => area.text));
  
  for (const [areaId, areaData] of Object.entries(EXERCISE_TYPES)) {
    console.log(`\n${areaData.title}:`);
    areaData.exercises.forEach(ex => {
      console.log(`  - ${ex.text} (${ex.type})`);
    });
  }
}

/**
 * Demonstração completa
 */
export function demonstracaoCompleta() {
  console.log('=== DEMONSTRAÇÃO DOS TEMPLATES ===');
  
  // Mostrar estrutura atual
  mostrarEstrutura();
  
  // Criar novo card
  console.log('\n1. Criando novo card...');
  exemploNovoCard();
  
  // Criar secção personalizada
  console.log('\n2. Criando secção personalizada...');
  exemploSecaoPersonalizada();
  
  // As próximas operações modificam o DOM, então só executar se solicitado
  console.log('\n3. Para adicionar nova área ou exercício, chame:');
  console.log('   - exemploNovaArea()');
  console.log('   - exemploAdicionarExercicio()');
}

// Auto-executar demonstração se este módulo for carregado diretamente
if (import.meta.url === window.location.href) {
  demonstracaoCompleta();
}