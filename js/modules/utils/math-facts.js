// js/modules/utils/math-facts.js
// Curiosidades matemáticas para substituir a narrativa

const MATH_FACTS = [
  // Curiosidades sobre números
  "Sabia que o número zero foi inventado na Índia por volta do século V? Antes disso, os matemáticos tinham dificuldades com cálculos!",
  "O número Pi (π) tem infinitas casas decimais e nunca se repete. Até hoje, foram calculadas mais de 100 mil milhões de casas decimais!",
  "O número 142857 é mágico: multiplique-o por 2, 3, 4, 5 ou 6 e obterá as mesmas cifras numa ordem diferente!",
  "O número 40 é o único número em português onde as letras aparecem por ordem alfabética: q-u-a-r-e-n-t-a.",
  "O número primo mais pequeno é 2, e é também o único número primo par.",
  "O número 1 não é considerado primo nem composto - é uma categoria especial!",
  "Existe um número chamado 'googol' que é 1 seguido de 100 zeros. O Google foi inspirado neste nome!",
  "O número 9 tem uma propriedade especial: qualquer múltiplo de 9 tem a soma dos seus dígitos também múltipla de 9!",
  "O número 6174 é conhecido como 'constante de Kaprekar' - experimente com qualquer número de 4 dígitos!",
  "O número 153 é narcisista: 1³ + 5³ + 3³ = 153!",
  
  // Sequências e padrões
  "A sequência de Fibonacci aparece na natureza: nas espirais dos caracóis, pétalas de flores e até nos padrões das pinhas!",
  "Os números triangulares (1, 3, 6, 10, 15...) representam pontos organizados em triângulos!",
  "A sequência de Pascal esconde a sequência de Fibonacci nas suas diagonais!",
  "Os números perfeitos são raros: 6, 28, 496... O próximo tem mais de 30 dígitos!",
  
  // História da matemática
  "Os antigos egípcios usavam frações unitárias (1/2, 1/3, 1/4...) para todos os seus cálculos matemáticos.",
  "O teorema de Pitágoras era conhecido pelos babilónios 1000 anos antes de Pitágoras nascer!",
  "A palavra 'álgebra' vem do árabe 'al-jabr', que significa 'reunião de partes quebradas'.",
  "O símbolo de infinito (∞) foi criado pelo matemático John Wallis em 1655.",
  "A palavra 'cálculo' vem do latim 'calculus' que significa 'pedrinha' - os romanos contavam com pedras!",
  "O sinal de igual (=) foi inventado em 1557 por Robert Recorde porque estava cansado de escrever 'é igual a'!",
  "O símbolo % (percentagem) evoluiu da abreviação 'per cento' escrita como 'p cento'.",
  
  // Curiosidades geométricas
  "Numa pizza circular, se cortarmos 4 fatias rectas do centro, cada fatia terá sempre a mesma área!",
  "As abelhas constroem os seus favos em hexágonos porque é a forma que usa menos cera para o máximo espaço.",
  "A espiral logarítmica aparece em galáxias, conchas do nautilus e até nos nossos dedos!",
  "Leonardo da Vinci usava a proporção áurea (1,618...) nas suas pinturas para criar harmonia visual.",
  "Um círculo tem exactamente 360 graus porque os babilónios usavam base 60 e 360 é divisível por muitos números!",
  "O triângulo é a forma mais forte na engenharia - por isso vemos tanto nas pontes!",
  
  // Probabilidade e lógica
  "A probabilidade de duas pessoas numa sala de 23 pessoas fazerem anos no mesmo dia é superior a 50%!",
  "O paradoxo de Monty Hall prova que a intuição pode enganar-nos: trocar de porta aumenta as probabilidades de ganhar!",
  "Se lançarmos uma moeda ao ar 1000 vezes, é quase certo que teremos uma sequência de pelo menos 7 caras seguidas!",
  "Num grupo de apenas 40 pessoas, há 89% de probabilidade de duas fazerem anos no mesmo dia!",
  
  // Dimensões e escalas
  "Se dobrarmos uma folha de papel 42 vezes, a sua espessura chegaria à Lua!",
  "O número de grãos de areia nas praias da Terra é menor que o número de estrelas no universo observável!",
  "Existem mais jogos possíveis de xadrez do que átomos no universo observável!",
  "O cubo de Rubik tem 43.252.003.274.489.856.000 combinações possíveis!",
  "Se caminharmos aleatoriamente numa cidade com quarteirões quadrados, matematicamente acabaremos sempre por voltar ao ponto inicial!",
  
  // Curiosidades divertidas
  "O matemático Ramanujan descobriu que 1729 é o menor número que pode ser expresso como soma de dois cubos de duas formas diferentes!",
  "Zero é o único número que não pode ser representado em numeração romana!",
  "O maior número primo conhecido tem mais de 24 milhões de dígitos!",
  "Multiplicar por zero sempre dá zero, mas dividir por zero é impossível - quebra a matemática!",
  "Os números ímpares somados em sequência dão sempre quadrados perfeitos: 1+3=4, 1+3+5=9, 1+3+5+7=16...",
  
  // Aplicações práticas
  "A matemática ajuda a prever o tempo, mas é tão complexa que pequenas mudanças podem alterar tudo!",
  "Os códigos de barras usam matemática para detectar erros de leitura automaticamente!",
  "A criptografia que protege as nossas passwords baseia-se na dificuldade de factorizar números grandes!",
  "O GPS funciona graças à teoria da relatividade de Einstein - sem ela, teria erros de quilómetros!",
  "Os algoritmos de compressão de imagens usam transformadas matemáticas para reduzir o tamanho dos ficheiros!",
  
  // Curiosidades sobre medição
  "Um googolplex é tão grande que não haveria átomos suficientes no universo para escrever todos os seus zeros!",
  "O metro foi originalmente definido como 1/10.000.000 da distância do equador ao polo norte!",
  "Um nano é tão pequeno que um nanómetro está para um metro como uma bolinha de gude está para a Terra!",
  "Se pudéssemos contar até mil milhões a um número por segundo, levaríamos mais de 31 anos!",
  
  // Curiosidades com vocabulário português correto
  "Em Portugal, mil milhões equivale ao 'billion' americano, mas o nosso bilião são mil milhões de milhões!",
  "Uma centena são 100 unidades, um milhar são 1000, e um milhão são 1000 milhares!",
  "O termo 'algarismo' é usado em português, enquanto outros países dizem 'dígito' - honramos Al-Khwarizmi!",
  "Em Portugal escrevemos números grandes com espaços: 1 000 000 em vez de vírgulas como noutros países.",
  "O nosso sistema decimal usa vírgula para separar decimais: 3,14159... é o Pi em notação portuguesa!"
];

const PORTUGUESE_MATH_TERMS = [
  // Matemáticos portugueses
  "Pedro Nunes (1502-1578), matemático português, inventou o nónio para medições precisas.",
  "José Anastácio da Cunha foi um matemático português pioneiro em análise matemática no século XVIII.",
  "Francisco Gomes Teixeira (1851-1933) foi um dos maiores matemáticos portugueses, especialista em séries.",
  "Ruy Luís Gomes foi um matemático do século XX que muito contribuiu para o ensino da matemática em Portugal.",
  
  // Curiosidades linguísticas
  "Em Portugal, usamos vírgula para decimais (3,14) enquanto outros países usam ponto (3.14).",
  "Os romanos não tinham zero, por isso MCDXLIV (1444) era complicado de calcular!",
  "A palavra portuguesa 'algarismo' vem do matemático árabe Al-Khwarizmi!",
  "O termo 'cifra' vem do árabe 'sifr' que significa 'vazio' - referia-se ao zero!",
  "A palavra 'número' vem do latim 'numerus' que significa 'contar'.",
  
  // História portuguesa
  "Os navegadores portugueses usavam matemática avançada para navegar pelos oceanos no século XV!",
  "A Universidade de Coimbra tem uma das mais antigas escolas de matemática da Europa (1290)!",
  "O astrolábio, usado pelos navegadores portugueses, era um computador analógico matemático!",
  "D. João II, o 'Príncipe Perfeito', era conhecedor de matemática e astronomia.",
  
  // Tradições e sistemas
  "O sistema métrico decimal foi adoptado em Portugal em 1852, relativamente cedo na Europa!",
  "As antigas medidas portuguesas incluíam o 'côvado', 'palmo' e 'braça' - baseadas no corpo humano!",
  "A 'légua' portuguesa equivalia a cerca de 6,6 km - a distância que se percorre a pé numa hora!",
  "O 'real' era a moeda portuguesa e o seu nome vem de 'royal' - matemática nas finanças reais!"
];

/**
 * Calcula o tempo de leitura baseado no comprimento do texto
 * Tempo adequado para crianças: ~150 palavras por minuto
 * @param {string} text - Texto para calcular tempo de leitura
 * @returns {number} Tempo em milissegundos
 */
function calculateReadingTime(text) {
  const wordsPerMinute = 55; // Velocidade de leitura para crianças
  const minimumTime = 10000; // Mínimo 10 segundos
  const maximumTime = 30000; // Máximo 30 segundos

  const wordCount = text.split(' ').length;
  const readingTimeMs = (wordCount / wordsPerMinute) * 60 * 1000;
  
  // Adicionar tempo extra para absorver a informação
  const absorptionTime = readingTimeMs * 1.5;
  
  return Math.max(minimumTime, Math.min(maximumTime, absorptionTime));
}

/**
 * Inicia a rotação automática de curiosidades matemáticas
 * @param {Function} updateCallback - Função chamada a cada rotação
 * @param {boolean} levelBased - Se deve usar curiosidades baseadas no nível
 * @param {number} level - Nível atual (se levelBased for true)
 * @returns {number} ID do intervalo para poder parar depois
 */
export function startFactRotation(updateCallback, levelBased = false, level = 1) {
  let currentFactIndex = 0;
  let timeoutId;
  
  function rotateFact() {
    const fact = levelBased ? getLevelBasedMathFact(level) : getRandomMathFact();
    const readingTime = calculateReadingTime(fact);
    
    updateCallback(fact);
    
    timeoutId = setTimeout(() => {
      rotateFact();
    }, readingTime);
  }
  
  // Começar imediatamente
  rotateFact();
  
  return {
    stop: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
}

/**
 * Inicia rotação de factos aritméticos (para área de exercícios)
 * @param {Function} updateCallback - Função chamada a cada rotação
 * @returns {Object} Objecto com método stop()
 */
export function startArithmeticFactRotation(updateCallback) {
  let timeoutId;
  
  function rotateFact() {
    const fact = getArithmeticFact();
    const readingTime = calculateReadingTime(fact);
    
    updateCallback(fact);
    
    timeoutId = setTimeout(() => {
      rotateFact();
    }, readingTime);
  }
  
  rotateFact();
  
  return {
    stop: () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
}
/**
 * Gera uma curiosidade matemática aleatória
 * @returns {string} Uma curiosidade matemática interessante
 */
export function getRandomMathFact() {
  // Combinar factos gerais com os específicos portugueses
  const allFacts = [...MATH_FACTS, ...PORTUGUESE_MATH_TERMS];
  const randomIndex = Math.floor(Math.random() * allFacts.length);
  return allFacts[randomIndex];
}

/**
 * Gera uma curiosidade matemática baseada no nível atual
 * @param {number} level - Nível atual do jogador
 * @returns {string} Curiosidade adequada ao nível
 */
export function getLevelBasedMathFact(level = 1) {
  const levelBasedFacts = {
    1: [
      "Comece com este facto: o zero é uma das maiores invenções matemáticas da humanidade!",
      "Curiosidade inicial: todos os números pares terminam em 0, 2, 4, 6 ou 8!",
      "Facto interessante: a soma de dois números ímpares é sempre par!",
      "Dica inicial: contar com os dedos foi o primeiro 'computador' da humanidade!",
      "Sabia que: o número 10 é especial porque temos 10 dedos - por isso usamos base 10!",
      "Curiosidade: os números 0, 1, 2, 3... chamam-se 'números naturais' porque aparecem na natureza!"
    ],
    2: [
      "Nível intermédio: o número 7 é considerado o mais 'aleatório' pelos humanos!",
      "Descoberta fascinante: multiplicar por 9 com os dedos é um truque milenar!",
      "Facto curioso: 111.111.111 × 111.111.111 = 12.345.678.987.654.321!",
      "Dica útil: para verificar divisibilidade por 3, some todos os dígitos do número!",
      "Descoberta interessante: todo o número multiplicado por 1 fica igual - o 1 é neutro!",
      "Padrão fascinante: os números da tabuada do 9 têm sempre dígitos que somam 9!"
    ],
    3: [
      "Nível avançado: a conjetura de Goldbach ainda não foi provada após 280 anos!",
      "Descoberta profunda: existem infinitos números primos, provado por Euclides há 2300 anos!",
      "Facto impressionante: o último teorema de Fermat resistiu 358 anos até ser demonstrado!",
      "Mistério matemático: ainda não sabemos se existem infinitos números primos gémeos!",
      "Teoria avançada: a hipótese de Riemann é um dos maiores mistérios da matemática!",
      "Descoberta moderna: os fractais mostram-nos que a matemática cria arte infinitamente bela!"
    ],
    4: [
      "Nível superior: a matemática quântica descreve partículas que estão em vários lugares ao mesmo tempo!",
      "Teoria revolucionária: a relatividade de Einstein provou que o tempo é relativo!",
      "Descoberta incrível: existem diferentes tipos de infinito - uns maiores que outros!",
      "Facto avançado: a teoria dos jogos usa matemática para prever comportamentos humanos!",
      "Mistério profundo: a constante de Euler aparece em probabilidade, geometria e análise!",
      "Aplicação moderna: a inteligência artificial aprende usando derivadas e matrizes!"
    ]
  };

  const levelFacts = levelBasedFacts[Math.min(level, 4)] || levelBasedFacts[1];
  const randomIndex = Math.floor(Math.random() * levelFacts.length);
  return levelFacts[randomIndex];
}

/**
 * Gera uma curiosidade relacionada com aritmética
 * @returns {string} Curiosidade sobre operações aritméticas
 */
export function getArithmeticFact() {
  const arithmeticFacts = [
    "A multiplicação é só adição repetida: 3 × 4 = 3 + 3 + 3 + 3!",
    "Truque rápido: para multiplicar por 11, some os dígitos adjacentes!",
    "Padrão interessante: 9 × qualquer número sempre tem soma de dígitos múltipla de 9!",
    "Facto útil: dividir por 5 é o mesmo que multiplicar por 2 e dividir por 10!",
    "Curiosidade: subtrair é o mesmo que somar o número negativo!",
    "Dica esperta: para multiplicar por 25, multiplique por 100 e divida por 4!",
    "Truque mágico: qualquer número multiplicado por 0 é sempre 0!",
    "Facto interessante: 1 multiplicado por qualquer número deixa-o inalterado!",
    "Padrão útil: somar os dedos numa multiplicação por 9 dá sempre 9!",
    "Descoberta: a ordem na soma não importa: 2+3 = 3+2!",
    "Dica prática: para verificar uma subtração, some o resultado com o que subtraiu!",
    "Truque antigo: contar de 2 em 2 dá-nos todos os números pares!",
    "Facto curioso: todo o número par é divisível por 2!",
    "Padrão divertido: os múltiplos de 5 terminam sempre em 0 ou 5!",
    "Dica de cálculo: para duplicar, é só somar o número a si próprio!"
  ];
  
  const randomIndex = Math.floor(Math.random() * arithmeticFacts.length);
  return arithmeticFacts[randomIndex];
}

export default {
  getRandomMathFact,
  getLevelBasedMathFact,
  getArithmeticFact,
  startFactRotation,
  startArithmeticFactRotation
};