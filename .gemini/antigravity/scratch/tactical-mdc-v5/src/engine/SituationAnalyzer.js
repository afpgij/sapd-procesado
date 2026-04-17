/**
 * 🛡️ O.L.E.T. SITUATION ANALYZER v11.8 (Sentinel Upgrade)
 * Motor de detección automática de delitos por narrativa.
 * Sincronizado con PenaltyEngine v10.0 y FAQ Oficial.
 */

import { PENALTY_DATA } from './PenaltyEngine.js';

export class SituationAnalyzer {
    normalize(text) {
        if (!text) return "";
        return text.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s]/g, " "); // Limpiar símbolos para facilitar b úsqueda
    }

    analyze(text) {
        if (!text || text.length < 3) return [];
        const t = this.normalize(text);
        const suggestions = [];
        const matched = new Set();

        const keywords = {
            // TRAFICO E INFRACCIONES
            "v-red-light":      ["semaforo", "rojo", "luz roja", "salto el semaforo"],
            "v-speeding":       ["exceso", "velocidad", "rapido", "corre mucho", "vuela", "acelerar", "pisa", "metiendo", "millas"],
            "v-no-license":     ["licencia", "carnet", "sin licencia", "sin carnet", "no tiene licencia", "puntos", "tarjeta identificacion"],
            "v-distraction":    ["movil", "celular", "whatsapp", "distraido", "mirando", "telefono", "dispositivo"],
            "v-wrong-way":      ["lado incorrecto", "direccion contraria", "sentido prohibido", "mediana", "lineas dobles", "lado contrario"],
            "v-jaywalking":     ["cruzar", "paso peatonal", "fuera de paso", "peaton calle", "cruzando mal"],
            "v-unauthorized-parking": ["estacionamiento", "aparcado", "mal aparcado", "prohibido estacionar", "vado"],
            "v-sidewalk":       ["acera", "por la acera", "subido a la acera", "conducir acera"],
            "v-no-plates":      ["placa", "matricula", "sin matricula", "sin placa", "no lleva placa", "exhibir placa"],
            "v-evasion":        ["evasion", "fuga", "persecucion", "10-80", "se escapa", "huye", "no se detiene", "fuga", "volo", "huida"],
            "v-reckless":       ["temeraria", "peligrosa", "zig zag", "conduccion peligrosa", "sentido contrario", "trompo", "derrape", "loco", "desprecio seguridad"],
            "v-dui":            ["alcohol", "borracho", "ebrio", "drogado", "bebio", "droga", "positivo", "cerveza", "copas", "intoxicado"],
            "v-hit-run":        ["atropello", "atropella", "arrolla", "fuga tras atropello", "golpe y fuga", "abandona lugar"],
            "v-stolen-1":       ["robo vehiculo", "coche robado", "moto robada", "sustraccion", "puente", "tomar vehiculo", "ganzua", "destornillador"],
            "v-stolen-2":       ["robo vehiculo", "coche robado", "moto robada", "sustraccion"],
            "v-fraud-min":      ["matricula falsa", "placa falsa", "registro falso"],
            "v-fraud-maj":      ["piezas scratch", "vin borrado", "bastidor borrado", "motor cambiado", "piezas robadas", "vin desconocido", "bastidor desconocido"],
            "v-weight-limit":   ["peso comercial", "exceso peso", "camion pesado", "capacidad carga"],

            // ROBOS Y PROPIEDAD
            "p-robbery-1":      ["tienda", "24/7", "licoreria", "gasolinera", "hurto", "atracando", "atraco", "robo", "atracado", "robado", "sustraccion"],
            "p-robbery-viol":   ["violencia", "fuerza", "atraco violento", "pego para robar", "amenazo", "fuerza intimidacion", "atracado con violencia"],
            "p-robbery-2":      ["armeria", "oficina", "joyeria", "casa", "domicilio", "robo casa", "vangelico", "atraco", "atracado"],
            "p-robbery-inst":   ["banco", "gobierno", "institucion", "robo de banco", "central", "fleeca", "paleto", "boveda"],
            "p-larceny":        ["engano", "fraude", "tomar propiedad", "sin consentimiento", "bienes", "apoderarse"],
            "p-larceny-grand":  ["hurto mayor", "mas de 3000", "bienes valiosos", "valor superior"],
            "p-allanamiento":   ["allanamiento", "propiedad ajena", "entro sin permiso", "invadió", "solar", "casa ajena"],
            "p-vandalism":      ["vandalismo", "graffiti", "rompe", "destruye", "mobiliario", "quema", "manipular vehiculo"],
            "p-vandalism-gov":  ["vandalismo gobierno", "destruye camara", "graffiti sede", "vandalismo gob", "cementerio", "tumba", "lapida", "estatua gob"],
            "p-incendio":       ["fuego", "incendio", "quemar", "prender fuego", "malicioso quema"],
            "p-illegal-money":  ["dinero negro", "lavado", "blanqueo", "dinero sucio", "pasta negra", "manchado", "sucio", "mas de 2000", "grandes sumas"],

            // PERSONAS Y VIOLENCIA
            "p-kidnapping":     ["secuestro", "retiene", "rehen", "rehen", "priva de libertad", "maletero", "atado", "transportarla"],
            "p-kidnapping-gov": ["secuestro agente", "secuestro policia", "rehen policia", "rehen gov", "secuestro empleado"],
            "p-assault":        ["agresion", "pega", "golpea", "patada", "ataca", "pelea", "lesion", "pegar", "golpe", "puñetazo", "ataque corporal"],
            "p-assault-gov":    ["agresion agente", "pega policia", "golpea agente", "pelea policia", "ataca policia", "agresion oficial"],
            "p-homicide":       ["mata", "asesina", "homicidio", "muerto", "cuerpo", "asesinato", "cuchillada", "abatido", "muerte"],
            "p-homicide-inv":   ["accidental", "sin querer", "involuntario", "negligencia", "negligente"],
            "p-homicide-3":     ["homicide 3", "muerte 3er grado", "disputa repentina", "arrebato"],
            "p-attempt-homicide-gov": ["intento matar", "dispara policia", "intento homicidio agente", "ataca vida agente"],
            "p-threats":        ["amenaza", "amenazar muerte", "amenaza lesiones", "te voy a matar", "especifica muerte"],
            "p-stalking":       ["acoso", "seguir", "hostigar", "perseguir persona", "temor razonable"],
            "p-sexual-assault": ["agresion sexual", "naturaleza sexual", "integridad sexual", "abuso", "psicologico sexual"],
            "p-forced-intox":   ["drogar", "intoxicar", "sustancia forzada", "pinchazo", "administrar forzada"],
            "p-false-imprisonment": ["privacion libertad", "encerrar", "retener persona", "violar libertad"],
            "p-desecration":    ["cadaver", "muerto", "mutilar restos", "cementerio", "desenterrar", "profanar", "restos humanos"],
            "p-animal-cruelty": ["crueldad animal", "maltrato animal", "torturar animal", "matar animal", "perro", "gato"],
            "p-extortion":      ["extorsion", "chantaje", "miedo dinero", "obligar pagar"],
            "p-embezzlement":   ["malversacion", "apropiacion fondos", "fondos publicos", "fraude dinero"],
            "p-gov-theft":      ["robo equipo", "equipo policial", "radio policia", "chaleco policia", "robo evidencia"],

            // ARMAS Y DROGAS
            "p-weapons-fire":   ["exhibe", "saca pistola", "saca arma", "apunta", "amenaza con arma", "enseña arma", "arma", "desenfundar"],
            "p-weapon-possession": ["lleva arma", "porta", "tiene rifle", "armado", "pistola sin licencia", "pistola", "revolver", "subfusil", "arma", "bajo custodia control"],
            "p-shooting-reckless": ["dispara", "tiros", "abre fuego", "detonaciones", "tiroteo", "balas", "bang", "fuego", "vivienda habitada"],
            "p-shooting-negligent": ["descarga", "tiro al aire", "disparo sin querer", "sin causa"],
            "p-drugs-2":        ["sustancia", "droga", "marihuana", "porros", "gramos", "cannabis", "droga", "coca", "pastis", "blanca"],
            "p-drugs-dist":     ["vende", "distribuye", "camello", "trapicheo", "mercancia", "bolsas", "balanza", "intencion distribuirla", "1000 unidades"],

            // ORDEN PÚBLICO
            "p-resistance":     ["resiste", "huye a pie", "escapa corriendo", "forcejea", "se resiste", "no se pone esposas"],
            "p-disobedience":   ["desobedece", "no hace caso", "ignora", "pasa de las ordenes", "no colabora", "ignora alto"],
            "p-insults":        ["insulta", "falta el respeto", "escup", "ofende", "maleducado", "insultos", "insultar", "denigrar", "insulto", "insultado"],
            "p-mask":           ["mascara", "careta", "pasamontanas", "encapuchado", "balaclava", "mascara", "tapado"],
            "p-impersonation":  ["identidad falsa", "suplantacion", "nombre falso", "dni falso", "miente nombre"],
            "p-bribery":        ["soborno", "dinero cambio", "pasta cambio", "cohecho", "te doy 500", "ofrecer dinero"],
            "p-brujeria":       ["brujeria", "ritual", "magia", "sacrificio", "invoca", "hechizo", "artes arcanas"],
            "p-obstruction":    ["obstruye", "molesta", "no deja trabajar", "se mete en medio", "bloqueo", "bloquear patrulla", "entorpecer"],
            "p-false-report":   ["mentira", "falsa", "denuncia falsa", "se lo inventa"],
            "p-escape-custody": ["se escapa esposado", "fuga custodia", "escapa custodia", "huida esposas"],
            "p-abuse-911":      ["uso indebido 911", "broma 911", "molestar 911", "falsa emergencia"],
            "p-medical-illegal": ["ejercicio ilegal medicina", "operar sin licencia", "cirugia ilegal", "falso medico"],
            "p-law-illegal":    ["ejercicio ilegal abogacia", "falso abogado", "bufete ilegal"]
        };



        // Lógica de detección principal optimizada
        for (const [id, kw] of Object.entries(keywords)) {
            // Comprobamos si alguna palabra clave coincide
            const isMatch = kw.some(k => {
                const normalizedK = this.normalize(k);
                // Si la palabra clave tiene espacios, buscamos la frase exacta
                if (normalizedK.includes(" ")) {
                    return t.includes(normalizedK);
                }
                // Si es una palabra sola, buscamos límites de palabra para evitar falsos positivos
                // ej: "arma" no debería matchear con "armadillo" (aunque en este contexto es raro)
                // Usamos un include simple por velocidad, pero con comprobación de ID para evitar duplicados en la lista final
                return t.includes(normalizedK);
            });

            if (isMatch) {
                if (PENALTY_DATA[id] && !matched.has(id)) {
                    suggestions.push({ id, name: PENALTY_DATA[id].name });
                    matched.add(id);
                }
            }
        }

        // Priorización: Si detectamos Homicidios, suelen tener prioridad sobre agresiones
        return suggestions.sort((a, b) => b.id.length - a.id.length);
    }
}

