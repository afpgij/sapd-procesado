
/**
 * 🛡️ PROTECTED CORE MODULE - NEXUS PENALTY ENGINE v9.7
 * DO NOT MODIFY THIS FILE UNLESS EXPLICITLY INSTRUCTED BY THE USER.
 * Contains critical penal code data synced with Cargos.txt.
 */

export const PENALTY_DATA = {
    // INFRACCIONES
    "v-red-light": { name: "Semáforo en Rojo", jail: 0, fine: 100, cat: "Infracción", cumulative: true },
    "v-speeding": { name: "Exceso de Velocidad", jail: 0, fine: 175, cat: "Infracción", cumulative: true },
    "v-no-license": { name: "Conducir sin Licencia", jail: 0, fine: 175, cat: "Infracción", cumulative: false },
    "v-distraction": { name: "Conducción Distraída (Móvil)", jail: 0, fine: 100, cat: "Infracción", cumulative: true },
    
    // DELITOS DE TRÁFICO / VEHÍCULOS
    "v-evasion": { name: "Evasión Imprudente", jail: 25, fine: 400, cat: "Delito Grave D", cumulative: false, licenseRevoke: true },
    "v-stolen-2": { name: "Robo de Vehículo (2º Grado)", jail: 10, fine: 1500, cat: "Delito Leve A", cumulative: false },
    "v-stolen-1": { name: "Robo de Vehículo (1º Grado)", jail: 15, fine: 1500, cat: "Delito Grave D", cumulative: false },
    "v-fraud-min": { name: "Fraude Registro (Matrícula)", jail: 10, fine: 750, cat: "Delito Grave C", cumulative: false },
    "v-fraud-maj": { name: "Fraude Registro (Piezas/VIN)", jail: 0, fine: 7500, cat: "Delito Grave C", cumulative: false },
    "v-reckless": { name: "Conducción Temeraria", jail: 10, fine: 400, cat: "Delito Leve A", cumulative: false, licenseRevoke: true },
    "v-dui": { name: "Conducción Alcohol/Drogas", jail: 15, fine: 750, cat: "Delito Leve A", cumulative: false, licenseRevoke: true },
    "v-hit-run": { name: "Atropello y Fuga", jail: 30, fine: 700, cat: "Delito Grave D", cumulative: false, licenseRevoke: true },
    "v-street-race-org": { name: "Organización Carreras Callejeras", jail: 45, fine: 2000, cat: "Delito Grave C", cumulative: false },

    // DELITOS CONTRA PERSONAS
    "p-robbery-1": { name: "Robo 1er Grado (Bajo/Hurto)", jail: 10, fine: 700, cat: "Delito Leve B", cumulative: false },
    "p-robbery-viol": { name: "Robo con Violencia (1er Grado)", jail: 15, fine: 1000, cat: "Delito Grave D", cumulative: false },
    "p-robbery-2": { name: "Robo 2º Grado (Medio)", jail: 100, fine: 1500, cat: "Delito Grave B", cumulative: false }, 
    "p-robbery-inst": { name: "Robo Institución (Alto)", jail: 120, fine: 2500, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ COORDINAR CON NEGOCIACIÓN SI HAY REHENES" },
    "p-kidnapping": { name: "Secuestro", jail: 20, fine: 500, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ PRIORIDAD DE VIDA: SALVAGUARDAR VÍCTIMA" },
    "p-kidnapping-gov": { name: "Secuestro Empleado Gov", jail: 30, fine: 7000, cat: "Delito Grave B", cumulative: false },
    "p-assault": { name: "Agresión y Lesiones", jail: 10, fine: 400, cat: "Delito Leve A", cumulative: false },
    "p-assault-gov": { name: "Agresión Agente (Blanca/Cont.)", jail: 30, fine: 3500, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ INCAUTAR ARMA U OBJETO UTILIZADO" },
    "p-assault-gang": { name: "Agresión/Lesiones Pandillas", jail: 35, fine: 3500, cat: "Delito Grave B", cumulative: false },
    "p-homicide-3": { name: "Homicidio 3er Grado", jail: 40, fine: 2500, cat: "Delito Grave B", cumulative: false },
    "p-homicide-inv": { name: "Homicidio Involuntario", jail: 30, fine: 3500, cat: "Delito Grave B", cumulative: false },
    "p-mutilation-2": { name: "Mutilación 2do Grado", jail: 1200, fine: 0, cat: "Delito Grave B", cumulative: false },
    
    // ARMAS Y DROGAS
    "p-weapon-possession": { name: "Posesión Criminal de Arma", jail: 10, fine: 600, cat: "Delito Grave D", cumulative: false, reminder: "⚠️ VERIFICAR NÚMERO DE SERIE Y LICENCIA" },
    "p-weapon-pos-negligent": { name: "Posesión Negligente de Arma", jail: 0, fine: 500, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ REVISAR SI EXISTE DENUNCIA PREVIA DE ROBO/PÉRDIDA" },
    "p-weapon-pos-rifle": { name: "Posesión Criminal de Rifle", jail: 35, fine: 1500, cat: "Delito Grave D", cumulative: false },
    "p-weapon-pos-shotgun": { name: "Posesión Criminal de Escopeta", jail: 20, fine: 800, cat: "Delito Grave D", cumulative: false },
    "p-weapons-fire": { name: "Exhibición Arma de Fuego", jail: 10, fine: 225, cat: "Delito Leve A", cumulative: false },
    "p-shooting-negligent": { name: "Descarga Negligente Arma", jail: 10, fine: 400, cat: "Delito Leve A", cumulative: false },
    "p-shooting-reckless": { name: "Descarga Temeraria Arma", jail: 20, fine: 700, cat: "Delito Grave D", cumulative: false },
    "p-weapon-auto": { name: "Uso de Arma Automática", jail: 10, fine: 2000, cat: "Delito Grave D", cumulative: false, reminder: "⚠️ CARGO GRAVE - REVISAR TIER DE LICENCIA" },
    "p-weapon-explosive-pos": { name: "Posesión de Explosivos", jail: 30, fine: 950, cat: "Delito Grave D", cumulative: false },
    "p-weapon-explosive-use": { name: "Uso de Explosivos", jail: 40, fine: 6000, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ NOTIFICAR A UNIDAD E.O.D. PARA LIMPIEZA" },
    "p-accumulation-min": { name: "Acumulación Menor Armas (6+)", jail: 40, fine: 2000, cat: "Delito Grave D", cumulative: false, reminder: "⚠️ INCAUTAR TODAS LAS ARMAS DEL INVENTARIO/MALETERO" },
    "p-accumulation-maj": { name: "Acumulación Mayor Armas (15+)", jail: 75, fine: 15000, cat: "Delito Grave D", cumulative: false },
    "p-weapon-manufacture": { name: "Fabricación de Armas", jail: 0, fine: 0, cat: "Delito Grave A", cumulative: false },
    
    "p-drugs-2": { name: "Posesión Drogas 2º Grado", jail: 10, fine: 300, cat: "Delito Leve A", cumulative: false },
    "p-drugs-1": { name: "Posesión Drogas 1er Grado", jail: 25, fine: 1000, cat: "Delito Grave D", cumulative: false },
    "p-drugs-dist": { name: "Posesión Intención Distribuir", jail: 75, fine: 6500, cat: "Delito Grave D", cumulative: false, reminder: "⚠️ REVISAR PESO TOTAL Y PARAFERNALIA (BOLSAS/BALANZAS)" },
    "p-drugs-trafficking": { name: "Tráfico de Drogas", jail: 0, fine: 0, cat: "Delito Grave A", cumulative: false, reminder: "⚠️ NOTIFICAR A UNIDAD ANTINARCÓTICOS Y FISCALÍA" },
    "p-drugs-purchase": { name: "Compra de Sustancia Controlada", jail: 10, fine: 400, cat: "Delito Leve A", cumulative: false },

    // ORDEN PÚBLICO
    "p-resistance": { name: "Resistencia al Arresto", jail: 10, fine: 350, cat: "Delito Leve A", cumulative: false },
    "p-disobedience": { name: "Desobediencia Agente", jail: 10, fine: 300, cat: "Delito Leve A", cumulative: false },
    "p-obstruction": { name: "Obstrucción de Justicia", jail: 20, fine: 500, cat: "Delito Leve A", cumulative: false },
    "p-insults": { name: "Insultos a Funcionario", jail: 0, fine: 150, cat: "Delito Leve A", cumulative: true },
    "p-mask": { name: "Porte de Máscara", jail: 0, fine: 950, cat: "Infracción", cumulative: false },
    "p-bribery": { name: "Cohecho", jail: 5, fine: 225, cat: "Delito Leve B", cumulative: false, reminder: "⚠️ REQUERIDA PRUEBA DE OFRECIMIENTO DE SOBORNO" },
    "p-false-report": { name: "Denuncia Falsa", jail: 10, fine: 250, cat: "Delito Leve C", cumulative: false },
    "p-impersonation": { name: "Suplantación de Identidad", jail: 10, fine: 425, cat: "Delito Leve A", cumulative: false },
    "p-gov-impersonation": { name: "Suplantación Empleado Gov", jail: 20, fine: 700, cat: "Delito Grave D", cumulative: false },
    "p-vandalism": { name: "Vandalismo", jail: 5, fine: 500, cat: "Delito Leve A", cumulative: false },
    "p-vandalism-gov": { name: "Vandalismo Gob/Cementerio", jail: 15, fine: 1700, cat: "Delito Grave D", cumulative: false },
    "p-allanamiento": { name: "Allanamiento de Propiedad", jail: 7, fine: 200, cat: "Delito Leve A", cumulative: false },
    "p-allanamiento-agg": { name: "Allanamiento Agravado (Gob)", jail: 15, fine: 300, cat: "Delito Grave D", cumulative: false },
    "p-brujeria": { name: "Brujería (Magia/Rituales)", jail: 0, fine: 50, cat: "Infracción", cumulative: false, reminder: "💡 CARGO ADMINISTRATIVO - SOLO MULTA" },
    
    // ESPECIALES Y JUDICIALES
    "p-attempt-homicide-gov": { name: "Intento Homicidio Agente", jail: 60, fine: 7500, cat: "Delito Grave B", cumulative: false },
    "p-homicide": { name: "Homicidio", jail: 1200, fine: 7500, cat: "Delito Grave A", cumulative: false },
    "p-homicide-gov": { name: "Homicidio de Agente", jail: 0, fine: 0, cat: "Delito Grave A", cumulative: false, reminder: "⚠️ PROTOCOLO DE DUELO: NOTIFICAR ALTO MANDO" },
    "p-illegal-money": { name: "Posesión Dinero Ilegal (+$2k)", jail: 0, fine: 500, cat: "Delito Leve A", cumulative: false },
    "p-pogs": { name: "Agravante POGS (5+ Abatidos)", jail: 40, fine: 500, cat: "Delito Grave B", cumulative: true, reminder: "⚠️ APLICAR POR CADA 5 VÍCTIMAS (EXCLUYENDO AGENTES)" },
    "p-pogs-gov": { name: "Agravante POGS Agentes (5+)", jail: 60, fine: 2000, cat: "Delito Grave B", cumulative: true, reminder: "⚠️ APLICAR POR CADA 5 AGENTES ABATIDOS" },
    "p-perjury": { name: "Perjurio / Falso Testimonio", jail: 30, fine: 890, cat: "Delito Grave B", cumulative: false, reminder: "⚠️ VERIFICAR CONTRADICCIÓN EN DECLARACIÓN JURADA" },
    "p-court-contempt": { name: "Desacato al Tribunal", jail: 0, fine: 0, cat: "Delito Leve C", cumulative: false }
};

export class PenaltyEngine {
    calculate(selectedIds, collaborate = false) {
        let totalJail = 0; let totalFine = 0; let isBailable = true;
        selectedIds.forEach(id => {
            const data = PENALTY_DATA[id];
            if (data) {
                totalJail += data.jail; totalFine += data.fine;
                if (data.cat.includes("Grave A") || data.cat.includes("Grave B")) isBailable = false;
            }
        });
        if (collaborate) totalJail = Math.floor(totalJail * 0.75);
        return { 
            jail: totalJail, fine: totalFine, bailable: isBailable, 
            bailAmount: isBailable ? totalFine * 1.5 : "DENEGADA" 
        };
    }
}
