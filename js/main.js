/* Ponto de entrada: inicializa tema, UI, eventos e sincronização remota. */

import { applyTheme } from "./state.js";
import { initJsonBin } from "./jsonbin.js";
import { editor } from "./editor.js";
import { preview } from "./preview.js";
import { initEvents } from "./events.js";

applyTheme();
initEvents();
editor();
preview();
initJsonBin(editor);
