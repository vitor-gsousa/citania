// js/app.js

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
        answerInput.focus();
    }
    if (feedbackEl) feedbackEl.textContent = '';
    state.answered = false;
}

// Função para verificar resposta
function checkAnswer() {
    const answerInput = document.getElementById('answer-input');
    if (!answerInput || state.answered) return;
    const userAnswer = answerInput.value.trim();
    if (!userAnswer) return;

    const exercise = exercises[currentExercise.type];
    const isCorrect = exercise.check(userAnswer, currentExercise.answer, currentExercise.checkType);

    state.answered = true;
    state.score.correct += isCorrect ? 1 : 0;
    state.score.incorrect += !isCorrect ? 1 : 0;

    // Atualizar UI
    const feedbackEl = document.getElementById('feedback');
    if (feedbackEl) {
        feedbackEl.textContent = isCorrect ? 'Correto!' : `Incorreto. ${currentExercise.explanation}`;
        feedbackEl.className = isCorrect ? 'correct' : 'incorrect';
    }

    // Progresso
    if (isCorrect) {
        transientProgress[currentExercise.type] = (transientProgress[currentExercise.type] || 0) + 1;
        state.roundProgress = transientProgress[currentExercise.type];
        updateProgressBar();
        if (state.roundProgress >= state.exercisesPerRound) {
            state.level++;
            saveProgressForType(currentExercise.type, state.level);
            transientProgress[currentExercise.type] = 0;
            state.roundProgress = 0;
            updateProgressBar();
            triggerConfetti();
            showLevelUpUI();
        } else {
            // Próximo exercício
            setTimeout(generateNewExercise, 1000);
        }
    }
}

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

// Função para mostrar UI de level up
function showLevelUpUI() {
    // Implementação stub
    console.log('Level up UI shown');
}

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
    if (exercise) exercise.classList.add('hidden');
    if (menu) menu.classList.remove('hidden');
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
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}
function lcm(a, b) {
    return (a === 0 || b === 0) ? 0 : Math.abs(a * b) / gcd(a, b);
}
function isPrime(num) {
    if (num <= 1) return false;
    for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
        if (num % i === 0) return false;
    }
    return true;
}
function getPrimeFactors(num) {
    const factors = [];
    let divisor = 2;
    while (num >= 2) {
        if (num % divisor === 0) {
            factors.push(divisor);
            num = num / divisor;
        } else {
            divisor++;
        }
    }
    return factors;
}

// --- Animações / Sons / Gamificação (mantidos) ---

// Objeto para armazenar os sons da aplicação
const sounds = {
    correct: null,
    incorrect: null,
    levelup: null
};

// Função para inicializar os objetos de áudio
function initSounds() {
    try {
        // Caminhos baseados na estrutura do projeto (README.md)
        sounds.correct = new Audio('./audio/correct.mp3');
        sounds.incorrect = new Audio('./audio/incorrect.mp3');
        sounds.levelup = new Audio('./audio/levelup.mp3');

        // Pré-carregar os sons para evitar atrasos na primeira reprodução
        Object.values(sounds).forEach(sound => sound?.load());
        console.log('Audio sounds initialized successfully.');
    } catch (e) {
        console.error('Could not initialize sounds. Audio playback will be disabled.', e);
        // Criar objetos dummy para evitar erros de `play()` se a inicialização falhar
        sounds.correct = sounds.incorrect = sounds.levelup = { play: () => {}, load: () => {} };
    }
}

function triggerConfetti() {
    if (typeof confetti !== 'function') return; // fallback silencioso

    // toca som de level up (se existir) assim que os confettis começam
    try { sounds.levelup?.play?.(); } catch (e) { /* silencioso */ }

    const duration = 2 * 1000; // 2 segundos
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
    }, 250);
}

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
    if (DOM.badgesStripEl) {
        DOM.badgesStripEl.innerHTML = gamification.medalhas
            .map(b => `<span class="badge" title="${b.label}">${b.emoji}</span>`)
            .join('');
    }
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

    // Inserir placeholder / animação junto da gamification bar
    const wrapper = document.createElement('div');
    wrapper.className = 'lottie-placeholder badge-earned';
    const target = DOM.badgesStripEl || document.getElementById('medalhas');
    if (!target) return;

    // Se existir um ficheiro lottie em /animations/{badge.id}.json, tenta carregar
    const lottiePath = `./animations/${badge.id}.json`;
    fetch(lottiePath, { method: 'HEAD' }).then(resp => {
        if (!resp.ok) {
            // fallback: adiciona SVG pequeno inline e anima CSS
            wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
            target.insertBefore(wrapper, target.firstChild);
            return;
        }
        // Carrega lottie e anima
        ensureLottie().then(lottie => {
            target.insertBefore(wrapper, target.firstChild);
            lottie.loadAnimation({
                container: wrapper,
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: lottiePath
            });
        }).catch(() => {
            // fallback SVG
            wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
            target.insertBefore(wrapper, target.firstChild);
        });
    }).catch(() => {
        wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
        target.insertBefore(wrapper, target.firstChild);
    });
}

function awardBadge(badge) {
    if (hasBadge(badge.id)) return;
    gamification.medalhas.push(badge);
    mostrarFeedbackGamificacao(`Medalha conquistada: ${badge.label}!`);
    renderGamificationBar();
    saveGamification();

    const wrapper = document.createElement('div');
    wrapper.className = 'lottie-placeholder badge-earned';
    const target = DOM.badgesStripEl || document.getElementById('medalhas');
    if (!target) return;

    const lottiePath = `./animations/${badge.id}.json`;

    // Verifica existência do ficheiro Lottie e tenta animar, senão fallback
    fetch(lottiePath, { method: 'HEAD' }).then(resp => {
        if (!resp.ok) {
            // fallback inline SVG
            wrapper.innerHTML = `<svg class="badge-svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 2l2.2 4.5L19 8l-3.5 3.4L16 17l-4-2.1L8 17l.5-5.6L5 8l4.8-1.5L12 2z" fill="currentColor"/></svg>`;
            target.insertBefore(wrapper, target.firstChild);
            return;
        }
        ensureLottie().then(lottie => {
            target.insertBefore(wrapper, target.firstChild);
            lottie.loadAnimation({
                container: wrapper,
                renderer: 'svg',
                loop: false,
                autoplay: true,
                path: lottiePath
            });
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

        // Incrementa progresso transitório e global do state
        transientProgress[currentExercise.type] = (transientProgress[currentExercise.type] || 0) + 1;
        state.roundProgress = transientProgress[currentExercise.type];
        updateScoreDisplay(); // pontuação total, etc.
        updateProgressBar();

        // Se completou a ronda -> subir de nível e persistir nível para este exercício
        if (state.roundProgress >= (state.exercisesPerRound || 5)) {
            // Incrementa nível e grava
            state.level = (state.level || 1) + 1;
            if (typeof saveProgressForType === 'function') {
                saveProgressForType(currentExercise.type, state.level);
            }
            // Limpar progresso transitório
            transientProgress[currentExercise.type] = 0;
            state.roundProgress = 0;
            updateProgressBar();

            // Trigger resumo / confetti / level up flow
            triggerConfetti();
            showLevelUpUI?.(); // chama rotina existente para mostrar summary/nivel
        } else {
            // continuar a próxima questão
            // gerar próximo exercício ou permitir botão Next
            generateNewExercise();
        }
    } else {
        sounds.incorrect.currentTime = 0; sounds.incorrect.play();
        DOM.feedbackEl.innerHTML = `❌ Quase! A resposta certa é <strong>${correctAnswerFormatted}</strong>.`;
        DOM.feedbackEl.className = 'incorrect';
        state.score.incorrect++;
        state.streak = 0;
        adicionarPontos(2); // pequeno incentivo por tentativa
        verificarMedalhas({ isCorrect: false, responseMs });
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

// --- Inicialização da Aplicação ---

function initApp() {
    // 1. Aplicar tema guardado
    const savedTheme = localStorage.getItem('matematicaAppTheme') || 'light';
    applyTheme(savedTheme);

    // 2. Carregar dados persistidos
    migrateOldProgress();
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
    DOM.nextButton?.addEventListener('click', generateNewExercise);
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
