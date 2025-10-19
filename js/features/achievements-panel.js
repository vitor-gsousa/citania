// js/features/achievements-panel.js

/**
 * Initializes the achievements panel functionality for desktop.
 */
export function initAchievementsPanel() {
  const achievementsButton = document.getElementById('achievements-button');
  const achievementsPanel = document.getElementById('achievements-panel');
  const mainElement = document.querySelector('main');

  if (!achievementsButton || !achievementsPanel) {
    return;
  }

  // Function to open the panel
  const openPanel = () => {
    achievementsPanel.classList.add('is-visible');
    achievementsButton.setAttribute('aria-expanded', 'true');
    // Add a class to the body to prevent scrolling and to dim the background
    document.body.classList.add('panel-open');
    if (mainElement) mainElement.setAttribute('aria-hidden', 'true');
  };

  // Function to close the panel
  const closePanel = () => {
    achievementsPanel.classList.remove('is-visible');
    achievementsButton.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('panel-open');
    
    const activeTab = document.querySelector('.tab-btn-active')?.dataset.tab || 'game';
    if (activeTab === 'game') {
        if (mainElement) mainElement.setAttribute('aria-hidden', 'false');
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

  // Prevent clicks inside the panel from closing it
  achievementsPanel.addEventListener('click', (e) => {
    e.stopPropagation();
  });


}
