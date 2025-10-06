// js/utils/icon-utils.js
// Utilitários para normalizar ícones no DOM (SVG inline e Material Symbols spans)
export function normalizeIcons() {
  // 1) Normaliza SVGs com classe card-icon para herdarem currentColor
  try {
    document.querySelectorAll("svg.card-icon").forEach((svg) => {
      try {
        svg.style.color =
          getComputedStyle(svg.closest(".card") || svg).color || "currentColor";
        svg.querySelectorAll("*").forEach((el) => {
          const tag = el.tagName.toLowerCase();
          if (!el.hasAttribute("fill") || el.getAttribute("fill") === "null") {
            if (tag !== "svg" && tag !== "defs") el.setAttribute("fill", "currentColor");
          }
          if (!el.hasAttribute("stroke") || el.getAttribute("stroke") === "null") {
            if (tag !== "svg" && tag !== "defs") el.setAttribute("stroke", "currentColor");
          }
        });
      } catch (e) {
        // silent - não bloquear inicialização se ocorrer algum problema
        console.warn("normalizeIcons: svg normalization error", e);
      }
    });
  } catch (e) {
    /* silent */
  }

  // 2) Normaliza spans Material Symbols para garantir alinhamento e acessibilidade
  try {
    document.querySelectorAll(".material-symbols-outlined.card-icon").forEach((el) => {
      try {
        // ícones decorativos dentro de .card com .card-text -> ocultar a leitores de ecrã
        if (el.closest(".card") && el.closest(".card").querySelector(".card-text")) {
          el.setAttribute("aria-hidden", "true");
        } else {
          // por segurança, marcar como decorative
          el.setAttribute("aria-hidden", "true");
        }
        // Garantir estilos inline mínimos que não afectam layout mas cobrem browsers antigos
        if (!el.style.display) el.style.display = "inline-block";
        if (!el.style.verticalAlign) el.style.verticalAlign = "middle";
        if (!el.style.lineHeight) el.style.lineHeight = "1";
      } catch (e) {
        console.warn("normalizeIcons: material symbol normalization error", e);
      }
    });
  } catch (e) {
    /* silent */
  }
}

export default normalizeIcons;
