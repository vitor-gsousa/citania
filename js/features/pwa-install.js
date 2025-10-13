// js/features/pwa-install.js
/**
 * Módulo responsável por gerir a instalação da PWA
 * Agora usa o prompt nativo do navegador
 */

let deferredPrompt = null;

/**
 * Inicializa a funcionalidade de instalação da PWA
 * Permite que o navegador mostre o prompt nativo
 */
export function initPWAInstall() {
  // Event listener para beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    console.log('💡 Evento beforeinstallprompt disparado - navegador irá mostrar prompt nativo');
    
    // Não prevenir o prompt nativo - deixar o navegador lidar com isso
    // e.preventDefault(); // Removido para permitir prompt nativo
    
    // Opcional: guardar o evento se quiser controlar manualmente depois
    deferredPrompt = e;
  });

  // Event listener para quando a app é instalada
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA foi instalada com sucesso via prompt nativo');
    
    // Limpar a referência ao prompt
    deferredPrompt = null;
  });

  // Verificar se a app já está em modo standalone (instalada)
  if (window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true) {
    console.log('📱 App está a correr em modo standalone');
  }
}