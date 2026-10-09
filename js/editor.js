/* Renderização do painel de edição (coluna esquerda). */

import { S, V, TH } from "./state.js";
import { esc } from "./utils.js";
import { syncRow } from "./jsonbin.js";

const STY = [
  ["github", "Markdown (GitHub)"],
  ["mono", "Markdown cru"],
  ["classic", "Clássico serifado"],
  ["modern", "Moderno"],
  ["minimal", "Minimalista"],
  ["compact", "Compacto"],
];

const THS = [
  ["auto", "Automático"],
  ["light", "Claro"],
  ["dark", "Escuro (Tokyo Night)"],
];

const SW = [
  "#1f5f9e",
  "#0f766e",
  "#7c3aed",
  "#be185d",
  "#c2410c",
  "#15803d",
  "#374151",
];

function inp(p, l, v, ph) {
  return `<label>${l}<input type="text" data-p="${p}" value="${esc(v)}" ${ph ? `placeholder="${ph}"` : ""}></label>`;
}

function ta(p, l, v, r) {
  return `<label>${l}<textarea data-p="${p}" rows="${r || 4}">${esc(v)}</textarea></label>`;
}

export function editor() {
  const top = document.getElementById("ed").scrollTop;
  let h = `<div class="bar"><h1>Gerador de currículo</h1><div class="row">
  <input type="color" id="acc" data-p="accent" value="${S.accent}" aria-label="Cor de destaque">
  ${SW.map((c) => `<button class="sw" data-a="sw" data-c="${c}" style="background:${c}" aria-label="Cor ${c}"></button>`).join("")}
 </div><div class="row"><button class="pri" data-a="pdf">Baixar PDF</button><button data-a="reset">Restaurar modelo</button></div>
  ${syncRow()}
  <div class="row"><label class="inl">Estilo <select data-st="1">${STY.map(([k, n]) => `<option value="${k}"${S.style === k ? " selected" : ""}>${n}</option>`).join("")}</select></label>
  <label class="inl">Tema <select data-th="1">${THS.map(([k, n]) => `<option value="${k}"${TH === k ? " selected" : ""}>${n}</option>`).join("")}</select></label></div></div>`;
  h += `<div class="sec"><button class="sm" data-a="tg" data-k="v" aria-expanded="${!S.vc}" aria-label="Recolher ou expandir">${S.vc ? "▸" : "▾"}</button>Versões salvas</div><div class="bd"${S.vc ? " hidden" : ""}><div class="row"><input type="text" id="vn" placeholder="Nome da versão (opcional)" style="flex:1;margin:0"><button data-a="savev">Salvar versão</button></div>`;
  if (!V.length) h += `<p class="mut">Nenhuma versão salva ainda.</p>`;
  V.forEach((v, i) => {
    h += `<div class="card in"><div class="hd"><div><h3>${esc(v.name)}</h3><span class="mut">${esc(v.date)}</span></div><div class="row"><button class="sm" data-a="restv" data-i="${i}">Restaurar</button><button class="sm x" data-a="delv" data-i="${i}">Excluir</button></div></div></div>`;
  });
  h += `</div>`;
  h += `<div class="sec"><button class="sm" data-a="tg" data-k="h" aria-expanded="${!S.hc}" aria-label="Recolher ou expandir">${S.hc ? "▸" : "▾"}</button>Cabeçalho</div><div class="bd"${S.hc ? " hidden" : ""}>${inp("name", "Nome", S.name)}`;
  S.contacts.forEach((c, i) => {
    h += `<div class="card in"><div class="hd"><h3>Contato ${i + 1}</h3><div class="row"><button class="sm" data-a="cup" data-i="${i}" aria-label="Subir">↑</button><button class="sm" data-a="cdown" data-i="${i}" aria-label="Descer">↓</button><button class="sm x" data-a="delc" data-i="${i}">Remover</button></div></div>
  <div class="g2">${inp(`contacts.${i}.label`, "Rótulo (opcional)", c.label, "LinkedIn")}${inp(`contacts.${i}.text`, "Texto", c.text)}</div>${inp(`contacts.${i}.url`, "Link (opcional)", c.url, "https://...")}</div>`;
  });
  h += `<div style="margin-top:10px"><button data-a="addc">+ Contato</button></div></div>`;
  h += `<div class="sec">Seções<span style="flex:1"></span><button class="sm" data-a="colall">Recolher tudo</button><button class="sm" data-a="expall">Expandir tudo</button></div>`;
  S.sections.forEach((s, i) => {
    h += `<div class="card"><div class="hd"><div class="row"><button class="sm" data-a="tg" data-k="s" data-i="${i}" aria-expanded="${!s.c}" aria-label="Recolher ou expandir">${s.c ? "▸" : "▾"}</button><h3>${esc(s.title) || "Sem título"}</h3></div><div class="row">
   <button class="sm" data-a="up" data-i="${i}" aria-label="Subir">↑</button><button class="sm" data-a="down" data-i="${i}" aria-label="Descer">↓</button><button class="sm x" data-a="dels" data-i="${i}">Remover</button></div></div>
   <div class="bd"${s.c ? " hidden" : ""}><div class="g2">${inp(`sections.${i}.title`, "Título", s.title)}
   <label>Tipo<select data-p="sections.${i}.type" data-s="1"><option value="text"${s.type === "text" ? " selected" : ""}>Parágrafo</option><option value="lines"${s.type === "lines" ? " selected" : ""}>Lista de linhas</option><option value="entries"${s.type === "entries" ? " selected" : ""}>Itens com bullets</option></select></label></div>`;
    if (s.type === "entries") {
      s.entries.forEach((e, j) => {
        h += `<div class="card in"><div class="hd"><div class="row"><button class="sm" data-a="tg" data-k="e" data-i="${i}" data-j="${j}" aria-expanded="${!e.c}" aria-label="Recolher ou expandir">${e.c ? "▸" : "▾"}</button><h3>${esc(e.title) || "Item " + (j + 1)}</h3></div><div class="row"><button class="sm" data-a="eup" data-i="${i}" data-j="${j}" aria-label="Subir">↑</button><button class="sm" data-a="edown" data-i="${i}" data-j="${j}" aria-label="Descer">↓</button><button class="sm x" data-a="dele" data-i="${i}" data-j="${j}">Remover</button></div></div>
    <div class="bd"${e.c ? " hidden" : ""}>${inp(`sections.${i}.entries.${j}.title`, "Título (negrito)", e.title)}
    <div class="g2">${inp(`sections.${i}.entries.${j}.subtitle`, "Subtítulo", e.subtitle)}${inp(`sections.${i}.entries.${j}.date`, "Data / período", e.date)}</div>
    ${inp(`sections.${i}.entries.${j}.label`, "Texto antes dos bullets", e.label, "Atividades:")}
    ${ta(`sections.${i}.entries.${j}.bullets`, "Bullets (um por linha)", e.bullets, 5)}</div></div>`;
      });
      h += `<div style="margin-top:10px"><button data-a="adde" data-i="${i}">+ Item</button></div>`;
    } else
      h += ta(
        `sections.${i}.text`,
        s.type === "lines" ? "Linhas (uma por linha)" : "Texto",
        s.text,
        s.type === "lines" ? 4 : 5,
      );
    h += `</div></div>`;
  });
  h += `<div style="margin-top:14px"><button data-a="adds">+ Nova seção</button></div>`;
  const ed = document.getElementById("ed");
  ed.innerHTML = h;
  ed.scrollTop = top;
}
