// js/progress.js
/*
 * Este módulo lida com a persistência do progresso do utilizador,
 * como níveis por tipo de exercício e pontuações mais altas.
 */
import { safeGetItem, safeSetItem } from "./utils/storage.js";

const PROGRESS_KEY = "citania_progress_v1";
const HIGH_SCORES_KEY = "matematicaDivertidaHighScores";

/**
 * Guarda o nível atual para um tipo de exercício.
 * @param {string} exerciseType - O tipo de exercício (e.g., 'addSub').
 * @param {number} level - O nível a ser guardado.
 */
export function saveProgressForType(exerciseType, level) {
  if (!exerciseType) return;
  const raw = safeGetItem(PROGRESS_KEY) || "{}";
  let map;
  try {
    map = JSON.parse(raw);
  } catch {
    map = {};
  }
  map[exerciseType] = Number(level) || 1;
  safeSetItem(PROGRESS_KEY, JSON.stringify(map));
}

/**
 * Carrega o nível guardado para um tipo de exercício.
 * @param {string} exerciseType - O tipo de exercício.
 * @returns {number} - O nível guardado, ou 1 como padrão.
 */
export function loadProgressForType(exerciseType) {
  if (!exerciseType) return 1;
  const raw = safeGetItem(PROGRESS_KEY);
  if (!raw) return 1;
  try {
    const map = JSON.parse(raw);
    const lvl = Number(map[exerciseType]);
    return Number.isFinite(lvl) && lvl > 0 ? lvl : 1;
  } catch {
    return 1;
  }
}

/**
 * Migra o progresso de uma chave de armazenamento antiga para a nova.
 */
export function migrateOldProgress() {
  const old = safeGetItem("citania_progress"); // Chave antiga de exemplo
  if (old && !safeGetItem(PROGRESS_KEY)) {
    safeSetItem(PROGRESS_KEY, old);
    console.log("Progresso antigo migrado com sucesso.");
  }
}