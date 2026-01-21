// js/features/achievements-panel.js

/**
 * Initializes the achievements panel functionality for desktop.
 */
export function initAchievementsPanel() {
  const achievementsButton = document.getElementById('achievements-button');
  const achievementsPanel = document.getElementById('achievements-panel');
  const mainElement = document.querySelector('main');
  const closeBtn = achievementsPanel?.querySelector('.close-panel-btn');

  // Create backdrop lazily to avoid extra DOM when not used
  let backdrop = document.getElementById('achievements-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'achievements-backdrop';
    backdrop.className = 'achievements-backdrop hidden';
    document.body.appendChild(backdrop);
  }

  let lastFocused = null;

  if (!achievementsButton || !achievementsPanel) {
    return;
  }

  // Function to open the panel
  const openPanel = () => {
    lastFocused = document.activeElement;
    achievementsPanel.classList.remove('hidden');
    achievementsPanel.classList.add('is-visible');
    achievementsPanel.setAttribute('aria-hidden', 'false');
    achievementsPanel.setAttribute('aria-modal', 'true');
    backdrop.classList.remove('hidden');
    backdrop.classList.add('is-visible');
    achievementsButton.setAttribute('aria-expanded', 'true');
    // Add a class to the body to prevent scrolling and to dim the background
    document.body.classList.add('panel-open');
    if (mainElement) mainElement.setAttribute('aria-hidden', 'true');

    // Move focus to close button for accessibility
    (closeBtn || achievementsPanel).focus({ preventScroll: true });
  };

  // Function to close the panel
  const closePanel = () => {
    achievementsPanel.classList.remove('is-visible');
    achievementsPanel.classList.add('hidden');
    achievementsPanel.setAttribute('aria-hidden', 'true');
    achievementsPanel.removeAttribute('aria-modal');
    backdrop.classList.remove('is-visible');
    backdrop.classList.add('hidden');
    achievementsButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('panel-open');
    
    const activeTab = document.querySelector('.tab-btn-active')?.dataset.tab || 'game';
    if (activeTab === 'game') {
        if (mainElement) mainElement.setAttribute('aria-hidden', 'false');
    }

    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus({ preventScroll: true });
    } else {
      achievementsButton.focus({ preventScroll: true });
    }
  };

  // Event listener for the header button
  achievementsButton.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent the click from closing the panel immediately
    if (achievementsPanel.classList.contains('is-visible')) {
      closePanel();
    } else {
      openPanel();
    }
  });

  // Close button inside panel
  closeBtn?.addEventListener('click', closePanel);

  // Close the panel if clicking outside of it
  document.addEventListener('click', (e) => {
    if (
      achievementsPanel.classList.contains('is-visible') &&
      !achievementsPanel.contains(e.target) &&
      e.target !== achievementsButton
    ) {
      closePanel();
    }
  });

  // Backdrop click closes panel
  backdrop.addEventListener('click', closePanel);

  // Prevent clicks inside the panel from closing it
  achievementsPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  // ESC key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && achievementsPanel.classList.contains('is-visible')) {
      closePanel();
    }
  });


}
