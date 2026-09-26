// js/services/sw-manager.js
/**
 * Gestor do ciclo de vida e atualizações do Service Worker
 */

let swCheckIntervalId = null;

/**
 * Verifica se a API Service Worker é suportada no ambiente atual
 * @returns {boolean}
 */
export function isServiceWorkerSupported() {
  return typeof navigator !== "undefined" && "serviceWorker" in navigator;
}

/**
 * Mostra uma notificação no ecrã para o utilizador atualizar a aplicação quando há nova versão
 * @param {ServiceWorkerRegistration} [registration]
 * @returns {HTMLElement|null}
 */
export function promptUserToRefresh(registration = null) {
  if (typeof document === "undefined") return null;

  try {
    let container = document.getElementById("sw-update-notice");
    if (!container) {
      container = document.createElement("div");
      container.id = "sw-update-notice";
      container.className = "sw-update-notice";

      const text = document.createElement("span");
      text.className = "sw-text";
      text.textContent = "Nova versão disponível";
      container.appendChild(text);

      const actions = document.createElement("div");
      actions.className = "sw-actions";

      const btn = document.createElement("button");
      btn.className = "btn primary btn--small";
      btn.textContent = "Atualizar";
      btn.addEventListener("click", () => {
        if (!registration || !registration.waiting) return;
        registration.waiting.postMessage("skip-waiting");
      });

      const dismiss = document.createElement("button");
      dismiss.className = "btn dismiss btn--small";
      dismiss.textContent = "Depois";
      dismiss.addEventListener("click", () => {
        try {
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
          }
        } catch {
          // Falha ao remover container - não é crítico
        }
      });

      actions.appendChild(btn);
      actions.appendChild(dismiss);
      container.appendChild(actions);
      document.body.appendChild(container);

      if (isServiceWorkerSupported()) {
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (container && container.parentNode) {
            container.parentNode.removeChild(container);
            if (typeof window !== "undefined" && window.location) {
              window.location.reload();
            }
          }
        });
      }
    }
    return container;
  } catch (e) {
    console.error("Erro ao mostrar prompt de atualização", e);
    return null;
  }
}

/**
 * Verifica se há atualizações pendentes ou disponíveis do Service Worker
 * @param {Function} [onPrompt=promptUserToRefresh]
 * @returns {Promise<void>}
 */
export async function checkForSWUpdate(onPrompt = promptUserToRefresh) {
  if (!isServiceWorkerSupported()) return;

  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (!reg) return;

    if (reg.waiting) {
      onPrompt(reg);
      return;
    }

    await reg.update().catch(() => {
      // Erro ao atualizar SW - não é crítico
    });
  } catch {
    // Erro ao verificar registro do SW - não é crítico
  }
}

/**
 * Para o intervalo periódico de verificação de atualizações
 */
export function stopSWUpdateInterval() {
  if (swCheckIntervalId) {
    clearInterval(swCheckIntervalId);
    swCheckIntervalId = null;
  }
}

/**
 * Inicializa e regista o Service Worker com escutas de atualização periódica
 * @param {Object} [options]
 * @param {string} [options.swUrl='/sw.js']
 * @param {string} [options.scope='/']
 * @param {number} [options.checkIntervalMs=1800000] 30 minutos por omissão
 * @param {Function} [options.onPrompt=promptUserToRefresh]
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export function initServiceWorker({
  swUrl = "/sw.js",
  scope = "/",
  checkIntervalMs = 30 * 60 * 1000,
  onPrompt = promptUserToRefresh,
} = {}) {
  if (!isServiceWorkerSupported()) return null;

  const register = () => {
    return navigator.serviceWorker
      .register(swUrl, { scope })
      .then((reg) => {
        console.log("Service Worker registado:", reg.scope);

        if (reg.waiting) {
          onPrompt(reg);
        }

        try {
          reg.update().catch(() => {
            // Erro ao atualizar SW - não é crítico
          });
        } catch {
          // Erro inesperado - não é crítico
        }

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              onPrompt(reg);
            }
          });
        });

        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data) {
            console.log("Mensagem do SW:", event.data);
          }
        });

        return reg;
      })
      .catch((err) => {
        console.log("Falha ao registar o Service Worker:", err);
        return null;
      });
  };

  let registrationPromise;
  if (typeof window !== "undefined") {
    if (document.readyState === "complete") {
      registrationPromise = register();
    } else {
      registrationPromise = new Promise((resolve) => {
        window.addEventListener("load", () => resolve(register()));
      });
    }

    // Escuta quando a página fica visível ou ganha foco
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") checkForSWUpdate(onPrompt);
      });
    }

    window.addEventListener("focus", () => checkForSWUpdate(onPrompt));

    // Verificação periódica
    if (!swCheckIntervalId && checkIntervalMs > 0) {
      swCheckIntervalId = setInterval(() => checkForSWUpdate(onPrompt), checkIntervalMs);
    }

    // Verificação inicial
    checkForSWUpdate(onPrompt);
  }

  return registrationPromise;
}
