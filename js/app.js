// js/app.js

// Import utilitários ESM
import { gcd as gcd_imported, lcm as lcm_imported, isPrime as isPrime_imported, getPrimeFactors as getPrimeFactors_imported } from './modules/utils/math.js';
import { getRandomInt as getRandomInt_imported, choice as choice_imported } from './modules/utils/rand.js';

// Elementos do DOM
const DOM = {
    menuContainer: document.getElementById('menu-container'),
    exerciseArea: document.getElementById('exercise-area'),
    summaryArea: document.getElementById('summary-area'),
    questionEl: document.getElementById('question'),
    answerInput: document.getElementById('answer-input'),
    checkButton: document.getElementById('check-button'),
    feedbackEl: document.getElementById('feedback'),
    nextButton: document.getElementById('next-button'),
    backButton: document.getElementById('back-to-menu'),
    nextLevelButton: document.getElementById('next-level-button'),
    correctCountEl: document.getElementById('correct-count'),
    incorrectCountEl: document.getElementById('incorrect-count'),
    levelDisplayEl: document.getElementById('level-display'),
    progressBar: document.getElementById('progress-bar'),
    summaryCorrect: document.getElementById('summary-correct'),
    summaryTotal: document.getElementById('summary-total'),
    themeToggleButton: document.getElementById('theme-toggle'),
    summaryRecordMessage: document.getElementById('summary-record-message'),
    exerciseCards: document.querySelectorAll('.card'),
    // NOVOS elementos para gamificação
    gamificationBar: document.getElementById('gamification-bar'),
    pointsCountEl: document.getElementById('points-count'),
    badgesStripEl: document.getElementById('badges-strip'),
    userButton: document.getElementById('user-button'),
    userNameEl: document.getElementById('user-name'),
    // NOVO: teclado personalizado
    customKeyboard: document.getElementById('custom-keyboard')
};

// Estado UI global — declarar cedo para evitar TDZ
if (typeof window.__citania_uiState__ === 'undefined') {
    window.__citania_uiState__ = { inExercise: false };
}
const uiState = window.__citania_uiState__;

// Indicador para evitar que o blur do input esconda o teclado enquanto pointer está activo
let keyboardPointerDown = false;

// Estado global da aplicação
const state = {
    score: { correct: 0, incorrect: 0 },
    answered: false,
    level: 1,
    roundProgress: 0,
    exercisesPerRound: 8,
    explanationLimit: 5,
    exerciseStartTs: 0,
    streak: 0
};

// Mapa transitório de progresso por tipo
const transientProgress = {};

// Exercício corrente
let currentExercise = {};

// Função para gerar exercício
function generateNewExercise() {
    if (!currentExercise.type || !exercises[currentExercise.type]) {
        console.error('Tipo de exercício inválido:', currentExercise.type);
        return;
    }
    const exercise = exercises[currentExercise.type];
    const problem = exercise.generate(state.level);
    currentExercise.answer = problem.answer;
    currentExercise.explanation = problem.explanation;
    currentExercise.checkType = problem.checkType;

    // Atualizar UI
    const questionEl = document.getElementById('question');
    const answerInput = document.getElementById('answer-input');
    const feedbackEl = document.getElementById('feedback');
    if (questionEl) questionEl.innerHTML = problem.question;
    if (answerInput) {
        answerInput.value = '';
            // Garantir que a caixa de resposta está visível quando um novo exercício é gerado
            answerInput.classList.remove('hidden');
            // Reativar foco para permitir uso do teclado personalizado
            try { answerInput.focus(); } catch (e) { /* silent */ }
    }
    if (feedbackEl) feedbackEl.textContent = '';
    state.answered = false;
    
    // Restaurar visibilidade dos botões
    DOM.checkButton.style.display = 'block';
    DOM.nextButton.style.display = 'none';
}

// (A verificação de resposta mais avançada está definida mais abaixo;
//  removida a versão simplificada para evitar duplicação.)

// Função para atualizar barra de progresso
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    if (progressBar) {
        const pct = Math.min(100, (state.roundProgress / state.exercisesPerRound) * 100);
        progressBar.style.width = pct + '%';
        progressBar.setAttribute('aria-valuenow', state.roundProgress);
        progressBar.setAttribute('aria-valuemax', state.exercisesPerRound);
    }
}

// Função para mostrar confetti
function triggerConfetti() {
    // Implementação stub
    console.log('Confetti triggered');
}

// Função para mostrar UI de level up (implementação completa mais abaixo)

// Função para atualizar o display de pontuação (mantida para compatibilidade)
function updateScoreDisplay() {
    if (DOM.correctCountEl) {
        DOM.correctCountEl.textContent = state.score.correct;
    }
    if (DOM.incorrectCountEl) {
        DOM.incorrectCountEl.textContent = state.score.incorrect;
    }
}

// Função para mostrar a área de exercício
function showExerciseArea() {
    const menu = document.getElementById('menu-container');
    const exercise = document.getElementById('exercise-area');
    if (menu) menu.classList.add('hidden');
    if (exercise) exercise.classList.remove('hidden');
}

// Função para sair do exercício
function exitExercise() {
    uiState.inExercise = false;
    if (currentExercise.type) {
        transientProgress[currentExercise.type] = 0;
    }
    state.roundProgress = 0;
    updateProgressBar();
    const exercise = document.getElementById('exercise-area');
    const menu = document.getElementById('menu-container');
    const summary = document.getElementById('summary-area');

    // Esconder a área de exercício e o resumo (se abertos)
    if (exercise) exercise.classList.add('hidden');
    if (summary) summary.classList.add('hidden');

    // Mostrar o menu principal com os cards
    if (menu) menu.classList.remove('hidden');

    // Restaurar estado dos controlos na UI de exercício para a próxima vez que entrar
    if (DOM.checkButton) DOM.checkButton.style.display = 'block';
    if (DOM.nextButton) DOM.nextButton.style.display = 'none';
    if (DOM.answerInput) {
        DOM.answerInput.classList.remove('hidden');
        DOM.answerInput.value = '';
    }
    if (DOM.feedbackEl) DOM.feedbackEl.textContent = '';

    // Garantir scroll para o topo do menu
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) { /* silent */ }
}

// --- Lógica dos Exercícios ---
const exercises = {
    fractionToDecimal: {
        generate: (level) => {
            let numerator, denominator;
            const maxNum = 10 + level * 2;
            do {
                numerator = getRandomInt(1, maxNum - 1);
                denominator = getRandomInt(2, maxNum);
            } while (numerator % denominator === 0);

            return {
                question: `Quanto é ${numerator}/${denominator} em decimal? (arredonda às centésimas)`,
                answer: (numerator / denominator).toFixed(2),
                explanation: `Para converter ${numerator}/${denominator} para decimal, divide-se o numerador (${numerator}) pelo denominador (${denominator}). O resultado é ${numerator / denominator}, que arredondado às centésimas fica ${(numerator / denominator).toFixed(2)}.`
            };
        },
        check: (userAnswer, correctAnswer) => {
            const formattedUserAnswer = parseFloat(userAnswer.replace(',', '.').trim()).toFixed(2);
            return formattedUserAnswer === correctAnswer;
        }
    },
    primeFactorization: {
        generate: (level) => {
            let number;
            const minNum = 10 + (level - 1) * 10;
            const maxNum = 100 + (level - 1) * 20;
            do {
                number = getRandomInt(minNum, maxNum);
            } while (isPrime(number));

            const factors = getPrimeFactors(number);
            return {
                question: `Decompõe o número ${number} em fatores primos. (ex: 2 x 2 x 3)`,
                answer: factors,
                explanation: `Para decompor ${number}, dividimos sucessivamente por números primos: ${factors.join(' x ')}.`
            };
        },
        check: (userAnswer, correctAnswerArray) => {
            const userFactors = userAnswer.match(/\d+/g)?.map(Number).sort((a, b) => a - b) || [];
            return JSON.stringify(userFactors) === JSON.stringify(correctAnswerArray.sort((a, b) => a - b));
        }
    },
    gcd: {
        generate: (level) => {
            const factor = getRandomInt(2, 5 + level);
            const num1 = factor * getRandomInt(2, 5 + level);
            const num2 = factor * getRandomInt(2, 5 + level);
            const answer = gcd(num1, num2);
            return {
                question: `Qual é o Máximo Divisor Comum (MDC) entre ${num1} e ${num2}?`,
                answer,
                explanation: `O MDC é o maior número que divide ${num1} e ${num2} sem deixar resto. Neste caso, a resposta é ${answer}.`
            };
        },
        check: (userAnswer, correctAnswer) => {
            return parseInt(userAnswer.trim()) === correctAnswer;
        }
    },
    lcm: {
        generate: (level) => {
            const num1 = getRandomInt(2, 10 + level);
            const num2 = getRandomInt(2, 10 + level);
            const answer = lcm(num1, num2);
            return {
                question: `Qual é o Mínimo Múltiplo Comum (MMC) entre ${num1} e ${num2}?`,
                answer,
                explanation: `O MMC é o menor número que é múltiplo de ${num1} e de ${num2}. A resposta é ${answer}. Uma forma de calcular é (num1 * num2) / MDC(num1, num2).`
            };
        },
        check: (userAnswer, correctAnswer) => {
            return parseInt(userAnswer.trim()) === correctAnswer;
        }
    },
    powerMultiplication: {
        generate: (level) => {
            if (Math.random() < 0.5) {
                const base = getRandomInt(2, 5 + level);
                const exp1 = getRandomInt(2, 5 + level);
                const exp2 = getRandomInt(2, 5 + level);
                const finalExp = exp1 + exp2;

                return {
                    question: `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &times; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
                    answer: `${base}^${finalExp}`,
                    explanation: `Para multiplicar potências com a mesma base, mantém-se a base (${base}) e somam-se os expoentes (${exp1} + ${exp2} = ${finalExp}).`,
                    checkType: 'string'
                };
            } else {
                let base1 = getRandomInt(2, 5);
                let base2 = getRandomInt(2, 5);
                if (base1 === base2) base2++;
                const exp1 = getRandomInt(2, 3);
                const exp2 = getRandomInt(2, 3);
                const result = Math.pow(base1, exp1) * Math.pow(base2, exp2);

                return {
                    question: `Qual é o resultado de <strong>${base1}<sup>${exp1}</sup> &times; ${base2}<sup>${exp2}</sup></strong>?`,
                    answer: result,
                    explanation: `Como as bases são diferentes (${base1} e ${base2}), não podemos somar os expoentes. Calculamos o valor de cada potência e depois multiplicamos: ${base1**exp1} &times; ${base2**exp2} = ${result}.`,
                    checkType: 'number'
                };
            }
        },
        check: (userAnswer, correctAnswer, checkType) => {
            if (checkType === 'number') {
                return parseInt(userAnswer.trim()) === correctAnswer;
            }
            return userAnswer.replace(/\s/g, '') === correctAnswer;
        }
    },
    powerDivision: {
        generate: (level) => {
            const base = getRandomInt(2, 5 + level);
            const exp1 = getRandomInt(3, 8 + level);
            const exp2 = getRandomInt(2, exp1 - 1);
            const finalExp = exp1 - exp2;

            const answer = `${base}^${finalExp}`;
            return {
                question: `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &divide; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`,
                answer,
                explanation: `Para dividir potências com a mesma base, mantém-se a base (${base}) e subtraem-se os expoentes (${exp1} - ${exp2} = ${finalExp}).`
            };
        },
        check: (userAnswer, correctAnswer) => {
            return userAnswer.replace(/\s/g, '') === correctAnswer;
        }
    }
};

// --- Funções de Apoio ---
// Preferir os módulos carregados em js/modules/utils, mas manter fallback local
function getRandomInt(min, max) {
    try {
        if (typeof getRandomInt_imported === 'function') return getRandomInt_imported(min, max);
    } catch (e) { /* ignore */ }
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    try { if (typeof gcd_imported === 'function') return gcd_imported(a, b); } catch (e) { /* ignore */ }
    a = Math.abs(Number(a)); b = Math.abs(Number(b));
    while (b) {
        const t = a % b;
        a = b;
        b = t;
    }
    return a;
}

function lcm(a, b) {
    try { if (typeof lcm_imported === 'function') return lcm_imported(a, b); } catch (e) { /* ignore */ }
    a = Number(a); b = Number(b);
    if (!a || !b) return 0;
    return Math.abs(a * b) / gcd(a, b);
}

function isPrime(num) {
    try { if (typeof isPrime_imported === 'function') return isPrime_imported(num); } catch (e) { /* ignore */ }
    num = Number(num);
    if (!Number.isInteger(num) || num <= 1) return false;
    if (num <= 3) return true;
    if (num % 2 === 0) return false;
    const limit = Math.floor(Math.sqrt(num));
    for (let i = 3; i <= limit; i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

function getPrimeFactors(num) {
    try { if (typeof getPrimeFactors_imported === 'function') return getPrimeFactors_imported(num); } catch (e) { /* ignore */ }
    num = Math.floor(Number(num));
    const factors = [];
    if (num <= 1) return factors;
    let d = 2;
    while (num >= d * d) {
        if (num % d === 0) {
            factors.push(d);
            num = num / d;
        } else {
            d = d === 2 ? 3 : d + 2;
        }
    }
    if (num > 1) factors.push(num);
    return factors;
}

// Inline external SVG images so they can inherit currentColor
async function inlineSvgs() {
    const imgs = Array.from(document.querySelectorAll('img.card-icon[src$=".svg"]'));
    await Promise.all(imgs.map(async (img) => {
        try {
            const src = img.getAttribute('src');
            const resp = await fetch(src);
            if (!resp.ok) return;
            const text = await resp.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'image/svg+xml');
            const svg = doc.querySelector('svg');
            if (!svg) return;
            // copy width/height from img to svg if present
            if (img.hasAttribute('width')) svg.setAttribute('width', img.getAttribute('width'));
            if (img.hasAttribute('height')) svg.setAttribute('height', img.getAttribute('height'));
            // ensure svg uses currentColor as fallback
            svg.setAttribute('aria-hidden', img.getAttribute('aria-hidden') || 'true');
            svg.classList.add(...(img.className ? img.className.split(' ') : []));
            img.replaceWith(svg);
        } catch (e) {
            // ignore, keep the <img>
            console.warn('inlineSvgs error for', img, e);
        }
    }));
}

// Normaliza ícones SVG que por acaso têm fills/strokes não herdados.
// Executar no DOMContentLoaded para corrigir SVGs inline gerados no HTML.
function normalizeSvgIcons() {
    document.querySelectorAll('svg.card-icon').forEach(svg => {
        // assegura que o svg tem a propriedade color herdada (usado por currentColor)
        svg.style.color = getComputedStyle(svg.closest('.card') || svg).color || 'currentColor';

        // percorre nós gráficos e aplica currentColor quando aplicável
        svg.querySelectorAll('*').forEach(el => {
            const tag = el.tagName.toLowerCase();
            // mantém explicitamente 'none' quando presente (ex.: stroke="none" intentional)
            if (!el.hasAttribute('fill') || el.getAttribute('fill') === 'null') {
                if (tag !== 'svg' && tag !== 'defs') el.setAttribute('fill', 'currentColor');
            }
            if (!el.hasAttribute('stroke') || el.getAttribute('stroke') === 'null') {
                if (tag !== 'svg' && tag !== 'defs') el.setAttribute('stroke', 'currentColor');
            }
        });
    });
}

// Dispatcher centralizado para actions/data-type dos cartões.
// - exercise types -> startExercise(type)
// - achievements -> showAchievementsPanel()
// - theme -> toggleTheme()
function bindCardActions() {
    const container = document.getElementById('menu-container') || document.body;
    container.addEventListener('click', (ev) => {
        const card = ev.target.closest('.card');
        if (!card) return;
        const type = card.dataset.type || card.dataset.action;
        if (!type) return;

        // Mapeamento simples
        if (type === 'achievements' || type === 'achievement') {
            if (typeof showAchievementsPanel === 'function') {
                showAchievementsPanel();
                return;
            }
        }

        if (type === 'theme' || type === 'toggle-theme') {
            if (typeof toggleTheme === 'function') {
                toggleTheme();
                return;
            }
        }

        // Assume exercício
        if (typeof startExercise === 'function') {
            startExercise(type);
            return;
        }

        console.warn('No handler for card type/action:', type);
    });

    // Keyboard accessibility
    container.addEventListener('keydown', (ev) => {
        const card = ev.target.closest('.card');
        if (!card) return;
        if (ev.key === 'Enter' || ev.key === ' ') {
            ev.preventDefault();
            const type = card.dataset.type || card.dataset.action;
            if (!type) return;
            if (type === 'achievements' && typeof showAchievementsPanel === 'function') {
                showAchievementsPanel();
                return;
            }
            if ((type === 'theme' || type === 'toggle-theme') && typeof toggleTheme === 'function') {
                toggleTheme();
                return;
            }
            if (typeof startExercise === 'function') startExercise(type);
        }
    });
}

// Mostrar UI de Level Up: reproduz som e atualiza resumo
function showLevelUpUI() {
    // Reproduzir som levelup (se carregado)
    try {
        if (typeof sounds !== 'undefined' && sounds.levelup && typeof sounds.levelup.play === 'function') {
            sounds.levelup.play().catch(() => {}); // ignora Promise rejection por autoplay
        }
    } catch (e) {
        console.warn('Erro a reproduzir levelup sound:', e);
    }

    // Atualizar resumo das respostas (assume existence de elementos #summary-correct, #summary-total)
    const summaryCorrectEl = document.getElementById('summary-correct') || document.querySelector('#summary-area #summary-correct');
    const summaryTotalEl = document.getElementById('summary-total') || document.querySelector('#summary-area #summary-total');

    const correct = (state && state.score && Number.isFinite(state.score.correct)) ? state.score.correct : 0;
    const incorrect = (state && state.score && Number.isFinite(state.score.incorrect)) ? state.score.incorrect : 0;

    if (summaryCorrectEl) summaryCorrectEl.textContent = String(correct);
    if (summaryTotalEl) summaryTotalEl.textContent = String(correct + incorrect);

    // mostra o painel de summary se existir
    const summaryPanel = document.getElementById('summary-area');
    if (summaryPanel) summaryPanel.classList.add('open');
}

// Executar inicializações quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    try { normalizeSvgIcons(); } catch (e) { console.warn('normalizeSvgIcons failed', e); }
    try { bindCardActions(); } catch (e) { console.warn('bindCardActions failed', e); }

    // expor helper para debugging (opcional)
    window.showLevelUpUI = showLevelUpUI;
});

// --- Funções de Persistência (LocalStorage) ---

const STORAGE_KEY = 'matematicaDivertidaHighScores';

function loadHighScores() {
    const scores = localStorage.getItem(STORAGE_KEY);
    return scores ? JSON.parse(scores) : {};
}

function saveHighScore(exerciseType, level) {
    const highScores = loadHighScores();
    const currentHighScore = highScores[exerciseType] || 0;
    if (level > currentHighScore) {
        highScores[exerciseType] = level;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
    }
}

// Persistência de progresso por tipo de exercício
const PROGRESS_KEY = 'citania_progress_v1';

// Leitura/escrita seguras em localStorage
function safeGetItem(key) {
    try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetItem(key, value) {
    try { localStorage.setItem(key, value); } catch {}
}

// Guarda o nível para um tipo de exercício
function saveProgressForType(exerciseType, level) {
    if (!exerciseType) return;
    const raw = safeGetItem(PROGRESS_KEY) || '{}';
    let map;
    try { map = JSON.parse(raw); } catch { map = {}; }
    map[exerciseType] = Number(level) || 1;
    safeSetItem(PROGRESS_KEY, JSON.stringify(map));
}

// Carrega o nível guardado para um tipo (retorna 1 se não houver)
function loadProgressForType(exerciseType) {
    if (!exerciseType) return 1;
    const raw = safeGetItem(PROGRESS_KEY);
    if (!raw) return 1;
    try {
        const map = JSON.parse(raw);
        const lvl = Number(map[exerciseType]);
        return (Number.isFinite(lvl) && lvl > 0) ? lvl : 1;
    } catch {
        return 1;
    }
}

// --- Gamificação ---
// Chaves persistência
const GAMIFICATION_KEY = 'citaniaGamification';
const LEADERBOARD_KEY = 'citaniaLeaderboard';

// Definição de badges
const BADGES = {
    explorer:  { id: 'explorer',  label: 'Explorador',        emoji: '🧭' },
    speedster: { id: 'speedster', label: 'Velocista',         emoji: '⚡' },
    streak5:   { id: 'streak5',   label: 'Série Perfeita x5', emoji: '🔥' },
    firstTry:  { id: 'firstTry',  label: 'À Primeira',        emoji: '🎯' },
    scholar:   { id: 'scholar',   label: 'Estudioso',         emoji: '📚' }
};

// Estado de gamificação
const gamification = {
    pontos: 0,
    medalhas: [],
    narrativa: "Bem-vindo à missão Citania! Descobre os segredos da cidade antiga completando desafios.",
    leaderboard: [],
    userName: localStorage.getItem('citaniaUserName') || 'Jogador'
};

// Persistência
function loadGamification() {
    const saved = safeGetItem(GAMIFICATION_KEY);
    if (saved) {
        try {
            const data = JSON.parse(saved);
            gamification.pontos = data.pontos ?? gamification.pontos;
            gamification.medalhas = Array.isArray(data.medalhas) ? data.medalhas : gamification.medalhas;
            gamification.narrativa = data.narrativa ?? gamification.narrativa;
            gamification.userName = data.userName ?? gamification.userName;
        } catch {}
    }
    gamification.leaderboard = JSON.parse(safeGetItem(LEADERBOARD_KEY) || '[]');
}

function saveGamification() {
    safeSetItem(GAMIFICATION_KEY, JSON.stringify({
        pontos: gamification.pontos,
        medalhas: gamification.medalhas,
        narrativa: gamification.narrativa,
        userName: gamification.userName
    }));
    safeSetItem(LEADERBOARD_KEY, JSON.stringify(gamification.leaderboard));
}

// UI gamificação
function renderGamificationBar() {
    if (DOM.pointsCountEl) DOM.pointsCountEl.textContent = gamification.pontos;
    if (DOM.userNameEl) DOM.userNameEl.textContent = gamification.userName;
    // Não renderizar diretamente as medalhas como emojis na navbar para manter o aspeto clean.
    // As medalhas serão apresentadas no painel de conquistas (achievements panel).
    // Preenche lista de medalhas no resumo
    const medalsList = document.getElementById('medalhas-list');
    if (medalsList) {
        medalsList.innerHTML = gamification.medalhas
            .map(b => `<span class="badge big" title="${b.label}">${b.emoji} ${b.label}</span>`)
            .join(' ');
    }
}

// Função para adicionar pontos
function adicionarPontos(valor) {
    gamification.pontos += valor;
    mostrarFeedbackGamificacao(`+${valor} pontos! Total: ${gamification.pontos}`);
    renderGamificationBar();
    saveGamification();
}

// Função para mostrar feedback motivador
function mostrarFeedbackGamificacao(mensagem) {
    if (DOM.feedbackEl) {
        DOM.feedbackEl.innerHTML += `<br><span class="gamification-feedback">${mensagem}</span>`;
    }
}

// Helpers badges
function hasBadge(id) { return gamification.medalhas.some(b => b.id === id); }
function awardBadge(badge) {
    if (hasBadge(badge.id)) return;
    gamification.medalhas.push(badge);
    mostrarFeedbackGamificacao(`🏅 Medalha conquistada: ${badge.emoji} ${badge.label}!`);
    renderGamificationBar();
    saveGamification();
    renderAchievementsPanel();

    // Inserir pequeno placeholder visual no badges strip (mesmo estando escondido no navbar)
    const wrapper = document.createElement('div');
    wrapper.className = 'lottie-placeholder badge-earned';
    const target = DOM.badgesStripEl || document.getElementById('medalhas');
    if (!target) return;

    const lottiePath = `./animations/${badge.id}.json`;
    fetch(lottiePath, { method: 'HEAD' }).then(resp => {
        if (!resp.ok) {
            wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
            target.insertBefore(wrapper, target.firstChild);
            return;
        }
        ensureLottie().then(lottie => {
            target.insertBefore(wrapper, target.firstChild);
            lottie.loadAnimation({ container: wrapper, renderer: 'svg', loop: false, autoplay: true, path: lottiePath });
        }).catch(() => {
            wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
            target.insertBefore(wrapper, target.firstChild);
        });
    }).catch(() => {
        wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
        target.insertBefore(wrapper, target.firstChild);
    });
}

// Narrativa por nível (Citânia de Sanfins)
function narrativaPorNivel(level) {
    switch (level) {
        case 1:
            return "Bem-vindo à Citânia de Sanfins, um antigo povoado fortificado (castro) em Paços de Ferreira. Começa a explorar as primeiras casas e caminhos.";
        case 2:
            return "Observa as muralhas concêntricas que protegiam a comunidade e as casas circulares construídas em pedra. Avança com cuidado pelos becos do castro.";
        case 3:
            return "Chegam influências romanas: novas técnicas e objetos do dia a dia. Descobre como a romanização mudou a vida no povoado.";
        case 4:
            return "Visita o Museu Arqueológico da Citânia e liga as pistas: ferramentas, cerâmica e estruturas defensivas contam histórias de séculos.";
        default:
            return "Continua a tua missão arqueológica: cada desafio revela mais segredos da Citânia de Sanfins!";
    }
}

// Função para mostrar narrativa/missão
function mostrarNarrativa() {
    gamification.narrativa = narrativaPorNivel(state.level);
    const narrativaEl = document.getElementById('narrativa');
    if (narrativaEl) narrativaEl.textContent = gamification.narrativa;
    saveGamification();
}

// Verificar medalhas (com contexto)
function verificarMedalhas(ctx = {}) {
    const { isCorrect = false, responseMs = null } = ctx;
    if (gamification.pontos >= 50) awardBadge(BADGES.explorer);
    if (isCorrect && responseMs !== null && responseMs <= 5000) awardBadge(BADGES.speedster);
    if (state.streak >= 5) awardBadge(BADGES.streak5);
    if (isCorrect && currentExercise.attempts === 1) awardBadge(BADGES.firstTry);
    if (state.level >= 3) awardBadge(BADGES.scholar);
}

// --- Achievements panel ---
function renderAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    if (!panel) return;

    const total = (state.score.correct || 0) + (state.score.incorrect || 0);
    const badgesHtml = (gamification.medalhas || []).map(b =>
        `<div class="ach-badge"><span class="badge">${b.emoji}</span><div class="ach-badge-label">${b.label}</div></div>`
    ).join('') || '<div class="no-badges">Sem conquistas ainda.</div>';

    panel.innerHTML = `
        <div class="ach-header">
            <button id="close-achievements" aria-label="Fechar">✖</button>
            <h3>Conquistas</h3>
        </div>
        <div class="ach-body">
            <div class="ach-stats">
                <div><strong>Total respostas:</strong> ${total}</div>
                <div><strong>Corretas:</strong> ${state.score.correct || 0}</div>
                <div><strong>Incorrretas:</strong> ${state.score.incorrect || 0}</div>
                <div><strong>Pontos:</strong> ${gamification.pontos || 0}</div>
            </div>
            <h4>Medalhas</h4>
            <div class="ach-badges">${badgesHtml}</div>
        </div>
    `;

    // fechar
    const closeBtn = document.getElementById('close-achievements');
    closeBtn?.addEventListener('click', hideAchievementsPanel);
}

function showAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    if (!panel) return;
    renderAchievementsPanel();
    panel.classList.add('open');
}

function hideAchievementsPanel() {
    const panel = document.getElementById('achievements-panel');
    if (!panel) return;
    panel.classList.remove('open');
}

// Leaderboard
function atualizarLeaderboard() {
    const nome = gamification.userName || 'Jogador';
    const entry = { nome, pontos: gamification.pontos, nivel: state.level, data: new Date().toISOString() };

    // Mantém a melhor pontuação por utilizador
    const idx = gamification.leaderboard.findIndex(e => e.nome === nome);
    if (idx >= 0) {
        if (entry.pontos > gamification.leaderboard[idx].pontos) {
            gamification.leaderboard[idx] = entry;
        }
    } else {
        gamification.leaderboard.push(entry);
    }

    gamification.leaderboard.sort((a, b) => b.pontos - a.pontos);
    gamification.leaderboard = gamification.leaderboard.slice(0, 10);
    saveGamification();
}

// Substitui a versão anterior (usa o estado persistido)
function mostrarLeaderboard() {
    const leaderboardEl = document.getElementById('leaderboard');
    if (!leaderboardEl) return;
    leaderboardEl.innerHTML = '<h3>🏆 Ranking</h3>' +
        (gamification.leaderboard.map((entry, i) =>
            `<div>${i + 1}. ${entry.nome} — ${entry.pontos} pts (Nível ${entry.nivel})</div>`
        ).join('') || '<div>Sem registos…</div>');
}

// --- Funções Principais da Aplicação ---

function startNewRound() {
    state.roundProgress = 0;
    // Mantemos o nível, mas focamos na UI nova
    if (DOM.levelDisplayEl) {
        DOM.levelDisplayEl.textContent = state.level;
        DOM.levelDisplayEl.parentElement?.classList.add('hidden'); // esconder o container antigo
    }
    DOM.menuContainer.classList.add('hidden');
    DOM.summaryArea.classList.add('hidden');
    DOM.exerciseArea.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    mostrarNarrativa(); // narrativa por nível
    renderGamificationBar(); // refresca barra
    generateNewExercise();
}

function startExercise(type) {
        if (!type) {
            console.warn('startExercise: type not provided');
            return;
        }
        
        if (uiState.inExercise) {
            console.debug('startExercise ignored: already in exercise', type);
            return;
        }

        // Validar elementos DOM críticos
        if (!DOM.exerciseArea || !DOM.menuContainer) {
            console.error('exerciseArea not found - cannot start exercise');
            return;
        }

        uiState.inExercise = true;
        
        // Restaurar nível guardado
        state.level = loadProgressForType(type) || state.level || 1;
        currentExercise.type = type;

        // Reset progresso transitório
        transientProgress[type] = 0;
        state.roundProgress = 0;
        
        // Mostrar área de exercício
        showExerciseArea();
        updateProgressBar();

        try {
            generateNewExercise();
        } catch (err) {
            console.error('generateNewExercise erro:', err);
            uiState.inExercise = false;
        }
}

// -------------------------------------------------------------------
// Substitui os handlers globais problemáticos por delegates no teclado
// -------------------------------------------------------------------

// Remover os antigos handlers document-level (mousedown/touchstart/click).
DOM.customKeyboard?.removeEventListener('pointerdown', this);
DOM.customKeyboard?.removeEventListener('pointerup', this);

// Mostra o teclado quando o input recebe foco (único listener)
DOM.answerInput.addEventListener('focus', () => {
    DOM.customKeyboard.classList.remove('hidden');
});

// Blur seguro: só esconde se o foco não estiver no teclado e não houver pointer activo
DOM.answerInput.addEventListener('blur', () => {
    setTimeout(() => {
        if (keyboardPointerDown) return; // a interação com a tecla está em curso
        if (!DOM.customKeyboard.contains(document.activeElement)) {
            DOM.customKeyboard.classList.add('hidden');
        }
    }, 50);
});

// Pointer handlers na própria área do teclado — mais fiáveis em touch
DOM.customKeyboard?.addEventListener('pointerdown', (ev) => {
    const key = ev.target.closest('.key');
    if (!key) return;
    // Sinaliza que o utilizador está a interagir com o teclado (evita blur)
    keyboardPointerDown = true;
    // Não prevenir o evento se não necessário; mas prevenir seleções indesejadas
    ev.preventDefault();
});

// -------------------------------------------------------------------
// 4️⃣  Quando a resposta é verificada, esconder o teclado (já estava)
// -------------------------------------------------------------------
function checkAnswer() {
    if (state.answered) return;

    currentExercise.attempts = (currentExercise.attempts || 0) + 1; // NOVO
    const userAnswer = DOM.answerInput.value;
    if (!userAnswer.trim()) {
        DOM.feedbackEl.innerHTML = '⚠️ Por favor, escreve uma resposta.';
        DOM.feedbackEl.className = 'incorrect';
        return;
    }

    const exerciseLogic = exercises[currentExercise.type];
    const isCorrect = exerciseLogic.check(userAnswer, currentExercise.answer, currentExercise.checkType);
    const correctAnswerFormatted = Array.isArray(currentExercise.answer)
        ? currentExercise.answer.join(' x ')
        : currentExercise.answer;

    const responseMs = Date.now() - (state.exerciseStartTs || Date.now());

    if (isCorrect) {
        sounds.correct.currentTime = 0; sounds.correct.play();
        DOM.feedbackEl.innerHTML = '✅ Muito bem! Resposta correta!';
        DOM.feedbackEl.className = 'correct';
        state.score.correct++;
        state.streak++;
        adicionarPontos(10);
        verificarMedalhas({ isCorrect: true, responseMs });
        // feedback já mostrado — o incremento de progresso é feito abaixo (independente do resultado)
    } else {
        sounds.incorrect.currentTime = 0; sounds.incorrect.play();
        DOM.feedbackEl.innerHTML = `❌ Quase! A resposta certa é <strong>${correctAnswerFormatted}</strong>.`;
        DOM.feedbackEl.className = 'incorrect';
        state.score.incorrect++;
        state.streak = 0;
        adicionarPontos(2); // pequeno incentivo por tentativa
        verificarMedalhas({ isCorrect: false, responseMs });
    }

    // Incrementar progresso independentemente de correto/errado — garante número fixo de questões por nível
    transientProgress[currentExercise.type] = (transientProgress[currentExercise.type] || 0) + 1;
    state.roundProgress = transientProgress[currentExercise.type];
    updateScoreDisplay();
    updateProgressBar();

    // Se completou a ronda -> subir de nível e persistir nível para este exercício
    if (state.roundProgress >= (state.exercisesPerRound || 5)) {
        // Incrementa nível e grava
        state.level = (state.level || 1) + 1;
        if (typeof saveProgressForType === 'function' && currentExercise?.type) {
            saveProgressForType(currentExercise.type, state.level);
        }
        // Limpar progresso transitório
        if (currentExercise?.type) transientProgress[currentExercise.type] = 0;
        state.roundProgress = 0;
        updateProgressBar();

        // Confetti / feedback / som / resumo
        try { triggerConfetti?.(); } catch (e) {}
        try { showLevelUpUI(); } catch (e) { console.warn('showLevelUpUI error', e); }
    }

    if (state.roundProgress <= state.explanationLimit) {
        DOM.feedbackEl.innerHTML += `<br><small style="font-weight: normal; opacity: 0.9;">${currentExercise.explanation}</small>`;
    }

    state.answered = true;
    updateScoreDisplay();

    DOM.checkButton.style.display = 'none';
    DOM.nextButton.style.display = 'block';
    DOM.nextButton.focus();

    // Esconde o teclado após verificar a resposta
    DOM.customKeyboard.classList.add('hidden');
}

    // Função invocada quando o utilizador clica em Next: prepara e gera o próximo exercício
    function nextExercise() {
        // Reativar a caixa de resposta e limpar feedback
        DOM.answerInput.classList.remove('hidden');
        DOM.answerInput.value = '';
        try { DOM.answerInput.focus(); } catch (e) { /* silent */ }
        DOM.feedbackEl.textContent = '';

        // Restaurar botões
        DOM.checkButton.style.display = 'block';
        DOM.nextButton.style.display = 'none';

        // Marcar que estamos prontos para nova resposta
        state.answered = false;

        // Gerar novo problema
        generateNewExercise();
    }

// Função para migrar progresso antigo (se existir)
function migrateOldProgress() {
    const old = safeGetItem('citania_progress'); // exemplo de chave antiga
    if (old && !safeGetItem(PROGRESS_KEY)) {
        safeSetItem(PROGRESS_KEY, old);
    }
}
document.addEventListener('DOMContentLoaded', migrateOldProgress);

// -----------------------------------------------------------------------------
// Substituir a declaração duplicada de uiState por reutilização do singleton
// -----------------------------------------------------------------------------

// EM VEZ DISSO reutilizar o uiState global já criado no topo:
// assegura-se que a propriedade existe sem redeclarar a variável
uiState.inExercise = uiState.inExercise || false;

// --- Lógica do Tema (Modo Escuro) ---
function applyTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
        DOM.themeToggleButton.textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        DOM.themeToggleButton.textContent = '🌙';
    }
}

// --- Sons da aplicação ---
// Objecto que armazenará os sons; inicializado por initSounds
const sounds = { correct: null, incorrect: null, levelup: null };

/**
 * Inicializa os objetos de áudio de forma robusta.
 * Tenta pré-carregar os ficheiros se existirem; cria fallbacks silenciosos caso contrário.
 */
function initSounds() {
    try {
        // Verifica a existência com requests HEAD antes de criar os Audio objects para evitar 404s
        const base = './audio';
        const files = { correct: 'correct.mp3', incorrect: 'incorrect.mp3', levelup: 'levelup.mp3' };

        Object.keys(files).forEach(key => {
            const path = `${base}/${files[key]}`;
            // criar objecto Audio pronto a usar; se o ficheiro faltar, fallback será tratado no catch abaixo
            try {
                const a = new Audio(path);
                a.load();
                sounds[key] = a;
            } catch (e) {
                // fallback dummy
                sounds[key] = { play: () => {}, load: () => {} };
            }
        });

        console.log('initSounds: audio objects inicializados');
    } catch (e) {
        console.warn('initSounds falhou, audio desactivado', e);
        // define fallbacks silenciosos
        sounds.correct = sounds.incorrect = sounds.levelup = { play: () => {}, load: () => {} };
    }
}

// --- Inicialização da Aplicação ---

function initApp() {
    // 1. Aplicar tema guardado
    const savedTheme = localStorage.getItem('matematicaAppTheme') || 'light';
    applyTheme(savedTheme);

    // 2. Carregar dados persistidos
    migrateOldProgress();
    // Inline external SVGs so they inherit currentColor
    inlineSvgs().catch(() => {});
    loadGamification();
    renderGamificationBar();
    mostrarNarrativa();

    // 3. Inicializar sons
    initSounds();

    // 4. Configurar todos os event listeners
    // Botão de tema
    DOM.themeToggleButton?.addEventListener('click', () => {
        const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('matematicaAppTheme', currentTheme);
        applyTheme(currentTheme);
    });

    // Cards do menu
    DOM.menuContainer?.addEventListener('click', (ev) => {
        const card = ev.target.closest('.card');
        if (card?.dataset.type) startExercise(card.dataset.type);
    });
    DOM.menuContainer?.addEventListener('keydown', (ev) => {
        const card = ev.target.closest('.card');
        if (card && (ev.key === 'Enter' || ev.key === ' ')) {
            ev.preventDefault();
            if (card.dataset.type) startExercise(card.dataset.type);
        }
    });

    // Botões da área de exercício
    DOM.backButton?.addEventListener('click', exitExercise);
    DOM.checkButton?.addEventListener('click', checkAnswer);
    DOM.nextButton?.addEventListener('click', nextExercise);
    DOM.nextLevelButton?.addEventListener('click', () => {
        state.level++;
        startNewRound();
    });

    // Botão de utilizador
    DOM.userButton?.addEventListener('click', () => {
        const name = (prompt('Escolhe o teu nome:', gamification.userName) || '').trim();
        if (name) {
            gamification.userName = name;
            localStorage.setItem('citaniaUserName', name);
            renderGamificationBar();
            saveGamification();
        }
    });

    // Botão de Achievements (taça) - abre painel deslizante
    const achBtn = document.getElementById('achievements-button');
    achBtn?.addEventListener('click', () => {
        showAchievementsPanel();
    });

    // Teclado personalizado
    DOM.customKeyboard?.addEventListener('pointerup', (ev) => {
        const key = ev.target.closest('.key');
        if (!key) return;
        const value = key.dataset.value;
        if (value === 'delete') {
            DOM.answerInput.value = DOM.answerInput.value.slice(0, -1);
        } else if (value === 'clear') {
            DOM.answerInput.value = '';
        } else if (value === 'enter') {
            checkAnswer();
        } else {
            DOM.answerInput.value += value;
        }
    });

    // 5. Registar Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('/sw.js', { scope: '/' })
                .then(reg => console.log('Service Worker registado:', reg.scope))
                .catch(err => console.log('Falha ao registar o Service Worker:', err));
        });
    }

    // 6. Expor funções para debugging
    window.startExercise = startExercise;

    console.log('App initialized successfully');
}

// Ponto de entrada único da aplicação
document.addEventListener('DOMContentLoaded', initApp);
