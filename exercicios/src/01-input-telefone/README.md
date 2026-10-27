# 01 · Input de telefone

**Tempo estimado:** 45 a 60 min · **Nível:** médio (o bônus de cursor é avançado)

**Conceitos:** input controlado, função pura separada do componente, `type`/`inputMode`/`autoComplete`, `<label>` e `aria-describedby`, `useId`, tipar props estendendo as do `<input>` (`ComponentPropsWithoutRef` + `Omit`).

## O que construir

Um `<PhoneInput>` que formata o telefone enquanto a pessoa digita, mas entrega **só os dígitos** para quem usa o componente:

```tsx
const [phone, setPhone] = useState('');
<PhoneInput label="Celular" value={phone} onChange={setPhone} hint="Com DDD" />
// tela:   (11) 98765-4321
// estado: '11987654321'
```

> Por que guardar só dígitos? É o que vai para a API e para a validação. A máscara é só apresentação: se o estado guardasse `'(11) 98765-4321'`, todo lugar que lê o valor teria que limpar de novo.

## Como rodar

```sh
npm run dev        # abre a demo no navegador
npm test           # testes em modo watch; vá fazendo passar etapa por etapa
npm run typecheck  # erros de tipo
```

Faça as etapas em ordem. Cada uma tem um `describe` próprio nos testes.

O `typecheck` acusa erro no arquivo de teste até a etapa 5 (ele já passa `name`, `id`… para o componente). É esperado: quando a etapa 5 estiver certa, ele fica limpo.

---

## Etapa 1 · `onlyDigits` (5 min)

Em [formatPhone.ts](formatPhone.ts): devolver só os dígitos do texto, no máximo 11.

<details><summary>Dica</summary>

Uma regex que casa com "tudo que não é dígito" e `.slice`.
</details>

## Etapa 2 · `formatPhone` (15 min)

Também em [formatPhone.ts](formatPhone.ts). Recebe só dígitos e devolve:

| Dígitos | Saída |
| --- | --- |
| `''` | `''` |
| `'1'` | `'(1'` |
| `'11'` | `'(11'` |
| `'119'` | `'(11) 9'` |
| `'113456'` | `'(11) 3456'` |
| `'1134567'` | `'(11) 3456-7'` |
| `'1134567890'` | `'(11) 3456-7890'` (fixo, 10 dígitos) |
| `'11987654321'` | `'(11) 98765-4321'` (celular, 11 dígitos) |

**Regra que importa:** um separador (`) `, `-`) só aparece quando já existe um dígito depois dele. Repare que `'11'` vira `'(11'`, e não `'(11) '`.

<details><summary>Por que essa regra? (pense antes de abrir)</summary>

Imagine que `'11'` virasse `'(11) '`. A pessoa aperta Backspace: o input passa a ter `'(11)'`, o `onChange` limpa para `'11'`, você formata de novo para `'(11) '`… e o Backspace não faz nada. Ela fica presa. Se o separador só aparece com um dígito depois, apagar do fim sempre remove um dígito de verdade.
</details>

<details><summary>Dica de estrutura</summary>

Separe em DDD (`slice(0, 2)`) e o resto. O ponto do hífen depende do total: 11 dígitos → 5 antes do hífen; até 10 → 4.
</details>

## Etapa 3 · Input controlado (10 min)

Em [PhoneInput.tsx](PhoneInput.tsx):

- o `<input>` mostra `formatPhone(value)`;
- no `onChange`, chame a prop `onChange` com `onlyDigits(event.target.value)`.

O componente não tem estado próprio: quem manda é o `value` do pai. Abra a demo e veja o "valor no estado" mudar.

<details><summary>Dica</summary>

Não precisa de `useState` nem `useEffect` aqui. Se você pensou em `useEffect` para "sincronizar" o texto formatado, é exatamente o estado derivado do módulo de Arquitetura: dá para calcular no render.
</details>

## Etapa 4 · Semântica (10 min)

- `<label>` ligado ao input (`htmlFor` + `id`). Use `useId` para gerar o id: dois `PhoneInput` na mesma tela não podem repetir id.
- `type="tel"`: dá significado ao campo (e alguns leitores de tela anunciam).
- `inputMode="numeric"`: abre o teclado numérico no celular. `type="number"` seria errado aqui (aceita `e`, `-`, tem setinhas, descarta zero à esquerda).
- `autoComplete="tel-national"`: o navegador sugere o telefone salvo, sem o `+55`.
- Se vier `hint`, renderize o texto com um `id` e aponte o input para ele com `aria-describedby`. Sem `hint`, nada de `aria-describedby`.

<details><summary>Por que `aria-describedby` e não só um texto embaixo?</summary>

Visualmente o texto está ali, mas o leitor de tela anuncia só o label quando o foco chega no input. Com `aria-describedby`, ele lê "Celular, editar texto, Com DDD". É o mesmo mecanismo que você vai usar para mensagens de erro em formulários.
</details>

## Etapa 5 · Props nativas com TypeScript (10 min)

Quem usar o componente vai querer passar `name`, `required`, `disabled`, `placeholder`, `id`… sem você declarar uma por uma. Faça `PhoneInputProps` estender as props do `<input>`, mas sem `value`, `onChange` e `type` nativos (os seus têm outro tipo ou são fixos).

Teste de tipo: depois da etapa, isto deve dar erro no editor:

```tsx
<PhoneInput label="x" value="" onChange={(e) => e.target.value} />  // e é string, não evento
<PhoneInput label="x" value="" onChange={() => {}} type="text" />    // type não é permitido
```

<details><summary>Dica</summary>

`ComponentPropsWithoutRef<'input'>` (de `react`) e `Omit<Tipo, 'a' | 'b'>`, unidos com `&`. No componente, pegue o que é seu e repasse o resto com `...rest`. Cuidado com a ordem no JSX: `{...rest}` antes das props que você controla, para ninguém sobrescrever `type` ou `value`.
</details>

---

## Bônus (opcionais)

1. **Cursor no meio (avançado).** Na demo, digite um número completo, clique no meio e apague um dígito. O cursor pula para o fim. Por quê? Como corrigir? (Pistas: `selectionStart`, contar quantos dígitos existem antes do cursor, `useLayoutEffect` + `setSelectionRange`.)
2. **Colar com +55.** Cole `+55 11 98765-4321`. O que acontece com `onlyDigits`? Proponha uma regra e escreva o teste.
3. **Validação.** Exporte `isValidPhone(digits): boolean` (10 ou 11 dígitos, celular começando com 9 depois do DDD) e mostre um erro com `aria-invalid` + `aria-describedby`.

## Quando terminar

`npm run test:gabarito` roda os mesmos testes contra a solução de referência em [gabarito/](gabarito/). Compare com a sua só **depois** de passar tudo: diferenças de estilo são normais, o que importa é entender cada escolha.
