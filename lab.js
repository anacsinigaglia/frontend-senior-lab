(function () {
  const LANG = document.documentElement.lang.toLowerCase().startsWith('en') ? 'en' : 'pt';

  const MODULES = [
    { slug: 'performance', short: 'Performance', en: 'Performance' },
    { slug: 'carregamento', short: 'Carregamento e rede', en: 'Loading & network' },
    { slug: 'renderizacao', short: 'Renderização e cache', en: 'Rendering & caching' },
    { slug: 'seguranca', short: 'Segurança', en: 'Security' },
    { slug: 'semantica', short: 'Semântica e a11y', en: 'Semantics & a11y' },
    { slug: 'arquitetura', short: 'Arquitetura e estado', en: 'Architecture & state' },
    { slug: 'qualidade', short: 'Qualidade e testes', en: 'Quality & testing' },
    { slug: 'decisoes', short: 'Decisões técnicas', en: 'Technical decisions' },
  ];
  const label = (m) => (LANG === 'en' ? m.en : m.short);

  /* Textos compartilhados. As páginas em inglês ficam em en/, com os mesmos nomes de arquivo. */
  const TEXT = {
    pt: {
      prev: 'Anterior', next: 'Próximo', home: 'Início', allModules: 'Todos os módulos', end: 'Fim', backHome: 'Voltar ao início',
      howToDecide: 'Como decidir', recommendation: 'Recomendação', restart: 'Recomeçar',
      missing: (n) => (n === 1 ? 'Falta 1 resposta' : `Faltam ${n} respostas`) + ' para a recomendação aparecer aqui.',
      copied: 'Copiado', copyFallback: 'Selecione o texto e copie', language: 'Idioma',
    },
    en: {
      prev: 'Previous', next: 'Next', home: 'Home', allModules: 'All modules', end: 'End', backHome: 'Back to start',
      howToDecide: 'How to decide', recommendation: 'Recommendation', restart: 'Start over',
      missing: (n) => (n === 1 ? '1 answer left' : `${n} answers left`) + ' before the recommendation shows up here.',
      copied: 'Copied', copyFallback: 'Select the text and copy it', language: 'Language',
    },
  };
  const t = TEXT[LANG];

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(localStorage.getItem(key));
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }

  function markVisited(slug) {
    const v = store('lab-visited') || {};
    v[slug] = true;
    store('lab-visited', v);
  }

  function renderNav(current) {
    const nav = $('#modnav');
    if (nav) {
      nav.innerHTML = MODULES.map((m) =>
        `<a href="${m.slug}.html"${m.slug === current ? ' aria-current="page"' : ''}>${label(m)}</a>`).join('');
    }
    const pager = $('#pager');
    if (pager) {
      const i = MODULES.findIndex((m) => m.slug === current);
      const prev = MODULES[i - 1], next = MODULES[i + 1];
      pager.innerHTML =
        (prev ? `<a href="${prev.slug}.html"><small>${t.prev}</small><span>${label(prev)}</span></a>` : `<a href="index.html"><small>${t.home}</small><span>${t.allModules}</span></a>`) +
        (next ? `<a class="next" href="${next.slug}.html"><small>${t.next}</small><span>${label(next)}</span></a>` : `<a class="next" href="index.html"><small>${t.end}</small><span>${t.backHome}</span></a>`);
    }
  }

  async function copyText(text, btn) {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = t.copied;
    } catch (e) {
      btn.textContent = t.copyFallback;
    }
    setTimeout(() => { btn.textContent = original; }, 1800);
  }

  /* Roteiro de decisão: perguntas com visibilidade condicional (when) e uma função decide() que devolve a recomendação. */
  function decision(root, cfg) {
    const answers = {};
    const uid = root.id || 'd' + Math.random().toString(36).slice(2, 7);
    root.classList.add('decide');
    root.innerHTML = `
      <div class="decide-head">
        <p class="eyebrow">${t.howToDecide}</p>
        <h2>${cfg.title}</h2>
        ${cfg.intro ? `<p class="lede">${cfg.intro}</p>` : ''}
      </div>
      <div class="decide-body"><div class="qs"></div><div class="verdict" aria-live="polite"></div></div>`;
    const qs = $('.qs', root), out = $('.verdict', root);

    function visible() {
      const clean = {}, vis = [];
      for (const q of cfg.questions) {
        if (q.when && !q.when(clean)) continue;
        vis.push(q);
        if (answers[q.id] !== undefined) clean[q.id] = answers[q.id];
      }
      for (const k of Object.keys(answers)) if (!(k in clean)) delete answers[k];
      return vis;
    }

    function render(focusId) {
      const vis = visible();
      qs.innerHTML = vis.map((q, i) => `
        <fieldset class="q">
          <legend><span class="q-n">${i + 1}</span><span>${q.text}</span></legend>
          ${q.hint ? `<p class="q-hint">${q.hint}</p>` : ''}
          <div class="opts">${q.options.map((o) => `
            <label class="opt"><input type="radio" id="${uid}-${q.id}-${o.v}" name="${uid}-${q.id}" value="${o.v}"${answers[q.id] === o.v ? ' checked' : ''}><span>${o.label}</span></label>`).join('')}
          </div>
        </fieldset>`).join('');
      const missing = vis.filter((q) => answers[q.id] === undefined).length;
      if (missing) {
        out.className = 'verdict pending';
        out.innerHTML = `<p class="eyebrow">${t.recommendation}</p><p>${t.missing(missing)}</p>`;
      } else {
        const r = cfg.decide(answers);
        out.className = 'verdict ' + (r.tone || 'good');
        out.innerHTML = `<p class="eyebrow">${t.recommendation}</p><h3>${esc(r.title)}</h3>${r.body}${r.code ? `<pre class="code">${esc(r.code)}</pre>` : ''}<button type="button" class="btn ghost small" data-reset>${t.restart}</button>`;
      }
      if (focusId) document.getElementById(focusId)?.focus();
    }

    qs.addEventListener('change', (e) => {
      const t = e.target;
      if (t.type !== 'radio') return;
      answers[t.name.slice(uid.length + 1)] = t.value;
      render(t.id);
    });
    out.addEventListener('click', (e) => {
      if (!e.target.closest('[data-reset]')) return;
      for (const k of Object.keys(answers)) delete answers[k];
      render();
      $('input', qs)?.focus();
    });
    render();
  }

  /* Botão PT | EN na barra do topo: leva para a mesma página no outro idioma. */
  function renderLangSwitch() {
    const bar = $('.topbar .wrap');
    if (!bar) return;
    const file = location.pathname.split('/').pop() || 'index.html';
    const hrefs = LANG === 'en'
      ? { pt: '../' + file, en: file }
      : { pt: file, en: 'en/' + file };
    const nav = document.createElement('nav');
    nav.className = 'lang';
    nav.setAttribute('aria-label', t.language);
    nav.innerHTML = [['pt', 'PT', 'pt-BR', 'Português'], ['en', 'EN', 'en', 'English']].map(([code, text, hreflang, name]) =>
      `<a href="${hrefs[code]}${location.hash}" hreflang="${hreflang}" lang="${hreflang}" title="${name}"${code === LANG ? ' aria-current="true"' : ''}>${text}</a>`).join('');
    bar.appendChild(nav);
  }

  window.Lab = { LANG, MODULES, $, $$, esc, store, markVisited, renderNav, copyText, decision };

  renderLangSwitch();
  const page = document.body.dataset.module;
  if (page) { renderNav(page); markVisited(page); }
})();
