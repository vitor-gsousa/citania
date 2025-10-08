# Estratégia de Progressão: Adição e Subtração

## Objetivos Pedagógicos
- Progressão gradual: do simples para o complexo
- Introdução conceptual: "juntar" (adição) antes de "tirar" (subtração)
- Feedback instantâneo: cada resposta gera correção e explicação em linguagem simples
- Reforço positivo: integração com sistema de pontos e medalhas
- Variação controlada: evitar monotonia mantendo previsibilidade didática

## Estrutura de Níveis
| Nível | Limite (max) | Transporte (carry) | Mistura (+/-) | Negativos |
|-------|--------------|--------------------|---------------|-----------|
| 1     | 5            | Não                | Não (só +)    | Não       |
| 2     | 10           | Não                | Raro (- 25%)  | Não       |
| 3     | 20           | Sim                | Parcial       | Não       |
| 4     | 50           | Sim                | Sim (50/50)   | Não       |
| 5     | 100          | Sim                | Sim           | Sim       |

(O nível >5 reutiliza a configuração do nível 5.)

## Geração de Exercícios
Implementado em `js/modules/arithmetic/progression.js`:
```javascript
import { generateAddSub } from 'js/modules/arithmetic/progression.js';
const ex = generateAddSub(level);
```
Retorna:
```js
{
  question: 'Resolve: <span class="op op-add">3 + 4</span>',
  answer: 7,
  explanation: '3 + 4 = 7. Somamos 3 e 4 juntando as unidades.',
  checkType: 'number'
}
```

## Heurísticas de Controlo
- Evitar transporte antes do nível 3: se soma >=10, regenera operandos (níveis baixos)
- Subtração sem negativos até nível 5: troca operandos para garantir a ≥ b
- Mistura de operações ativada progressivamente (`mixed` flag)

## Feedback e Acessibilidade
- Classes visuais: `.op-add` (verde suave) e `.op-sub` (vermelho suave)
- Contrastes validados ~≥ 4.5:1 em ambos os temas
- Texto reforçado com `font-weight:700`

## Integração
No `app.js` foi adicionado ao mapa `exercises` a chave `addSub`:
```js
addSub: {
  generate: (level) => generateAddSub(level),
  check: (userAnswer, correct) => parseInt(userAnswer,10) === correct
}
```
Basta criar um card com `data-type="addSub"` no `index.html` para ativar.

## Extensões Futuras
- Introduzir representação com blocos (visual manipulativo)
- Adicionar modo tempo / desafio
- Expandir para multiplicação e divisão com progressão análoga
- Analytics de erros comuns (ex: inversão em subtrações)

## Licença e Notas
Este módulo segue os princípios descritos em `docs/accessibility-improvements.md` e reutiliza utilitários de aleatoriedade.
