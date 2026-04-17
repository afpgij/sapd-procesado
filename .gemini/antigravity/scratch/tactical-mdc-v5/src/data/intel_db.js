
/**
 * NEXUS v6.17 - CENTRO DE INTELIGENCIA Y ALERTAS
 * Basado en Humane Labs, FAR Act y Protocolo 10.71
 */

export const INTEL_DB = {
    alerts: [
        {
            title: "ALERTA HUMANE LABS",
            type: "EMERGENCIA RADIOLÓGICA",
            location: "Chianski Passage",
            protocol: "Potestad para (1) Imputar Allanamiento Agravado inmediato o (2) Detención preventiva 24h por salud.",
            color: "var(--accent-red)"
        },
        {
            title: "NUEVOS REQUISITOS LICENCIA ARMAS",
            type: "COMUNICADO OFICIAL",
            location: "Servicio de Licencias",
            protocol: "Denegar si hay: (1) Delitos de sangre, (2) Delitos de armas, (3) Delito Grave B o superior.",
            color: "var(--accent-cyan)"
        }
    ],
    communications: [
        {
            date: "2026-04-13",
            title: "ROBOS BAJOS (SOLO-RUNS)",
            content: "Se permite a criminales realizar robos de bajo nivel en solitario. Priorizar roleo y dejar iniciar persecución antes de intervenir directamente.",
            tag: "OPERATIVO"
        },
        {
            date: "2026-04-13",
            title: "LICENCIAS DE ARMAS/CAZA",
            content: "Requisitos para civiles: Sin delitos de sangre, sin delitos de armas, sin Grave B+. Entidades privadas requieren RP previo en comisaría.",
            tag: "ADMINISTRATIVO"
        },
        {
            date: "2026-04-06",
            title: "DIRECTIVA FAIR PLAY",
            content: "Evitar el 'tryhardeo'. No disparar por atropellos accidentales en boxes. No pinchar ruedas a baja velocidad. Dar chance al criminal.",
            tag: "CONDUCTA"
        },
        {
            date: "2026-03-31",
            title: "VEHÍCULOS Y SMOG",
            content: "Siempre utilizar vehículos acordes al SMOG (rating) de los sospechosos (+100 margen PD). Máximo 2 interceptores por vehículo sospechoso.",
            tag: "TRANSPORTE"
        }
    ],
    protocols: {
        active_shooter: {
            id: "10.71",
            name: "Tiroteo Masivo",
            steps: [
                "Megáfono: 5 min de aviso para abandonar la zona.",
                "Zona Segura: Obligatorio asegurar antes del 10.52.",
                "Prueba GSR: Solo con GSR+ hay arresto legal. Sin GSR = Libertad tras declaración.",
                "Cacheo Preventivo: Obligatorio incluso sin GSR por seguridad hospitalaria."
            ]
        },
        medical_rp: {
            name: "Roles de Heridas / Primeros Auxilios",
            steps: [
                "Rolear lo que se ve con 'alt', no preguntar qué ocurre.",
                "Cantar la herida: 'A simple vista veo herida de taser/bala'.",
                "Si la herida no coincide con el rol (bug), usar /me '¿Tendría herida de bala?'",
                "Informar detalladamente a EMS/Doctores al llegar."
            ]
        },
        environmental: {
            name: "FAR Act (Pesca y Caza)",
            strikes: "4 puntos = Suspensión de Licencia. Expiración en 21 días.",
            endangered: [
                "Mamíferos: Puma, Lobo Gris, Nutria del Sur, Ballena Azul, Orca, Foca de Guadalupe.",
                "Aves: Águila Calva, Cormorán, Aguilucho Común.",
                "Reptiles: Tortuga Carey, Tortuga del Desierto, Boa del Sur.",
                "Anfibios: Sapo de Yosemite, Salamandra Tigre.",
                "Invertebrados: Mariposa Azul de San Andreas."
            ]
        }
    }
};

