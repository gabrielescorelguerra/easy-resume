/* Modelo padrão do currículo (usado em "Restaurar modelo" e no primeiro acesso). */

import { DATA } from "./data.js";

export const DEF = () => JSON.parse(JSON.stringify(DATA));
