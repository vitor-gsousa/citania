// js/theme.js
/*
 * Este módulo gere a lógica de temas (claro/escuro).
 */

/**
 * Aplica o tema (claro ou escuro) ao body e atualiza o ícone do botão.
 * @param {string} theme - O tema a aplicar ('dark' ou 'light').
 */
export function applyTheme(theme) {
  const themeToggleButton = document.getElementById("theme-toggle");
  if (theme === "dark") {
    document.body.classList.add("dark-mode");
    if (themeToggleButton) themeToggleButton.textContent = "☀️";
  } else {
    document.body.classList.remove("dark-mode");
    if (themeToggleButton) themeToggleButton.textContent = "🌙";
  }
}

export function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
  localStorage.setItem("matematicaAppTheme", currentTheme);
  applyTheme(currentTheme);
}