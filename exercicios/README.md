# Exercícios React + TypeScript

Exercícios curtos (até 1 h cada) para praticar React e TypeScript. Diferente do resto do lab (HTML puro), aqui tem build: Vite, React 19, TypeScript e Vitest.

```sh
cd exercicios
npm install
npm run dev        # demo no navegador
npm test           # testes em modo watch
npm run typecheck  # tsc
npm run test:gabarito  # mesmos testes contra a solução de referência
```

## Como funciona cada exercício

Cada pasta em `src/` tem:

- `README.md`: o enunciado, em etapas, com dicas escondidas em `<details>`;
- os arquivos para você implementar (com `TODO`);
- `*.test.tsx`: os critérios de aceite, um `describe` por etapa;
- `Demo.tsx`: o componente em uso, aberto pelo `npm run dev`;
- `gabarito/`: uma solução de referência. Abra só depois de terminar.

## Exercícios

| # | Exercício | Conceitos |
| --- | --- | --- |
| 01 | [Input de telefone](src/01-input-telefone/README.md) | input controlado, função pura, `inputMode`/`autoComplete`, `useId`, `aria-describedby`, `ComponentPropsWithoutRef` + `Omit` |
