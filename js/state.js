/* Estado global do aplicativo + persistência em localStorage e JSONBin. */

import { DEF } from "./defaults.js";
import { uid, fmt } from "./utils.js";

const KEY = "cv-gabriel-v1";
const VERSIONS_KEY = "cv-versions";
const THEME_KEY = "cv-theme";
const MAX_VERSIONS = 30;

/** Lê JSON do localStorage com segurança (valor inválido/corrompido → fallback). */
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    const v = raw ? JSON.parse(raw) : fallback;
    return v ?? fallback;
  } catch {
    return fallback;
  }
}

/** Garante a estrutura mínima esperada do estado. */
function normalize(data) {
  const s = data && Array.isArray(data.sections) ? data : DEF();
  s.style = s.style || "github";
  if (!Array.isArray(s.contacts)) s.contacts = [];
  if (!Array.isArray(s.sections)) s.sections = [];
  return s;
}

export let S = normalize(readJSON(KEY, null));
export let V = readJSON(VERSIONS_KEY, []);
if (!Array.isArray(V)) V = [];
V.forEach((v) => {
  v.id = v.id || uid();
});
export let TH = (() => {
  try {
    return localStorage.getItem(THEME_KEY) || "auto";
  } catch {
    return "auto";
  }
})();

/* ---- eventos ---- */
const listeners = {
  change: new Set(), // estado atual alterado → sincronizar com JSONBin
  versionAdded: new Set(),
  versionDeleted: new Set(),
};

/** Registra um callback: on("change" | "versionAdded" | "versionDeleted", fn). */
export function on(event, cb) {
  listeners[event]?.add(cb);
}

function emit(event, payload) {
  for (const cb of listeners[event] || []) cb(payload);
}

/* ---- persistência local ---- */
export function localSave() {
  try {
    localStorage.setItem(KEY, JSON.stringify(S));
  } catch {
    /* quota cheia ou storage indisponível: segue só em memória */
  }
}

function saveVersions() {
  try {
    localStorage.setItem(VERSIONS_KEY, JSON.stringify(V));
  } catch {
    /* ignora */
  }
}

/** Persiste localmente e avisa o sincronizador remoto (com debounce). */
export function save() {
  localSave();
  emit("change");
}

/** Substitui o estado atual (ex.: restaurar versão / restaurar modelo). */
export function setState(next) {
  S = normalize(next);
  localSave();
  emit("change");
}

/** Aplica dados vindos do JSONBin sem reenviá-los (evita loop). */
export function loadRemote(data, versions) {
  S = normalize(data);
  localSave();
  if (Array.isArray(versions)) {
    V = versions.map((v) => ({ ...v, id: v.id || uid() }));
    saveVersions();
  }
}

/* ---- versões salvas ---- */
export function addVersion(name, data) {
  const v = {
    id: uid(),
    name,
    date: fmt(Date.now()),
    data: JSON.parse(JSON.stringify(data)),
  };
  V.unshift(v);
  const old = V.splice(MAX_VERSIONS);
  saveVersions();
  emit("versionAdded", v);
  old.forEach((o) => emit("versionDeleted", o.id));
}

export function deleteVersion(i) {
  const v = V.splice(i, 1)[0];
  saveVersions();
  if (v) emit("versionDeleted", v.id);
}

/* ---- tema da interface ---- */
export function applyTheme() {
  const r = document.documentElement;
  if (TH === "auto") r.removeAttribute("data-theme");
  else r.setAttribute("data-theme", TH);
}

export function setTheme(t) {
  TH = t;
  try {
    localStorage.setItem(THEME_KEY, t);
  } catch {
    /* ignora */
  }
  applyTheme();
}
