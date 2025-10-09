// js/features/pwa-install.js
/**
 * Módulo responsável por gerir a instalação da PWA
 * Implementa o prompt de instalação personalizado
 */

let deferredPrompt = null;
let installButton = null;

/**
 * Inicializa a funcionalidade de instalação da PWA
 */
export function initPWAInstall() {
  // Criar botão de instalação (será mostrado quando apropriado)
  createInstallButton();
  
  // Event listener para beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💡 Evento beforeinstallprompt disparado');
    
    // Prevenir que o browser mostre o prompt automático
    e.preventDefault();
    
    // Guardar o evento para usar mais tarde
    deferredPrompt = e;
    
    // Mostrar o botão de instalação personalizado
    showInstallButton();
  });

  // Event listener para quando a app é instalada
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA foi instalada com sucesso');
    
    // Esconder o botão de instalação
    hideInstallButton();
    
    // Limpar a referência ao prompt
    deferredPrompt = null;
    
    // Mostrar feedback ao utilizador
    showInstallFeedback();
  });

  // Verificar se a app já está em modo standalone (instalada)
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    console.log('📱 App está a correr em modo standalone');
    hideInstallButton();
  }
}

/**
 * Cria o botão de instalação da PWA
 */
function createInstallButton() {
  // Verificar se o botão já existe
  if (document.getElementById('pwa-install-button')) {
    installButton = document.getElementById('pwa-install-button');
    return;
  }

  // Criar botão de instalação
  installButton = document.createElement('button');
  installButton.id = 'pwa-install-button';
  installButton.className = 'pwa-install-btn hidden';
  installButton.innerHTML = `
    <span class="material-symbols-outlined">install_mobile</span>
    <span>Instalar App</span>
  `;
  installButton.title = 'Instalar Citânia como aplicação';
  installButton.setAttribute('aria-label', 'Instalar aplicação');
  
  // Event listener para o clique no botão
  installButton.addEventListener('click', handleInstallClick);
  
  // Adicionar o botão ao header (ao lado do botão de tema)
  const header = document.querySelector('.header-inner');
  if (header) {
    // Inserir antes do botão de tema
    const themeButton = document.getElementById('theme-toggle');
    if (themeButton) {
      header.insertBefore(installButton, themeButton);
    } else {
      header.appendChild(installButton);
    }
  }
}

/**
 * Gere o clique no botão de instalação
 */
async function handleInstallClick() {
  if (!deferredPrompt) {
    console.warn('⚠️ Não há prompt de instalação disponível');
    return;
  }

  // Mostrar o prompt de instalação
  deferredPrompt.prompt();
  
  // Aguardar a escolha do utilizador
  const { outcome } = await deferredPrompt.userChoice;
  
  console.log(`👤 Utilizador ${outcome === 'accepted' ? 'aceitou' : 'rejeitou'} a instalação`);
  
  if (outcome === 'accepted') {
    console.log('✅ Utilizador aceitou instalar a PWA');
  } else {
    console.log('❌ Utilizador rejeitou a instalação');
  }
  
  // Limpar a referência ao prompt
  deferredPrompt = null;
  
  // Esconder o botão temporariamente
  hideInstallButton();
}

/**
 * Mostra o botão de instalação
 */
function showInstallButton() {
  if (installButton) {
    installButton.classList.remove('hidden');
    console.log('👁️ Botão de instalação PWA visível');
  }
}

/**
 * Esconde o botão de instalação
 */
function hideInstallButton() {
  if (installButton) {
    installButton.classList.add('hidden');
    console.log('🙈 Botão de instalação PWA escondido');
  }
}

/**
 * Mostra feedback quando a app é instalada
 */
function showInstallFeedback() {
  // Criar notificação de instalação bem-sucedida
  const notification = document.createElement('div');
  notification.className = 'install-success-notification';
  notification.innerHTML = `
    <div class="notification-content">
      <span class="material-symbols-outlined">check_circle</span>
      <span>Citânia instalada com sucesso!</span>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Remover a notificação após 3 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 3000);
}

/**
 * Verifica se a PWA pode ser instalada
 * @returns {boolean} True se a instalação for possível
 */
export function canInstallPWA() {
  return deferredPrompt !== null;
}

/**
 * Força a exibição do prompt de instalação (se disponível)
 */
export function triggerInstallPrompt() {
  if (installButton && !installButton.classList.contains('hidden')) {
    handleInstallClick();
  }
}