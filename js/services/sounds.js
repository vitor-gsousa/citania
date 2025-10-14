// js/services/sounds.js
// Serviços de áudio para a aplicação
export const sounds = { correct: null, incorrect: null, levelup: null };

/**
 * Inicializa os objetos de áudio de forma robusta.
 * Tenta pré-carregar os ficheiros se existirem; cria fallbacks silenciosos caso contrário.
 */
export function initSounds() {
  try {
    const base = "./audio";
    const files = {
      correct: "correct.opus",
      incorrect: "incorrect.opus",
      levelup: "levelup.opus",
    };

    Object.keys(files).forEach((key) => {
      const path = `${base}/${files[key]}`;
      try {
        const a = new Audio(path);
        a.load();
        sounds[key] = a;
      } catch (e) {
        sounds[key] = { play: () => {}, load: () => {} };
      }
    });

    // Normalize: ensure each sound has a play method at least
    Object.keys(sounds).forEach((k) => {
      if (!sounds[k] || typeof sounds[k].play !== "function") {
        sounds[k] = { play: () => {}, load: () => {}, currentTime: 0 };
      } else if (typeof sounds[k].currentTime === "undefined") {
        // add safe currentTime property if missing
        try {
          sounds[k].currentTime = 0;
        } catch (e) {
          /* ignore */
        }
      }
    });

    console.log("initSounds: audio objects inicializados");
  } catch (e) {
    console.warn("initSounds falhou, audio desactivado", e);
    sounds.correct =
      sounds.incorrect =
      sounds.levelup =
        { play: () => {}, load: () => {}, currentTime: 0 };
  }
}

export default { sounds, initSounds };
