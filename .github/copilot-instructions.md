# Citânia - AI Coding Assistant Instructions

## Project Overview
Citânia is a gamified Progressive Web App (PWA) for mathematics learning, themed around the ancient Castro of Citânia de Sanfins in Portugal. It's a pure client-side application built with vanilla JavaScript ES6+ modules, CSS custom properties, and PWA technologies.

## Architecture & Key Patterns

### Modular JavaScript Structure
- **ES6 Modules**: Use import/export throughout (`js/app.js` is main entry point)
- **DOM Elements Object**: All DOM references centralized in `DOM` object in `app.js`
- **Separation of Concerns**: 
  - `js/modules/` - Pure logic (math utilities, arithmetic generators)
  - `js/features/` - App features (gamification system)
  - `js/services/` - External integrations (audio services)
  - `js/utils/` - Cross-cutting utilities (storage, icon normalization)

### State Management
- **Global State**: `state` object in `app.js` for exercise flow
- **Gamification State**: `gamification` object in `features/gamification.js`
- **LocalStorage**: Persistent data via `utils/storage.js` with safe fallbacks
- **Transient Progress**: `transientProgress` object tracks round completion per exercise type

### Exercise System Architecture
- **Exercise Types**: Each type has `generate()` and `check()` methods in `exercises` object
- **Data Attributes**: Exercise cards use `data-type` to map to exercise generators
- **Progress Model**: Rounds of 8 exercises → level progression → persistent storage per type

### Gamification Integration
- **Import Pattern**: Gamification functions imported into `app.js` from `features/gamification.js`
- **Badge System**: `BADGES` object defines all achievements; `awardBadge()` manages unlocking
- **Points System**: `adicionarPontos()` for scoring; `verificarMedalhas()` for achievement checks
- **Narrative**: Dynamic story updates via `mostrarNarrativa()` based on progress

## UI & UX Conventions

### Navigation Pattern
- **Hierarchical Menu**: Areas → Sections → Exercise Types (only Aritmética section is populated)
- **Data Actions**: Use `data-action` attributes for navigation (`open-section`, `close-section`)
- **State Classes**: `.hidden` for visibility; `aria-hidden` for accessibility

### Custom Keyboard Implementation
- **Mobile-First**: Custom numeric keyboard in `#custom-keyboard` for touch devices
- **Pointer Events**: Uses `pointerdown` for reliable touch handling
- **Input Control**: `readonly` input with programmatic value setting

### Responsive & Accessibility
- **CSS Custom Properties**: All theming via CSS variables with dark/light mode support
- **Material Symbols**: Icon font from Google Fonts with local fallback option
- **ARIA Labels**: Comprehensive `aria-label` and `role` attributes
- **Keyboard Navigation**: `tabindex="0"` on interactive cards

## Development Workflows

### Local Development
```bash
# Simple HTTP server (no build system needed)
python -m http.server 8000
# or
npx http-server
```

### PWA Testing
- Test offline functionality via Service Worker (`sw.js`)
- Validate manifest.json for installability
- Check cache strategy in browser DevTools

### Icon Management
```powershell
# Optional: Download Material Symbols font locally
pwsh ./tools/download-material-symbols.ps1
```

## Key Files to Understand

### Core Application
- `js/app.js` - Main application logic, DOM management, exercise flow
- `js/features/gamification.js` - Complete gamification system
- `index.html` - Hierarchical navigation structure with data attributes

### Exercise System
- `js/modules/arithmetic/progression.js` - Arithmetic exercise generators
- `js/modules/utils/math.js` - Mathematical utility functions (gcd, lcm, primes)

### Infrastructure
- `css/style.css` - CSS custom properties system, responsive design
- `sw.js` - Service Worker for PWA offline functionality
- `manifest.json` - PWA configuration

## Common Patterns

### Adding New Exercise Types
1. Add card in `section-aritmetica` with `data-type="newType"`
2. Create generator in `exercises` object with `generate()` and `check()` methods
3. Import any needed utilities from `js/modules/utils/`

### Extending Gamification
- Add badges in `BADGES` object in `gamification.js`
- Use `awardBadge(DOM, badgeId)` to unlock achievements
- Call `adicionarPontos(DOM, points)` for scoring

### Theme/Styling Changes
- Modify CSS custom properties in `:root` and `.dark-mode`
- Icons use Material Symbols classes: `material-symbols-outlined`

## Integration Points
- **Audio**: `sounds.js` service with graceful fallbacks for missing files
- **Storage**: `storage.js` utilities handle localStorage with error safety
- **PWA**: Service Worker intercepts requests; `manifest.json` defines app metadata
- **External CDN**: Canvas-confetti for celebration effects (with local fallback via vendor/)

## Testing Considerations
- Test PWA installation and offline functionality
- Verify gamification state persistence across sessions
- Check responsive behavior on mobile devices with custom keyboard
- Validate accessibility with screen readers and keyboard navigation
