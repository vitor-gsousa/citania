// js/modules/arithmetic/progression.js
// Estratégia de Progressão para Adição e Subtração
// Objetivos pedagógicos:
// 1. Progressão gradual (números pequenos -> transporte -> misto)
// 2. Feedback instantâneo com explicação textual simples
// 3. Gamificação: pontuação incremental e medalhas (integra com sistema existente)
// 4. Variação controlada: evitar padrões repetitivos e incluir mistura tardia
// 5. Suporte a dificuldades crescentes por "nível" (level vindo do estado global)

import { getRandomInt } from "../../modules/utils/rand.js";

/**
 * Definição de faixas por nível.
 * Cada nível devolve limites para operandos e se inclui transporte ou mistura.
 */
const LEVELS = [
  // level 1
  { max: 5, allowNegative: false, carry: false, mixed: false },
  // level 2
  { max: 10, allowNegative: false, carry: false, mixed: false },
  // level 3
  { max: 20, allowNegative: false, carry: true, mixed: false },
  // level 4
  { max: 50, allowNegative: false, carry: true, mixed: true },
  // level 5
  { max: 100, allowNegative: true, carry: true, mixed: true },
];

function getLevelCfg(level) {
  if (level <= 0) level = 1;
  if (level > LEVELS.length) level = LEVELS.length; // cap no último
  return LEVELS[level - 1];
}

/**
 * Gera um par de operandos garantindo as restrições do nível.
 */
function generateOperands(cfg, op) {
  let a, b;
  if (op === "+") {
    a = getRandomInt(0, cfg.max);
    b = getRandomInt(0, cfg.max);
    if (!cfg.carry && a + b >= 10 && cfg.max >= 10) {
      // evitar transporte: força soma < 10 quando nível não autoriza (apenas nos primeiros níveis <20)
      const limit = Math.min(9, cfg.max);
      a = getRandomInt(0, limit);
      b = getRandomInt(0, limit - a);
    }
  } else {
    // subtração
    a = getRandomInt(0, cfg.max);
    b = getRandomInt(0, cfg.max);
    if (!cfg.allowNegative && b > a) [a, b] = [b, a];
  }
  return [a, b];
}

/**
 * Cria explicação em linguagem natural simples.
 */
function buildExplanation(a, b, op, result) {
  if (op === "+") {
    return `${a} + ${b} = ${result}. Somamos ${a} e ${b} juntando as unidades.`;
  }
  return `${a} - ${b} = ${result}. Tiramos ${b} a partir de ${a}.`;
}

/**
 * Gera exercício de adição/subtração com progressão.
 * @param {number} level
 * @returns {{question: string, answer: number, explanation: string, checkType: string}}
 */
export function generateAddSub(level = 1) {
  const cfg = getLevelCfg(level);
  // escolher operação
  let op;
  if (cfg.mixed) {
    op = Math.random() < 0.5 ? "+" : "-";
  } else {
    // primeiros níveis: só adição até introduzir subtração
    op = level >= 2 ? (Math.random() < 0.25 ? "-" : "+") : "+";
  }

  const [a, b] = generateOperands(cfg, op);
  const answer = op === "+" ? a + b : a - b;
  const explanation = buildExplanation(a, b, op, answer);

  const question = `Resolve: <span class="op op-${op === "+" ? "add" : "sub"}">${a} ${op} ${b}</span>`;

  return {
    question,
    answer,
    explanation,
    checkType: "number",
  };
}

export default { generateAddSub };
