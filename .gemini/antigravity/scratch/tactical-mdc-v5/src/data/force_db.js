
/**
 * NEXUS v6.16 - PROTOCOLO DE USO DE LA FUERZA
 * Basado en 2.2.1 - Definición uso de la fuerza.txt
 */

export const FORCE_DB = {
    armstrong_factors: [
        { id: "F1", name: "Gravedad del Delito", desc: "Interés gubernamental en la detención." },
        { id: "F2", name: "Amenaza Inmediata", desc: "Seguridad de terceros o agentes." },
        { id: "F3", name: "Resistencia Activa", desc: "Oposición física del sospechoso." },
        { id: "F4", name: "Evasión por Huida", desc: "Intento activo de evadir la detención." }
    ],
    resistance_levels: [
        { level: "Colaboración Pasiva", desc: "Acata órdenes verbales.", force_allowed: "Presencia / Verbalización" },
        { level: "Resistencia Pasiva", desc: "Se niega a cumplir pero no hay oposición física.", force_allowed: "Control Desarmado (Técnicas Blandas)" },
        { level: "Resistencia Activa", desc: "Oposición física sin intención de daño.", force_allowed: "Control Desarmado (Técnicas Lesivas)" },
        { level: "Agresión Activa", desc: "Intento de causar daño al agente o terceros.", force_allowed: "Métodos Menos Letales / Fuerza Letal" }
    ],
    force_levels: [
        { id: 1, name: "Presencia del Agente", desc: "Disuasión profesional no amenazante." },
        { id: 2, name: "Verbalización", desc: "Órdenes, advertencias y persuasión." },
        { id: 3, name: "Control Desarmado", desc: "Agarres (Blandas) o Golpes (Lesivas)." },
        { id: 4, name: "Métodos Menos Letales", desc: "Taser (CED), Bastón (Batuta) o Químicos (Pepper)." },
        { id: 5, name: "Fuerza Letal", desc: "Armas de fuego en defensa propia o de terceros." }
    ],
    priorities: [
        "Rehenes / Víctimas",
        "Personas inocentes / Civiles",
        "Agentes de la Paz",
        "Sospechosos"
    ],
    policies: [
        "Solo usar fuerza necesaria para ejercer control.",
        "Reducción inmediata de fuerza si disminuye la resistencia.",
        "Advertencia previa antes de descarga (si es factible).",
        "No disparar desde/hacia vehículos salvo fuerza letal entrante."
    ]
};

