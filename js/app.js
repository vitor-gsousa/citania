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
    userNameEl: document.getElementById('user-name')
};

// Efeitos Sonoros (stub + lazy init)
const sounds = {
    correct: { play: () => Promise.resolve(), currentTime: 0 },
    incorrect: { play: () => Promise.resolve(), currentTime: 0 }
};

async function initSounds() {
    const urls = ['./audio/correct.mp3', './audio/incorrect.mp3'];
    const exists = await Promise.all(
        urls.map(u => fetch(u, { method: 'HEAD' }).then(r => r.ok).catch(() => false))
    );
    if (exists[0]) {
        sounds.correct = new Audio(urls[0]);
        sounds.correct.addEventListener('error', () => { sounds.correct.play = () => Promise.resolve(); });
    }
    if (exists[1]) {
        sounds.incorrect = new Audio(urls[1]);
        sounds.incorrect.addEventListener('error', () => { sounds.incorrect.play = () => Promise.resolve(); });
    }
}

let currentExercise = {};
const state = {
    score: { correct: 0, incorrect: 0 },
    answered: false,
    level: 1,
    roundProgress: 0,
    exercisesPerRound: 8,
    explanationLimit: 5,
    // NOVO: tempo e série
    exerciseStartTs: 0,
    streak: 0
};

// Função para gerar um número aleatório dentro de um intervalo
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// --- Lógica dos Exercícios ---

const exercises = {
    fractionToDecimal: {
        generate: (level) => {
            let numerator, denominator;
            const maxNum = 10 + level * 2; // Aumenta a complexidade com o nível
            // Gera uma fração que não seja um número inteiro
            do {
                numerator = getRandomInt(1, maxNum - 1);
                denominator = getRandomInt(2, maxNum);
            } while (numerator % denominator === 0);

            DOM.questionEl.textContent = `Quanto é ${numerator}/${denominator} em decimal? (arredonda às centésimas)`;
            return {
                answer: (numerator / denominator).toFixed(2),
                explanation: `Para converter ${numerator}/${denominator} para decimal, divide-se o numerador (${numerator}) pelo denominador (${denominator}). O resultado é ${numerator / denominator}, que arredondado às centésimas fica ${(numerator / denominator).toFixed(2)}.`
            };
        },
        check: (userAnswer, correctAnswer) => {
            // Permite vírgula ou ponto como separador decimal
            const formattedUserAnswer = parseFloat(userAnswer.replace(',', '.').trim()).toFixed(2);
            return formattedUserAnswer === correctAnswer;
        }
    },
    primeFactorization: {
        generate: (level) => {
            // Gera um número composto entre 10 e 100
            let number;
            const minNum = 10 + (level - 1) * 10;
            const maxNum = 100 + (level - 1) * 20;
            do {
                number = getRandomInt(minNum, maxNum);
            } while (isPrime(number));

            const factors = getPrimeFactors(number);
            DOM.questionEl.textContent = `Decompõe o número ${number} em fatores primos. (ex: 2 x 2 x 3)`;
            return {
                answer: factors, // A resposta é um array de fatores
                explanation: `Para decompor ${number}, dividimos sucessivamente por números primos: ${factors.join(' x ')}.`
            };
        },
        check: (userAnswer, correctAnswerArray) => {
            // Extrai os números da resposta do utilizador
            const userFactors = userAnswer.match(/\d+/g)?.map(Number).sort((a, b) => a - b) || [];
            
            // Compara os arrays de fatores (independentemente da ordem)
            return JSON.stringify(userFactors) === JSON.stringify(correctAnswerArray.sort((a, b) => a - b));
        }
    },
    gcd: { // Máximo Divisor Comum
        generate: (level) => {
            const factor = getRandomInt(2, 5 + level);
            const num1 = factor * getRandomInt(2, 5 + level);
            const num2 = factor * getRandomInt(2, 5 + level);
            DOM.questionEl.textContent = `Qual é o Máximo Divisor Comum (MDC) entre ${num1} e ${num2}?`;
            const answer = gcd(num1, num2);
            return {
                answer: answer,
                explanation: `O MDC é o maior número que divide ${num1} e ${num2} sem deixar resto. Neste caso, a resposta é ${answer}.`
            };
        },
        check: (userAnswer, correctAnswer) => {
            return parseInt(userAnswer.trim()) === correctAnswer;
        }
    },
    lcm: { // Mínimo Múltiplo Comum
        generate: (level) => {
            const num1 = getRandomInt(2, 10 + level);
            const num2 = getRandomInt(2, 10 + level);
            DOM.questionEl.textContent = `Qual é o Mínimo Múltiplo Comum (MMC) entre ${num1} e ${num2}?`;
            const answer = lcm(num1, num2);
            return {
                answer: answer,
                explanation: `O MMC é o menor número que é múltiplo de ${num1} e de ${num2}. A resposta é ${answer}. Uma forma de calcular é (num1 * num2) / MDC(num1, num2).`
            };
        },
        check: (userAnswer, correctAnswer) => {
            return parseInt(userAnswer.trim()) === correctAnswer;
        }
    },
    powerMultiplication: {
        generate: (level) => {
            // 50% de hipótese de ter bases diferentes
            if (Math.random() < 0.5) {
                // Bases iguais (regra aplica-se)
                const base = getRandomInt(2, 5 + level);
                const exp1 = getRandomInt(2, 5 + level);
                const exp2 = getRandomInt(2, 5 + level);
                const finalExp = exp1 + exp2;

                DOM.questionEl.innerHTML = `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &times; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`;
                return {
                    answer: `${base}^${finalExp}`,
                    explanation: `Para multiplicar potências com a mesma base, mantém-se a base (${base}) e somam-se os expoentes (${exp1} + ${exp2} = ${finalExp}).`,
                    checkType: 'string'
                };
            } else {
                // Bases diferentes (regra não se aplica)
                let base1 = getRandomInt(2, 5);
                let base2 = getRandomInt(2, 5);
                if (base1 === base2) base2++; // Garante que são diferentes
                const exp1 = getRandomInt(2, 3);
                const exp2 = getRandomInt(2, 3);
                const result = Math.pow(base1, exp1) * Math.pow(base2, exp2);

                DOM.questionEl.innerHTML = `Qual é o resultado de <strong>${base1}<sup>${exp1}</sup> &times; ${base2}<sup>${exp2}</sup></strong>?`;
                return {
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
            // Default to string check for power format
            return userAnswer.replace(/\s/g, '') === correctAnswer;
        }
    },
    powerDivision: {
        generate: (level) => {
            const base = getRandomInt(2, 5 + level);
            const exp1 = getRandomInt(3, 8 + level);
            const exp2 = getRandomInt(2, exp1 - 1); // Garante que exp1 > exp2 para resultado positivo
            const finalExp = exp1 - exp2;

            DOM.questionEl.innerHTML = `Qual é o resultado de <strong>${base}<sup>${exp1}</sup> &divide; ${base}<sup>${exp2}</sup></strong>? <br><small>(responda na forma de potência, ex: 2^5)</small>`;
            const answer = `${base}^${finalExp}`;
            return {
                answer: answer,
                explanation: `Para dividir potências com a mesma base, mantém-se a base (${base}) e subtraem-se os expoentes (${exp1} - ${exp2} = ${finalExp}).`
            };
            // Nota: A divisão com bases diferentes pode resultar em decimais,
            // o que pode ser complexo para este nível. Mantemos apenas com bases iguais por agora.
        },
        check: (userAnswer, correctAnswer) => {
            return userAnswer.replace(/\s/g, '') === correctAnswer;
        }
    }
};

// --- Funções de Apoio para os Exercícios ---

// Função para calcular o Máximo Divisor Comum (usando o algoritmo de Euclides)
function gcd(a, b) {
    while (b) {
        [a, b] = [b, a % b];
    }
    return a;
}

// Função para calcular o Mínimo Múltiplo Comum
function lcm(a, b) {
    // A fórmula é |a * b| / mdc(a, b)
    // Se a ou b for 0, o MMC é 0.
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

// --- Funções de Animação ---

function triggerConfetti() {
    if (typeof confetti !== 'function') return; // fallback silencioso
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

function safeGetItem(key) { try { return localStorage.getItem(key); } catch { return null; } }
function safeSetItem(key, value) { try { localStorage.setItem(key, value); } catch {} }

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

function startExercise(type) {
    state.level = 1;
    currentExercise.type = type;
    startNewRound();
}

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

function generateNewExercise() {
    if (state.roundProgress >= state.exercisesPerRound) {
        showSummary();
        return;
    }

    state.roundProgress++;
    const exerciseLogic = exercises[currentExercise.type];
    const newProblem = exerciseLogic.generate(state.level);
    currentExercise.answer = newProblem.answer;
    currentExercise.explanation = newProblem.explanation;
    currentExercise.checkType = newProblem.checkType;
    state.answered = false;

    // Limpa o estado anterior
    DOM.feedbackEl.textContent = '';
    DOM.answerInput.value = '';
    DOM.feedbackEl.className = '';
    
    // Mostra o botão verificar e esconde o próximo
    DOM.checkButton.style.display = 'block';
    DOM.nextButton.style.display = 'none';
    
    // Foca no input
    DOM.answerInput.focus();
    
    // Antes de apresentar a nova questão, prepara o tracking
    currentExercise.attempts = 0; // NOVO: contar tentativas
    state.exerciseStartTs = Date.now(); // NOVO: medir rapidez

    updateProgressBar();
}

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
}

function showMenu() {
    // Esconde exercício e resumo primeiro
    DOM.exerciseArea.classList.add('hidden');
    DOM.summaryArea.classList.add('hidden');

    // Mostra o menu
    DOM.menuContainer.classList.remove('hidden');

    // Evita erro quando #level-display não existe
    DOM.levelDisplayEl?.parentElement?.classList.add('hidden');

    // Limpa UI do exercício
    if (DOM.feedbackEl) DOM.feedbackEl.textContent = '';
    if (DOM.answerInput) DOM.answerInput.value = '';
    if (DOM.checkButton) DOM.checkButton.style.display = 'block';
    if (DOM.nextButton) DOM.nextButton.style.display = 'none';

    // Reset do scroll
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSummary() {
    DOM.exerciseArea.classList.add('hidden');
    DOM.summaryArea.classList.remove('hidden');
    DOM.summaryRecordMessage.textContent = '';

    updateNextLevelDisplay();

    const highScores = loadHighScores();
    const currentHighScore = highScores[currentExercise.type] || 0;
    if (state.level + 1 > currentHighScore) {
        DOM.summaryRecordMessage.textContent = '🎉 Novo recorde de nível!';
        triggerConfetti();
    }

    DOM.summaryCorrect.textContent = state.score.correct;
    DOM.summaryTotal.textContent = state.exercisesPerRound;

    saveHighScore(currentExercise.type, state.level);

    // Atualiza leaderboard com a pontuação atual
    atualizarLeaderboard();
    mostrarLeaderboard();

    // Atualiza narrativa e medalhas no resumo
    mostrarNarrativa();
    renderGamificationBar();
}

// Função para mostrar leaderboard (pode ser chamada no resumo)
function mostrarLeaderboard() {
    const leaderboardEl = document.getElementById('leaderboard');
    if (!leaderboardEl) return;
    leaderboardEl.innerHTML = '<h3>🏆 Ranking</h3>' +
        (gamification.leaderboard.map((entry, i) =>
            `<div>${i + 1}. ${entry.nome} — ${entry.pontos} pts (Nível ${entry.nivel})</div>`
        ).join('') || '<div>Sem registos…</div>');
}

// Função para mostrar narrativa/missão
function mostrarNarrativa() {
    gamification.narrativa = narrativaPorNivel(state.level);
    const narrativaEl = document.getElementById('narrativa');
    if (narrativaEl) narrativaEl.textContent = gamification.narrativa;
    saveGamification();
}

function updateScoreDisplay() {
    if (DOM.correctCountEl) DOM.correctCountEl.textContent = state.score.correct;
    if (DOM.incorrectCountEl) DOM.incorrectCountEl.textContent = state.score.incorrect;
}

function updateProgressBar() {
    const progressPercentage = ((state.roundProgress - 1) / state.exercisesPerRound) * 100;
    DOM.progressBar.style.width = `${progressPercentage}%`;
}

function resetScore() {
    state.score.correct = 0;
    state.score.incorrect = 0;
    updateScoreDisplay();
}

// Event Listeners
DOM.exerciseCards.forEach(card => {
    card.addEventListener('click', () => {
        startExercise(card.dataset.type);
    });
});

DOM.backButton.addEventListener('click', showMenu);
DOM.checkButton.addEventListener('click', checkAnswer);
DOM.nextButton.addEventListener('click', generateNewExercise);
DOM.nextLevelButton.addEventListener('click', () => {
    state.level++;
    startNewRound();
});

// 1) Adicionar evento para definir o nome (persistido)
DOM.userButton?.addEventListener('click', () => {
    const name = (prompt('Escolhe o teu nome:', gamification.userName) || '').trim();
    if (!name) return;
    gamification.userName = name;
    localStorage.setItem('citaniaUserName', name);
    renderGamificationBar();
    saveGamification();
});

// Substitui o listener do botão verificar:
DOM.checkButton.removeEventListener?.('click', checkAnswer); // no-op se não existir
const vibratePref = safeGetItem('citaniaVibrate') === 'on';
DOM.checkButton.addEventListener('click', vibratePref ? checkAnswerWithVibration : checkAnswer);

// Função para atualizar o display do próximo nível
function updateNextLevelDisplay() {
    const nextLevelSpan = document.getElementById('next-level-number');
    if (nextLevelSpan) {
        nextLevelSpan.textContent = state.level + 1;
    }
}
// Permitir submeter com a tecla "Enter"
function vibrateDevice(pattern) {
    if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
    }
}

function checkAnswerWithVibration() {
    checkAnswer();
    
    if (state.answered) {
        const isCorrect = DOM.feedbackEl.classList.contains('correct');
        vibrateDevice(isCorrect ? [50] : [100, 50, 100]);
    }
}

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

DOM.themeToggleButton.addEventListener('click', () => {
    const currentTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem('matematicaAppTheme', currentTheme);
    applyTheme(currentTheme);
});

// Aplicar o tema guardado ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('matematicaAppTheme') || 'light';
    DOM.levelDisplayEl?.parentElement?.classList.add('hidden');
    applyTheme(savedTheme);

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker
                .register('sw.js', { scope: './' })
                .then(reg => console.log('Service Worker registado:', reg.scope))
                .catch(err => console.log('Falha ao registar o Service Worker:', err));
        });
    }

    // Carregar gamificação persistida
    loadGamification();
    renderGamificationBar();
    mostrarNarrativa();

    // Iniciar sons (evita 404 se não existirem)
    initSounds();

    // Acessibilidade nos cards
    document.querySelectorAll('.card').forEach(card => {
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                startExercise(card.dataset.type);
            }
        });
    });
});
