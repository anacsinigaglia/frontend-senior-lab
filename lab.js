(function () {
  const MODULES = [
    { slug: 'performance', short: 'Performance' },
    { slug: 'seguranca', short: 'Segurança' },
    { slug: 'semantica', short: 'Semântica e a11y' },
    { slug: 'arquitetura', short: 'Arquitetura e estado' },
    { slug: 'qualidade', short: 'Qualidade e testes' },
    { slug: 'decisoes', short: 'Decisões técnicas' },
  ];

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
        `<a href="${m.slug}.html"${m.slug === current ? ' aria-current="page"' : ''}>${m.short}</a>`).join('');
    }
    const pager = $('#pager');
    if (pager) {
      const i = MODULES.findIndex((m) => m.slug === current);
      const prev = MODULES[i - 1], next = MODULES[i + 1];
      pager.innerHTML =
        (prev ? `<a href="${prev.slug}.html"><small>Anterior</small><span>${prev.short}</span></a>` : `<a href="index.html"><small>Início</small><span>Todos os módulos</span></a>`) +
        (next ? `<a class="next" href="${next.slug}.html"><small>Próximo</small><span>${next.short}</span></a>` : `<a class="next" href="index.html"><small>Fim</small><span>Voltar ao início</span></a>`);
    }
  }

  async function copyText(text, btn) {
    const original = btn.textContent;
    try {
      await navigator.clipboard.writeText(text);
      btn.textContent = 'Copiado';
    } catch (e) {
      btn.textContent = 'Selecione o texto e copie';
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
        <p class="eyebrow">Como decidir</p>
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
        out.innerHTML = `<p class="eyebrow">Recomendação</p><p>${missing === 1 ? 'Falta 1 resposta' : `Faltam ${missing} respostas`} para a recomendação aparecer aqui.</p>`;
      } else {
        const r = cfg.decide(answers);
        out.className = 'verdict ' + (r.tone || 'good');
        out.innerHTML = `<p class="eyebrow">Recomendação</p><h3>${esc(r.title)}</h3>${r.body}${r.code ? `<pre class="code">${esc(r.code)}</pre>` : ''}<button type="button" class="btn ghost small" data-reset>Recomeçar</button>`;
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

  window.Lab = { MODULES, $, $$, esc, store, markVisited, renderNav, copyText, decision };

  const page = document.body.dataset.module;
  if (page) { renderNav(page); markVisited(page); }
})();
