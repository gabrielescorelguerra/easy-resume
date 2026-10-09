/* Fonte remota opcional via API serverless. O arquivo js/data.js continua
 * sendo o fallback versionado para o primeiro acesso. */

import { S, V, on, loadRemote } from "./state.js";
import { esc } from "./utils.js";
import { preview } from "./preview.js";

const API_URL = "/api/jsonbin";

let status = "";
let timer;
let render = () => {};

export const jsonBinConfigured = true;

export function setSt(message) {
  status = message;
  const el = document.getElementById("st");
  if (el) el.textContent = message;
}

export function syncRow() {
  const message = jsonBinConfigured
    ? status || "Sincronização configurada"
    : "Modo local";
  return `<div class="mut" id="st">${esc(message)}</div>`;
}

async function push() {
  try {
    const response = await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
  clearTimeout(timer);
  setSt("Salvando…");
  timer = setTimeout(push, 800);
}

async function pull() {
  try {
    setSt("Carregando dados…");
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`API respondeu HTTP ${response.status}`);
    const result = await response.json();
    const record = result.record;
    if (record?.resume?.sections) {
      loadRemote(record.resume, record.versions);
      render();
      preview();
    }
    setSt("Dados carregados");
  } catch (error) {
    setSt("Erro ao carregar; usando dados locais");
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
