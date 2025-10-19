// js/tab-navigation.js
// Módulo de navegação entre abas do footer em mobile

const TAB_CONFIG = {
  game: {
    panel: 'menu-container',
    label: 'Jogo',
  },
  player: {
    panel: 'player-panel',
    label: 'Jogador',
  },
  achievements: {
    panel: 'achievements-panel',
    label: 'Conquistas',
  },
  settings: {
    panel: 'settings-panel',
    label: 'Configurações',
  },
};

/**
 * Inicializa a navegação de abas
 */
export function initTabNavigation() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  // Adiciona event listeners a cada botão de aba
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tabName = button.dataset.tab;
      switchToTab(tabName);
    });
  });

  // Inicializa com a aba "game" ativa
  switchToTab('game');
}

/**
 * Muda para uma aba específica
 * @param {string} tabName - Nome da aba (game, player, achievements, settings)
 */
function switchToTab(tabName) {
  // Validar nome da aba
  if (!TAB_CONFIG[tabName]) {
    console.warn(`Aba desconhecida: ${tabName}`);
    return;
  }

  // Atualizar botões de aba
  updateTabButtons(tabName);

  // Atualizar painéis visíveis
  updatePanels(tabName);

  // Executar lógica específica da aba se necessário
  executeTabLogic(tabName);
}

/**
 * Atualiza o estado dos botões de aba
 * @param {string} activeTab - Nome da aba ativa
 */
function updateTabButtons(activeTab) {
  const tabButtons = document.querySelectorAll('.tab-btn');
  
  tabButtons.forEach(button => {
    const tabName = button.dataset.tab;
    const isActive = tabName === activeTab;
    
    // Atualizar classe ativa
    if (isActive) {
      button.classList.add('tab-btn-active');
      button.setAttribute('aria-selected', 'true');
    } else {
      button.classList.remove('tab-btn-active');
      button.setAttribute('aria-selected', 'false');
    }
  });
}

/**
 * Atualiza a visibilidade dos painéis
 * @param {string} activeTab - Nome da aba ativa
 */
function updatePanels(activeTab) {
  // Obter IDs de todos os painéis
  const panelIds = Object.values(TAB_CONFIG).map(config => config.panel);
  
  // Controlar visibilidade do main (só visível quando aba "game" ativa)
  const mainElement = document.querySelector('main');
  if (mainElement) {
    if (activeTab === 'game') {
      mainElement.classList.remove('hidden');
      mainElement.setAttribute('aria-hidden', 'false');
    } else {
      mainElement.classList.add('hidden');
      mainElement.setAttribute('aria-hidden', 'true');
    }
  }
  
  panelIds.forEach(panelId => {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    const shouldShow = TAB_CONFIG[activeTab].panel === panelId;
    
    if (shouldShow) {
      panel.classList.remove('hidden');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      panel.classList.add('hidden');
      panel.setAttribute('aria-hidden', 'true');
    }
  });
}

/**
 * Executa lógica específica de cada aba (loading de dados, etc)
 * @param {string} tabName - Nome da aba
 */
function executeTabLogic(tabName) {
  switch (tabName) {
    case 'player':
      loadPlayerData();
      break;
    case 'achievements':
      loadAchievementsData();
      break;
    case 'settings':
      initializeSettings();
      break;
    case 'game':
      // Nenhuma lógica especial necessária
      break;
  }
}

/**
 * Carrega dados do jogador no painel
 */
function loadPlayerData() {
  const playerNameInput = document.getElementById('player-name-input');
  const saveButton = document.getElementById('save-player-name');

  // Obter dados do localStorage
  const playerName = localStorage.getItem('playerName') || 'Jogador';

  // Atualizar valores na UI
  if (playerNameInput) {
    playerNameInput.value = playerName;
  }

  // Configurar listener para guardar nome
  if (saveButton && playerNameInput) {
    saveButton.onclick = () => {
      const newName = playerNameInput.value.trim();
      if (newName.length > 0) {
        localStorage.setItem('playerName', newName);
        
        // Atualizar nome no header também
        const userNameEl = document.getElementById('user-name');
        if (userNameEl) {
          userNameEl.textContent = newName;
        }
        
        // Feedback visual
        saveButton.textContent = '✓ Guardado';
        setTimeout(() => {
          saveButton.textContent = 'Guardar';
        }, 2000);
      }
    };

    // Permitir guardar com Enter
    playerNameInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        saveButton.click();
      }
    });
  }
}

/**
 * Renderiza badges/medalhas no container
 * @param {HTMLElement} container - Elemento #achievements-container
 */
function renderAchievementsBadges(container) {
  if (!container) return;

  // Obter medalhas do localStorage (gamification)
  const gamificationData = localStorage.getItem('citaniaGamification');
  let medalhas = [];
  
  try {
    if (gamificationData) {
      const data = JSON.parse(gamificationData);
      medalhas = data.medalhas || [];
    }
  } catch (e) {
    console.warn('Erro ao carregar medalhas:', e);
  }

  // Se não há medalhas, mostrar mensagem
  if (medalhas.length === 0) {
    container.innerHTML = `
      <div class="no-achievements">
        <div class="emoji">🚀</div>
        <div class="message">Comece a jogar para conquistar medalhas!</div>
      </div>
    `;
    return;
  }

  // Renderizar badges
  const badgesHtml = medalhas
    .map(badge => `
      <div class="ach-badge" title="${badge.label}">
        <div class="emoji">${badge.emoji}</div>
        <div class="label">${badge.label}</div>
      </div>
    `)
    .join('');

  container.innerHTML = badgesHtml;
}

/**
 * Carrega dados de conquistas (stats + badges) no painel
 */
function loadAchievementsData() {
  const playerTotalPoints = document.getElementById('player-total-points');
  const playerLevel = document.getElementById('player-level');
  const achievementsContainer = document.getElementById('achievements-container');
  
  // Obter dados do localStorage
  const playerPoints = localStorage.getItem('playerPoints') || '0';
  const playerLevelValue = localStorage.getItem('playerLevel') || '1';

  // Atualizar stats
  if (playerTotalPoints) {
    playerTotalPoints.textContent = playerPoints;
  }
  if (playerLevel) {
    playerLevel.textContent = playerLevelValue;
  }

  // Renderizar badges
  if (achievementsContainer) {
    renderAchievementsBadges(achievementsContainer);
  }
}

/**
 * Inicializa as opções de settings
 */
function initializeSettings() {
  const themeToggleSetting = document.getElementById('theme-toggle-setting');
  
  if (!themeToggleSetting) return;

  // Verificar tema atual
  const isDarkTheme = document.documentElement.getAttribute('data-theme') === 'dark' ||
                     localStorage.getItem('theme') === 'dark';

  updateThemeToggleButton(isDarkTheme);

  // Configurar listener
  themeToggleSetting.addEventListener('click', () => {
    toggleTheme();
  });
}

/**
 * Alterna entre tema claro e escuro
 */
function toggleTheme() {
  const htmlElement = document.documentElement;
  const themeToggleSetting = document.getElementById('theme-toggle-setting');
  const currentTheme = localStorage.getItem('theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';

  // Atualizar localStorage
  localStorage.setItem('theme', newTheme);

  // Atualizar data-theme
  htmlElement.setAttribute('data-theme', newTheme);

  // Atualizar UI do botão
  updateThemeToggleButton(newTheme === 'dark');

  // Disparar evento para outros componentes que possam estar escutando
  window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
}

/**
 * Atualiza a aparência do botão de tema
 * @param {boolean} isDark - Se o tema é escuro
 */
function updateThemeToggleButton(isDark) {
  const themeToggleSetting = document.getElementById('theme-toggle-setting');
  if (!themeToggleSetting) return;

  const icon = themeToggleSetting.querySelector('.theme-icon');
  const label = themeToggleSetting.querySelector('.theme-label');

  if (isDark) {
    if (icon) icon.textContent = '☀️';
    if (label) label.textContent = 'Claro';
    themeToggleSetting.classList.add('theme-dark');
    themeToggleSetting.classList.remove('theme-light');
  } else {
    if (icon) icon.textContent = '🌙';
    if (label) label.textContent = 'Escuro';
    themeToggleSetting.classList.add('theme-light');
    themeToggleSetting.classList.remove('theme-dark');
  }
}

/**
 * Atualiza os dados do jogador na UI (chamado quando pontos mudam)
 * @param {number} points - Novos pontos
 * @param {number} level - Novo nível
 */
export function updatePlayerStats(points, level) {
  localStorage.setItem('playerPoints', points);
  localStorage.setItem('playerLevel', level);
  
  // Atualizar no painel do jogador se visível
  const playerPanel = document.getElementById('player-panel');
  if (playerPanel && !playerPanel.classList.contains('hidden')) {
    const playerTotalPoints = document.getElementById('player-total-points');
    const playerLevel = document.getElementById('player-level');
    
    if (playerTotalPoints) playerTotalPoints.textContent = points;
    if (playerLevel) playerLevel.textContent = level;
  }

  // Atualizar no painel de conquistas se visível
  const achievementsPanel = document.getElementById('achievements-panel');
  if (achievementsPanel && !achievementsPanel.classList.contains('hidden')) {
    const playerTotalPoints = document.getElementById('player-total-points');
    const playerLevel = document.getElementById('player-level');
    const achievementsContainer = document.getElementById('achievements-container');
    
    if (playerTotalPoints) playerTotalPoints.textContent = points;
    if (playerLevel) playerLevel.textContent = level;
    
    // Atualizar badges também
    if (achievementsContainer) {
      renderAchievementsBadges(achievementsContainer);
    }
  }
}

export default { initTabNavigation, updatePlayerStats };
