
/**
 * NEXUS TACTICAL DATA - BOLO & CITIZEN RECORDS
 */

export const TACTICAL_DATA = {
    bolos: [
        { id: "BOLO-001", name: "John 'Scar' Doe", priority: "ALTA", description: "Sospechoso de atraco a mano armada. Visto última vez en Downtown.", lastSeen: "12:15 - San Andreas Ave" },
        { id: "BOLO-002", name: "Ramses V", priority: "MEDIA", description: "Conducción temeraria y evasión. Vehículo: Sultan RS Azul.", lastSeen: "11:30 - Sandy Shores" },
        { id: "BOLO-003", name: "Marta Wayne", priority: "CRÍTICA", description: "Fuga de prisión. Extremadamente peligrosa.", lastSeen: "09:00 - Terminal" }
    ],
    citizens: [
        { id: "CID-5050", name: "Arthur Morgan", age: 36, gender: "M", status: "Limpio", criminalRecord: [], notes: "Residente de Strawberry." },
        { id: "CID-1234", name: "Michael De Santa", age: 48, gender: "M", status: "Bajo Vigilancia", criminalRecord: ["p-robbery-1", "v-evasion"], notes: "Ex-atracador." },
        { id: "CID-9988", name: "Luz Noceda", age: 22, gender: "F", status: "Limpio", criminalRecord: [], notes: "Estudiante de medicina." }
    ]
};

