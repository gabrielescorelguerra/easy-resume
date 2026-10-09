/* Renderização da folha do currículo (preview à direita / PDF). */

import { S } from "./state.js";
import { esc, lines, safeUrl, isExternal } from "./utils.js";

export function preview() {
  const p = document.getElementById("paper");
  p.className = "paper s-" + S.style;
  p.style.setProperty("--ac", S.accent);
  document.documentElement.style.setProperty("--ac", S.accent);

  /* Links: só esquemas seguros (http/https/mailto/tel); externos abrem em nova aba sem opener. */
  const link = (c) => {
    const t = esc(c.text);
    const url = safeUrl(c.url);
    if (!url) return t;
    const attrs = isExternal(url) ? ' target="_blank" rel="noopener noreferrer"' : "";
    return `<a href="${esc(url)}"${attrs}>${t}</a>`;
  };

  const inl = S.contacts.filter((c) => !c.label && c.text),
    lab = S.contacts.filter((c) => c.label && c.text);
  let h = `<h1>${esc(S.name)}</h1>`;
  if (inl.length) h += `<p class="ct">${inl.map(link).join("  |  ")}</p>`;
  lab.forEach(
    (c) => (h += `<p class="ct">${esc(c.label)}: ${link(c)}</p>`),
  );
  S.sections.forEach((s) => {
    h += `<h2>${esc(s.title)}</h2>`;
    if (s.type === "text")
      lines(s.text).forEach((l) => (h += `<p>${esc(l)}</p>`));
    else if (s.type === "lines")
      lines(s.text).forEach((l) => (h += `<p>${esc(l)}</p>`));
    else
      s.entries.forEach((e) => {
        h += `<div class="ent"><div class="eh"><div>${esc(e.title)}</div><span>${esc(e.date)}</span></div>`;
        if (e.subtitle) h += `<div class="es">${esc(e.subtitle)}</div>`;
        const b = lines(e.bullets);
        if (b.length) {
          if (e.label) h += `<div class="lb">${esc(e.label)}</div>`;
          h += `<ul>${b.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
        }
        h += `</div>`;
      });
  });
  p.innerHTML = h;
}
