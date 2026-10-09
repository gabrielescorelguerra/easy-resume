/* Utilitários puros, sem estado. */

const ESC_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Escapa texto para uso seguro dentro de HTML (anti-XSS). */
export const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (c) => ESC_MAP[c],
  );

/** Protocolos aceitos em links do currículo. */
const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * valida uma URL antes de usá-la em href.
 * Bloqueia esquemas perigosos como javascript: e data: (vetor de XSS).
 * Retorna a URL segura ou "" se for insegura.
 */
export function safeUrl(raw) {
  const u = String(raw || "").trim();
  if (!u) return "";
  if (!/^[a-z][a-z0-9+.-]*:/i.test(u)) return u; // sem esquema = relativa, segura
  try {
    const parsed = new URL(u);
    return SAFE_PROTOCOLS.includes(parsed.protocol) ? u : "";
  } catch {
    return "";
  }
}

/** true se a URL aponta para fora do site (abrir em nova aba). */
export const isExternal = (url) => /^https?:/i.test(String(url || ""));

/** Identificador único. */
export const uid = () =>
  crypto.randomUUID
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 3) | 8).toString(16);
      });

/** Data/hora curta em pt-BR. */
export const fmt = (d) =>
  new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });

/** Divide texto em linhas não vazias, sem espaços nas pontas. */
export const lines = (t) =>
  String(t || "")
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);

/** Move um item de posição dentro do array (d = -1 sobe, +1 desce). */
export const move = (a, i, d) => {
  const k = i + d;
  if (k < 0 || k >= a.length) return;
  a.splice(k, 0, a.splice(i, 1)[0]);
};

/** Chaves que não podem aparecer em caminhos (anti prototype pollution). */
const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

/**
 * Define um valor em "caminho pontuado" (ex.: "sections.0.title"),
 * recusando chaves que poluem o prototype.
 */
export function setPath(obj, path, v) {
  const keys = String(path).split(".");
  let o = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (FORBIDDEN_KEYS.has(k) || o == null) return;
    o = o[k];
  }
  const last = keys[keys.length - 1];
  if (FORBIDDEN_KEYS.has(last) || o == null) return;
  o[last] = v;
}
