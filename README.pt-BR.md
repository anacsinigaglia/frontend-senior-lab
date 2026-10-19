# Lab Frontend Sênior

[English](README.md) · **Português**

Laboratório de estudo interativo sobre como um frontend sênior pensa. São seis módulos, um por assunto. Em cada um você provoca o problema em experimentos que rodam de verdade no navegador, lê o código por trás (a versão com problema ao lado da versão que funciona), fecha com uma "Leitura de sênior" e termina num roteiro de perguntas ("Como decidir") que leva a uma recomendação para o seu caso.

HTML, CSS e JavaScript puros: sem build e sem dependências (só as fontes do Google Fonts).

Acesse em: https://anacsinigaglia.github.io/frontend-senior-lab/

Versão em inglês: https://anacsinigaglia.github.io/frontend-senior-lab/en/ (o botão **PT | EN** na barra do topo troca o idioma da página atual).

## Módulos

| Módulo | O que você manipula | Decisão |
| --- | --- | --- |
| [Performance](performance.html) | Core Web Vitals (LCP, INP, CLS) medidos ao vivo, e quando usar Lighthouse, aba Performance ou React Profiler; debounce numa busca de clientes; tabela de 50 mil linhas com e sem virtualização; layout thrashing medido em ms | Vale a pena otimizar isso? |
| [Segurança](seguranca.html) | Um comentário com XSS que lê o token; token em localStorage, memória ou cookie httpOnly; links com `javascript:` disfarçado | Onde guardo a autenticação? |
| [Semântica e a11y](semantica.html) | Div com cara de botão contra `<button>` no teclado; o que `type="submit"`, `"button"` ou sem `type` faz num formulário de verdade; o que o leitor de tela anuncia e seus atalhos de navegação; contraste pela regra da WCAG; o que o elemento semântico dá além da acessibilidade (div contra link de verdade) | Qual elemento eu uso? |
| [Arquitetura e estado](arquitetura.html) | Prop drilling, Context ou store: quem renderiza de novo; estado derivado (o total que fica velho e a prop copiada para o estado); cache de servidor entre duas telas e invalidação depois de uma venda | Onde esse estado deve morar? |
| [Qualidade e testes](qualidade.html) | Três booleanos contra um status; testes que quebram na refatoração e testes que deixam o bug passar | Que teste escrevo para isso? |
| [Decisões técnicas](decisoes.html) | Matriz de trade-offs com pesos (Context, Zustand ou Redux Toolkit); gerador de ADR em Markdown; classificar comentários de code review | Essa decisão precisa de um ADR? |

## Como rodar localmente

Abra o `index.html` direto no navegador, ou sirva a pasta com um servidor estático:

```sh
npx serve .
# ou
python3 -m http.server
```

## Estrutura

| Arquivo | O que faz |
| --- | --- |
| `index.html` | Página inicial com os cards dos módulos. Marca como "visitado" os módulos já abertos (lidos do localStorage). |
| `lab.css` | Estilos compartilhados: barra de módulos, bancadas de experimento, blocos de código, painel de decisão e paginação. |
| `lab.js` | Script compartilhado. Expõe `window.Lab` e, ao carregar, lê `data-module` do `<body>` para montar a navegação e marcar o módulo como visitado. |
| `<módulo>.html` | Uma página por módulo, com os experimentos e o roteiro de decisão em um `<script>` próprio no fim da página. |
| `en/` | A versão em inglês: as mesmas páginas, com os mesmos nomes de arquivo, `<html lang="en">` e `lab.css`/`lab.js` carregados de `../`. |

O objeto `window.Lab` contém:

- `LANG`: `'en'` quando o `<html lang>` da página começa com `en`, senão `'pt'`. Define o idioma dos textos compartilhados (navegação, paginação, painel "Como decidir" e botão de copiar).
- `MODULES`: lista ordenada dos módulos (`slug`, `short` em português e `en` em inglês), usada na navegação e na paginação.
- `renderNav(slug)`: preenche `#modnav` (barra do topo) e `#pager` (anterior/próximo).
- Ao carregar, o `lab.js` também adiciona o botão **PT | EN** no fim da barra do topo, apontando para o mesmo arquivo na outra pasta (`en/<arquivo>` ou `../<arquivo>`) e mantendo o `#hash`.
- `decision(root, cfg)`: monta o painel "Como decidir" dentro de `root`.
- `markVisited(slug)` e `store(key, value?)`: leitura e escrita em JSON no localStorage (`store` sem valor lê).
- `copyText(text, btn)`: copia para a área de transferência e dá retorno no botão.
- `$`, `$$` e `esc`: atalhos de `querySelector`, `querySelectorAll` e escape de HTML.

## Como adicionar um módulo

1. Crie `novo.html` copiando a estrutura de uma página existente: `<body data-module="novo">`, `<nav id="modnav">` no topo, `<section id="decidir">` no fim do conteúdo e `<nav id="pager">` depois dele. Carregue `lab.css` e `lab.js`.
2. Adicione `{ slug: 'novo', short: 'Nome curto', en: 'Short name' }` em `MODULES`, no `lab.js`, na posição em que ele deve aparecer na navegação.
3. Adicione um card `<a class="mod" href="novo.html" data-slug="novo">` no `index.html`, com o selo `.pill` de "visitado".
4. Crie também `en/novo.html`, a mesma página traduzida, com `<html lang="en">` e `../lab.css`/`../lab.js`, e adicione o card em `en/index.html`.
5. No script da página, chame `Lab.decision`:

```js
Lab.decision(Lab.$('#decidir'), {
  title: 'Pergunta da decisão?',
  intro: 'Opcional.',
  questions: [
    { id: 'a', text: 'Primeira pergunta?', hint: 'Opcional.',
      options: [{ v: 'sim', label: 'Sim' }, { v: 'nao', label: 'Não' }] },
    { id: 'b', text: 'Só aparece se a = sim', when: (r) => r.a === 'sim',
      options: [{ v: 'x', label: 'X' }, { v: 'y', label: 'Y' }] },
  ],
  decide(r) {
    return { tone: 'warn', title: 'Recomendação', body: '<p>Justificativa.</p>', code: 'opcional' };
  },
});
```

`when` recebe as respostas das perguntas anteriores e esconde a pergunta quando devolve falso. `decide` só é chamada quando todas as perguntas visíveis têm resposta. `tone` é `'good'` (padrão) ou `'warn'`. `title` e `code` são texto (o HTML é escapado); `body` é inserido como HTML.

## Sobre o experimento de XSS

O módulo de Segurança executa de propósito um handler injetado de verdade: no modo `innerHTML`, o `onerror` do comentário malicioso roda no seu navegador e chama uma função da própria página que mostra o alerta. O token gravado em `localStorage` (`access_token`) é falso, criado só para a demonstração, e nada é enviado para fora da página.
