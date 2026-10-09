/* Fonte remota opcional: JSONBin.io. O arquivo js/data.js continua sendo o
 * fallback versionado para o primeiro acesso e quando a API não está configurada. */

import { S, V, on, loadRemote } from "./state.js";
import { esc } from "./utils.js";
import { preview } from "./preview.js";

const cfg = typeof window !== "undefined" ? window.__APP_CONFIG__ || {} : {};
const BIN_ID = String(cfg.JSONBIN_BIN_ID || "").trim();
const ACCESS_KEY = String(cfg.JSONBIN_ACCESS_KEY || "").trim();
const API_URL = BIN_ID ? `https://api.jsonbin.io/v3/b/${encodeURIComponent(BIN_ID)}` : "";

let status = "";
let timer;
let render = () => {};

export const jsonBinConfigured = Boolean(BIN_ID && ACCESS_KEY);

export function setSt(message) {
  status = message;
  const el = document.getElementById("st");
  if (el) el.textContent = message;
}

export function syncRow() {
  const message = jsonBinConfigured
    ? status || "JSONBin configurado"
    : "Modo local: configure o JSONBin em js/config.js";
  return `<div class="mut" id="st">${esc(message)}</div>`;
}

function headers() {
  return {
    "Content-Type": "application/json",
    "X-Access-Key": ACCESS_KEY,
  };
}

async function push() {
  if (!jsonBinConfigured) return;
  try {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ resume: S, versions: V }),
    });
    if (!response.ok) throw new Error(`JSONBin respondeu HTTP ${response.status}`);
    setSt(`Sincronizado às ${new Date().toLocaleTimeString("pt-BR", { timeStyle: "short" })}`);
  } catch (error) {
    setSt("Erro ao sincronizar; alterações mantidas neste navegador");
    console.error(error);
  }
}

function schedulePush() {
  if (!jsonBinConfigured) return;
  clearTimeout(timer);
  setSt("Salvando no JSONBin…");
  timer = setTimeout(push, 800);
}

async function pull() {
  if (!jsonBinConfigured) return;
  try {
    setSt("Carregando dados do JSONBin…");
    const response = await fetch(`${API_URL}/latest`, {
      headers: { "X-Access-Key": ACCESS_KEY },
    });
    if (!response.ok) throw new Error(`JSONBin respondeu HTTP ${response.status}`);
    const result = await response.json();
    const record = result.record;
    if (record?.resume?.sections) {
      loadRemote(record.resume, record.versions);
      render();
      preview();
    }
    setSt("Dados carregados do JSONBin");
  } catch (error) {
    setSt("Erro ao carregar JSONBin; usando dados locais");
    console.error(error);
  }
}

export function initJsonBin(renderEditor) {
  render = renderEditor || render;
  on("change", schedulePush);
  on("versionAdded", schedulePush);
  on("versionDeleted", schedulePush);
  pull();
}
