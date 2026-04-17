/**
 * 🛡️ O.L.E.T. SITUATION ANALYZER v11.2 (Elite Edition)
 * Motor de detección automática de delitos por narrativa (Mejorado).
 */

import { PENALTY_DATA } from './PenaltyEngine.js';

export class SituationAnalyzer {
    normalize(text) {
        return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    analyze(text) {
        if (!text || text.length < 3) return [];
        const t = this.normalize(text);
        const suggestions = [];
        const matched = new Set();

        const keywords = {
            "v-red-light":      ["semaforo", "rojo", "luz roja", "salto el semaforo"],
            "v-speeding":       ["exceso", "velocidad", "rapido", "corre mucho", "vuela"],
            "v-no-license":     ["licencia", "carnet", "sin licencia", "sin carnet", "no tiene licencia"],
            "v-evasion":        ["evasion", "fuga", "persecucion", "10-80", "se escapa", "huye", "no se detiene"],
            "v-reckless":       ["temeraria", "peligrosa", "zig zag", "conduccion peligrosa", "sentido contrario"],
            "v-dui":            ["alcohol", "borracho", "ebrio", "drogado", "bebió", "droga", "positivo"],
            "v-hit-run":        ["atropello", "atropella", "arrolla", "fuga tras atropello"],
            "p-robbery-1":      ["tienda", "24/7", "licoreria", "gasolinera", "hurto", "atracando tienda"],
            "p-robbery-2":      ["armeria", "oficina", "joyeria", "casa", "domicilio", "robo casa", "vangelico"],
            "p-robbery-inst":   ["banco", "gobierno", "institucion", "robo de banco", "central", "fleeca"],
            "p-kidnapping":     ["secuestro", "retiene", "rehen", "rehén", "priva de libertad"],
            "p-assault":        ["agresion", "pega", "golpea", "patada", "ataca", "pelea", "lesion"],
            "p-weapons-fire":   ["exhibe", "saca pistola", "saca arma", "apunta", "amenaza con arma"],
            "p-weapon-possession": ["lleva arma", "porta", "tiene rifle", "armado", "pistola sin licencia"],
            "p-shooting-reckless": ["dispara", "tiros", "abre fuego", "detonaciones", "tiroteo"],
            "p-drugs-2":        ["sustancia", "droga", "marihuana", "porros", "gramos", "cannabis", "droga"],
            "p-resistance":     ["resiste", "huye a pie", "escapa corriendo", "forcejea", "se resiste"],
            "p-disobedience":   ["desobedece", "no hace caso", "ignora", "pasa de las ordenes", "no colabora"],
            "p-insults":        ["insulta", "falta el respeto", "escup", "ofende", "maleducado"],
            "p-mask":           ["mascara", "careta", "pasamontanas", "encapuchado", "balaclava"],
            "p-impersonation":  ["identidad falsa", "suplantacion", "nombre falso", "dni falso"],
            "p-homicide":       ["mata", "asesina", "homicidio", "muerto", "cuerpo", "asesinato"],
            "p-illegal-money":  ["dinero negro", "lavado", "blanqueo", "dinero sucio", "pasta negra"]
        };

        // Lógica de detección principal
        for (const [id, kw] of Object.entries(keywords)) {
            if (kw.some(k => t.includes(this.normalize(k)))) {
                if (PENALTY_DATA[id]) {
                    suggestions.push({ id, name: PENALTY_DATA[id].name });
                }
            }
        }

        return suggestions;
    }
}
