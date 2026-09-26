// js/services/user-profile.js
/**
 * Serviço centralizado de gestão do perfil de utilizador / jogador.
 * Sincroniza armazenamento e atualizações na interface de utilizador.
 */
import { safeGetItem, safeSetItem } from '../utils/storage.js';

export const USER_NAME_KEY = 'citaniaUserName';
export const LEGACY_USER_NAME_KEY = 'playerName';
export const DEFAULT_USER_NAME = 'Jogador';

/**
 * Obtém o nome atual do jogador, verificando chaves atuais e legadas.
 * @returns {string} Nome do jogador
 */
export function getPlayerName() {
  return safeGetItem(USER_NAME_KEY) || safeGetItem(LEGACY_USER_NAME_KEY) || DEFAULT_USER_NAME;
}

/**
 * Guarda o nome do jogador de forma sincronizada entre as diferentes chaves
 * e atualiza os elementos DOM correspondentes.
 * @param {string} name - Novo nome
 * @returns {string} Nome normalizado
 */
export function setPlayerName(name) {
  const trimmed = (name || '').trim();
  const finalName = trimmed.length > 0 ? trimmed : DEFAULT_USER_NAME;

  safeSetItem(USER_NAME_KEY, finalName);
  safeSetItem(LEGACY_USER_NAME_KEY, finalName);

  if (typeof document !== 'undefined') {
    const headerNameEl = document.getElementById('user-name');
    if (headerNameEl) {
      headerNameEl.textContent = finalName;
    }

    const playerInputEl = document.getElementById('player-name-input');
    if (playerInputEl && playerInputEl.value !== finalName) {
      playerInputEl.value = finalName;
    }
  }

  return finalName;
}

export default { getPlayerName, setPlayerName };
