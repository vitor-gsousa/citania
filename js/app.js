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
    exerciseCards: document.querySelectorAll('.card')
};

// Efeitos Sonoros
const sounds = {
    correct: new Audio('./audio/correct.mp3'),
    incorrect: new Audio('./audio/incorrect.mp3')
};

let currentExercise = {};
const state = {
    score: { correct: 0, incorrect: 0 },
    answered: false,
    level: 1,
    roundProgress: 0,
    exercisesPerRound: 8,
    explanationLimit: 5
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

// --- Funções Principais da Aplicação ---

function startExercise(type) {
    state.level = 1;
    currentExercise.type = type;
    startNewRound();
}

function startNewRound() {
    state.roundProgress = 0;
    // resetScore(); // A pontuação agora é cumulativa
    DOM.levelDisplayEl.textContent = state.level;
    DOM.levelDisplayEl.parentElement.classList.remove('hidden'); // Mostra o nível
    DOM.menuContainer.classList.add('hidden');
    DOM.summaryArea.classList.add('hidden');
    DOM.exerciseArea.classList.remove('hidden');
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
    currentExercise.checkType = newProblem.checkType; // <-- CORREÇÃO AQUI
    state.answered = false; // Permite que a nova pergunta seja respondida

    // Limpa o estado anterior para o novo exercício
    DOM.feedbackEl.textContent = '';
    DOM.answerInput.value = '';
    DOM.feedbackEl.className = '';
    DOM.answerInput.focus();
    updateProgressBar();
}

function checkAnswer() {
    if (state.answered) return; // Se já respondeu, não faz nada

    const userAnswer = DOM.answerInput.value;
    const exerciseLogic = exercises[currentExercise.type];
    const isCorrect = exerciseLogic.check(userAnswer, currentExercise.answer, currentExercise.checkType);
    const correctAnswerFormatted = Array.isArray(currentExercise.answer) ? currentExercise.answer.join(' x ') : currentExercise.answer;

    if (isCorrect) {
        sounds.correct.currentTime = 0;
        sounds.correct.play();
        DOM.feedbackEl.innerHTML = 'Muito bem! Resposta correta!';
        DOM.feedbackEl.className = 'correct';
        state.score.correct++;
    } else {
        sounds.incorrect.currentTime = 0;
        sounds.incorrect.play();
        DOM.feedbackEl.innerHTML = `Quase! A resposta certa é <strong>${correctAnswerFormatted}</strong>.`;
        DOM.feedbackEl.className = 'incorrect';
        state.score.incorrect++;
    }

    // Adiciona a explicação se estiver na fase de aprendizagem
    if (state.roundProgress <= state.explanationLimit) {
        DOM.feedbackEl.innerHTML += `<br><small style="font-weight: normal;">${currentExercise.explanation}</small>`;
    }

    state.answered = true; // Marca a pergunta como respondida
    updateScoreDisplay();
}

function showMenu() {
    DOM.menuContainer.classList.remove('hidden');
    DOM.levelDisplayEl.parentElement.classList.add('hidden'); // Esconde o nível no menu
    DOM.exerciseArea.classList.add('hidden');
    DOM.summaryArea.classList.add('hidden');
}

function showSummary() {
    DOM.exerciseArea.classList.add('hidden');
    DOM.summaryArea.classList.remove('hidden');
    DOM.summaryRecordMessage.textContent = ''; // Limpa a mensagem de recorde

    // Verifica se o próximo nível será um novo recorde
    const highScores = loadHighScores();
    const currentHighScore = highScores[currentExercise.type] || 0;
    if (state.level + 1 > currentHighScore) {
        DOM.summaryRecordMessage.textContent = '🎉 Novo recorde de nível!';
        triggerConfetti();
    }

    DOM.summaryCorrect.textContent = state.score.correct;
    DOM.summaryTotal.textContent = state.exercisesPerRound;
    saveHighScore(currentExercise.type, state.level); // Salva o nível atual concluído
}

function updateScoreDisplay() {
    DOM.correctCountEl.textContent = state.score.correct;
    DOM.incorrectCountEl.textContent = state.score.incorrect;
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

// Permitir submeter com a tecla "Enter"
DOM.answerInput.addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        // Se a resposta já foi dada, o Enter funciona como "Próximo"
        state.answered ? generateNewExercise() : checkAnswer();
    }
});

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
    DOM.levelDisplayEl.parentElement.classList.add('hidden'); // Garante que o nível começa escondido
    applyTheme(savedTheme);
});
