// Loaded on demand by the import() experiment in carregamento.html (pt and en).
const DATA = [32, 45, 38, 52, 61, 49, 70, 66, 74, 81, 77, 90];
const MONTHS = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
const TITLE = { pt: 'Receita por mês (R$ mil)', en: 'Revenue per month ($ thousand)' };

export function render(el, lang = 'pt') {
  const w = 24, gap = 6, h = 120, max = Math.max(...DATA);
  const bars = DATA.map((v, i) => {
    const bh = Math.round((v / max) * h);
    const x = i * (w + gap);
    return `<rect x="${x}" y="${h - bh}" width="${w}" height="${bh}" rx="3" fill="var(--accent)"><title>${MONTHS[lang][i]}: ${v}</title></rect>` +
      `<text x="${x + w / 2}" y="${h + 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${MONTHS[lang][i]}</text>`;
  }).join('');
  el.innerHTML = `<p class="code-label">${TITLE[lang]}</p><svg viewBox="0 0 ${DATA.length * (w + gap)} ${h + 22}" width="100%" role="img" aria-label="${TITLE[lang]}">${bars}</svg>`;
}
