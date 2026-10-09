/* Eventos delegados do documento: digitação, troca de select e cliques. */

import { S, V, setState, save, addVersion, deleteVersion, setTheme } from "./state.js";
import { setPath, move } from "./utils.js";
import { editor } from "./editor.js";
import { preview } from "./preview.js";
import { DEF } from "./defaults.js";

export function initEvents() {
  document.addEventListener("input", (e) => {
    const p = e.target.dataset && e.target.dataset.p;
    if (!p) return;
    setPath(S, p, e.target.value);
    preview();
    save();
  });

  document.addEventListener("change", (e) => {
    const d = e.target.dataset || {};
    if (d.s) {
      editor();
      preview();
      save();
    }
    if (d.st) {
      S.style = e.target.value;
      preview();
      save();
    }
    if (d.th) setTheme(e.target.value);
  });

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const a = b.dataset.a,
      i = +b.dataset.i,
      j = +b.dataset.j;

    if (a === "pdf") {
      window.print();
      return;
    }
    if (a === "sw") {
      S.accent = b.dataset.c;
      document.getElementById("acc").value = S.accent;
      preview();
      save();
      return;
    }
    if (a === "reset") {
      addVersion("Antes de restaurar o modelo", S);
      setState(DEF());
    }
    if (a === "savev") {
      const n = document.getElementById("vn").value.trim();
      addVersion(n || "Versão sem nome", S);
    }
    if (a === "restv") {
      const d = JSON.parse(JSON.stringify(V[i].data));
      addVersion("Antes de restaurar uma versão", S);
      setState(d);
    }
    if (a === "delv") {
      deleteVersion(i);
    }
    if (a === "cup") move(S.contacts, i, -1);
    if (a === "cdown") move(S.contacts, i, 1);
    if (a === "eup") move(S.sections[i].entries, j, -1);
    if (a === "edown") move(S.sections[i].entries, j, 1);
    if (a === "addc") S.contacts.push({ label: "", text: "", url: "" });
    if (a === "delc") S.contacts.splice(i, 1);
    if (a === "tg") {
      const k = b.dataset.k;
      if (k === "s") S.sections[i].c = !S.sections[i].c;
      else if (k === "e") S.sections[i].entries[j].c = !S.sections[i].entries[j].c;
      else if (k === "h") S.hc = !S.hc;
      else S.vc = !S.vc;
    }
    if (a === "colall" || a === "expall") {
      const v = a === "colall";
      S.sections.forEach((x) => {
        x.c = v;
        x.entries.forEach((y) => (y.c = v));
      });
    }
    if (a === "adds")
      S.sections.push({
        title: "Nova seção",
        type: "entries",
        text: "",
        entries: [
          { title: "", subtitle: "", date: "", label: "", bullets: "" },
        ],
      });
    if (a === "dels") S.sections.splice(i, 1);
    if (a === "up" && i > 0)
      S.sections.splice(i - 1, 0, S.sections.splice(i, 1)[0]);
    if (a === "down" && i < S.sections.length - 1)
      S.sections.splice(i + 1, 0, S.sections.splice(i, 1)[0]);
    if (a === "adde")
      S.sections[i].entries.push({
        title: "",
        subtitle: "",
        date: "",
        label: "Atividades:",
        bullets: "",
      });
    if (a === "dele") S.sections[i].entries.splice(j, 1);

    editor();
    preview();
    save();
  });
}
