// js/config/exercise-types.js

/**
 * Configuração central de todos os tipos de exercícios e áreas matemáticas
 * Dados extraídos do HTML para facilitar manutenção e extensibilidade
 */

// Definição das áreas matemáticas principais
export const THEME_AREAS = [
  {
    id: "aritmetica",
    icon: "calculate",
    text: "Aritmética",
    ariaLabel: "Aritmética"
  },
  {
    id: "geometria",
    icon: "architecture", 
    text: "Geometria",
    ariaLabel: "Geometria"
  },
  {
    id: "algebra",
    icon: "functions",
    text: "Álgebra", 
    ariaLabel: "Álgebra"
  },
  {
    id: "probabilidade",
    icon: "percent",
    text: "Probabilidade",
    ariaLabel: "Probabilidade"
  },
  {
    id: "estatistica",
    icon: "bar_chart",
    text: "Estatística",
    ariaLabel: "Estatística"
  },
  {
    id: "trigonometria",
    icon: "show_chart", 
    text: "Trigonometria",
    ariaLabel: "Trigonometria"
  }
];

// Definição detalhada dos exercícios por área
export const EXERCISE_TYPES = {
  aritmetica: {
    title: "Aritmética",
    exercises: [
      {
        type: "addSub",
        icon: "exposure",
        text: "Adição e Subtração",
        ariaLabel: "Adição e Subtração"
      },
      {
        type: "mulDiv",
        icon: "close",
        text: "Multiplicação e Divisão",
        ariaLabel: "Multiplicação e Divisão"
      },
      {
        type: "fractions", 
        icon: "pie_chart",
        text: "Operações com Frações",
        ariaLabel: "Operações com Frações"
      },
      {
        type: "fractionToDecimal", 
        icon: "percent",
        text: "Frações para Decimais",
        ariaLabel: "Frações para Decimais"
      },
      {
        type: "irreducibleFractions",
        icon: "done_all",
        text: "Frações Irredutíveis",
        ariaLabel: "Frações Irredutíveis"
      },
      {
        type: "primeFactorization",
        icon: "settings", 
        text: "Decomposição em Fatores Primos",
        ariaLabel: "Decomposição em Fatores Primos"
      },
      {
        type: "gcd",
        icon: "link",
        text: "Máximo Divisor Comum (MDC)",
        ariaLabel: "Máximo Divisor Comum"
      },
      {
        type: "lcm",
        icon: "timeline",
        text: "Mínimo Múltiplo Comum (MMC)", 
        ariaLabel: "Mínimo Múltiplo Comum (MMC)"
      },
      {
        type: "powerMultiplication",
        icon: "calculate",
        text: "Multiplicação de Potências",
        ariaLabel: "Multiplicação de Potências"
      },
      {
        type: "powerDivision",
        icon: "horizontal_split",
        text: "Divisão de Potências", 
        ariaLabel: "Divisão de Potências"
      }
    ]
  },
  geometria: {
    title: "Geometria",
    exercises: [
      {
        type: "areaPerimeter",
        icon: "crop_square",
        text: "Área e Perímetro",
        ariaLabel: "Subtema: Área e Perímetro"
      },
      {
        type: "triangles",
        icon: "change_history", 
        text: "Triângulos",
        ariaLabel: "Subtema: Triângulos"
      }
    ]
  },
  algebra: {
    title: "Álgebra",
    exercises: [
      {
        type: "equations",
        icon: "calculate",
        text: "Equações",
        ariaLabel: "Subtema: Equações"
      }
    ]
  },
  probabilidade: {
    title: "Probabilidade",
    exercises: [
      {
        type: "eventsSpaces",
        icon: "circle",
        text: "Eventos e Espaços",
        ariaLabel: "Subtema: Eventos e Espaços"
      }
    ]
  },
  estatistica: {
    title: "Estatística", 
    exercises: [
      {
        type: "averageMedian",
        icon: "bar_chart",
        text: "Médias e Medianas",
        ariaLabel: "Subtema: Médias e Medianas"
      }
    ]
  },
  trigonometria: {
    title: "Trigonometria",
    exercises: [
      {
        type: "trigFunctions",
        icon: "trending_up",
        text: "Funções Trigonométricas", 
        ariaLabel: "Subtema: Funções Trigonométricas"
      }
    ]
  }
};

/**
 * Obtém todas as áreas de exercícios disponíveis
 * @returns {Array} Array com todas as áreas matemáticas
 */
export function getAllThemeAreas() {
  return THEME_AREAS;
}

/**
 * Obtém os exercícios de uma área específica
 * @param {string} areaId - ID da área (ex: 'aritmetica')
 * @returns {Object|null} Objeto com título e exercícios da área
 */
export function getExercisesByArea(areaId) {
  return EXERCISE_TYPES[areaId] || null;
}

/**
 * Obtém informações de um exercício específico
 * @param {string} exerciseType - Tipo do exercício
 * @returns {Object|null} Dados do exercício ou null se não encontrado
 */
export function getExerciseInfo(exerciseType) {
  for (const area of Object.values(EXERCISE_TYPES)) {
    const exercise = area.exercises.find(ex => ex.type === exerciseType);
    if (exercise) {
      return exercise;
    }
  }
  return null;
}

/**
 * Verifica se um tipo de exercício existe
 * @param {string} exerciseType - Tipo do exercício
 * @returns {boolean} True se o exercício existir
 */
export function exerciseTypeExists(exerciseType) {
  return getExerciseInfo(exerciseType) !== null;
}