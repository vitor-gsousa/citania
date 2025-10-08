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
 * Configuração centralizada de dificuldade para adição/subtração.
 * Níveis mais granulares e progressivos.
 *
 * Nível 1: 1 dígito + 1 dígito (0-9)
 * Nível 2: 2 dígitos + 1 dígito (10-99 + 0-9)
 * Nível 3: 2 dígitos + 2 dígitos (10-99 + 10-99)
 * Nível 4: 2 dígitos + 2 dígitos (com transporte)
 * Nível 5: 3 dígitos + 2 dígitos (100-999 + 10-99)
 * Nível 6: 3 dígitos + 3 dígitos (100-999 + 100-999)
 * Nível 7: 3 dígitos + 3 dígitos (com transporte e negativos)
 * Nível 8+: 4 dígitos, mistura, negativos
 */
function getLevelCfg(level) {
  if (level <= 0) level = 1;
  if (level === 1) {
    return { aMin: 0, aMax: 9, bMin: 0, bMax: 9, allowNegative: false, carry: false, mixed: false };
  }
  if (level === 2) {
    return { aMin: 10, aMax: 99, bMin: 0, bMax: 9, allowNegative: false, carry: false, mixed: false };
  }
  if (level === 3) {
    return { aMin: 10, aMax: 99, bMin: 10, bMax: 99, allowNegative: false, carry: false, mixed: false };
  }
  if (level === 4) {
    return { aMin: 10, aMax: 99, bMin: 10, bMax: 99, allowNegative: false, carry: true, mixed: false };
  }
  if (level === 5) {
    return { aMin: 100, aMax: 999, bMin: 10, bMax: 99, allowNegative: false, carry: true, mixed: false };
  }
  if (level === 6) {
    return { aMin: 100, aMax: 999, bMin: 100, bMax: 999, allowNegative: false, carry: true, mixed: false };
  }
  if (level === 7) {
    return { aMin: 100, aMax: 999, bMin: 100, bMax: 999, allowNegative: true, carry: true, mixed: false };
  }
  // Níveis 8+ (mistura, negativos, operandos grandes)
  return { aMin: 1000, aMax: 9999, bMin: 100, bMax: 9999, allowNegative: true, carry: true, mixed: true };
}

/**
 * Gera um par de operandos de acordo com a configuração do nível.
 */
function generateOperands(cfg, op) {
  let a = getRandomInt(cfg.aMin, cfg.aMax);
  let b = getRandomInt(cfg.bMin, cfg.bMax);
  if (op === "+") {
    if (!cfg.carry) {
      // Evitar transporte: garantir que soma de unidades < 10
      const aUnits = a % 10;
      const bUnits = b % 10;
      if (aUnits + bUnits >= 10) {
        // Ajustar b para não provocar transporte
        b = b - ((aUnits + bUnits) - 9);
        if (b < cfg.bMin) b = cfg.bMin;
      }
    }
  } else {
    // Subtração
    if (!cfg.allowNegative && b > a) [a, b] = [b, a];
    if (cfg.allowNegative && Math.random() < 0.5) [a, b] = [b, a]; // introduz negativos
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
 * Gera exercício de adição/subtração com progressão harmonizada.
 * Pode gerar exercícios normais ou com termo em falta.
 * @param {number} level
 * @returns {{question: string, answer: number, explanation: string, checkType: string, isMissingTerm?: boolean}}
 */
export function generateAddSub(level = 1) {
  const cfg = getLevelCfg(level);
  // Escolher operação
  let op;
  if (cfg.mixed) {
    op = Math.random() < 0.5 ? "+" : "-";
  } else {
    // Introduzir subtração gradualmente a partir do nível 1
    const subChance = Math.min(0.5, level * 0.1); // 10% no nível 1, 20% no 2, até 50%
    op = Math.random() < subChance ? "-" : "+";
  }

  const [a, b] = generateOperands(cfg, op);
  const result = op === "+" ? a + b : a - b;

  // Decidir se é exercício com termo em falta (a partir do nível 1, chance crescente)
  const missingChance = Math.min(0.5, level * 0.1); // 10% no nível 1, 20% no 2, até 50%
  const isMissingTerm = Math.random() < missingChance;

  let question, answer, explanation;
  if (isMissingTerm) {
    // Escolher aleatoriamente qual termo ocultar: 0=a, 1=b, 2=result
    const missing = getRandomInt(0, 2);
    const inputHtml = `<input type="text" id="inline-missing-input" class="inline-missing-input" autocomplete="off" inputmode="numeric" aria-label="Campo de resposta" style="width: 3em; text-align: center; font-size: 1em;" />`;
    if (missing === 0) {
      // [input] op b = result
      question = `<span class="term-box">${inputHtml}</span> <span class="op op-${op === "+" ? "add" : "sub"}">${op}</span> <span class="term-box">${b}</span> <span class="equals">=</span> <span class="term-box">${result}</span>`;
      answer = a;
    } else if (missing === 1) {
      // a op [input] = result
      question = `<span class="term-box">${a}</span> <span class="op op-${op === "+" ? "add" : "sub"}">${op}</span> <span class="term-box">${inputHtml}</span> <span class="equals">=</span> <span class="term-box">${result}</span>`;
      answer = b;
    } else {
      // a op b = [input]
      question = `<span class="term-box">${a}</span> <span class="op op-${op === "+" ? "add" : "sub"}">${op}</span> <span class="term-box">${b}</span> <span class="equals">=</span> <span class="term-box">${inputHtml}</span>`;
      answer = result;
    }
    explanation = `Preenche o campo em falta para que a expressão fique correta.`;
  } else {
    // Exercício normal: sempre o resultado em falta
    const inputHtml = `<input type="text" id="inline-missing-input" class="inline-missing-input" autocomplete="off" inputmode="numeric" aria-label="Campo de resposta" style="width: 3em; text-align: center; font-size: 1em;" />`;
    question = `<span class="term-box">${a}</span> <span class="op op-${op === "+" ? "add" : "sub"}">${op}</span> <span class="term-box">${b}</span> <span class="equals">=</span> <span class="term-box">${inputHtml}</span>`;
    answer = result;
    explanation = buildExplanation(a, b, op, result);
  }

  return {
    question,
    answer,
    explanation,
    checkType: "number",
    isMissingTerm,
  };
}

export default { generateAddSub };
