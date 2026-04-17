
/**
 * NEXUS CASE-CHECK v8.0 - Motor de Validación Híbrido (DOCTRINA COMPLETA)
 * Sincronizado exactamente con juris_db.js y Jurisprudencia.txt
 */

export class PoliceValidator {
    constructor() {
        this.facts = {
            // SOSPECHA RAZONABLE (RS) - INDICIOS
            "CAD Alert": { 
                title: "ALERTA CAD / 911", weight: 1, 
                cases: ["State v. Moody et al #2213"] 
            },
            "Descrip. Coincidente": { 
                title: "DESCRIPCIÓN COINCIDENTE", weight: 2, 
                cases: ["State v. Moody et al #2213"] 
            },
            "Olor a marihuana": { 
                title: "OLOR A MARIHUANA", weight: 2, 
                cases: ["State v. Cummins #6669", "State v. Moody et al #2213"] 
            },
            "Bulto de Arma": { 
                title: "BULTO DE ARMA / FRISK", weight: 3, 
                cases: ["State v. Marcus Grant #38778"] 
            },
            "Hot Gun": { 
                title: "ARMA VINCULADA A DELITO", weight: 4, 
                cases: ["Schwinghammer Statute (Hot Guns)"] 
            },
            "Entrada Emergencia": { 
                title: "PELIGRO DE VIDA INMINENTE", weight: 5, 
                cases: ["State v. Lawson #2166"] 
            },
            
            // CAUSA PROBABLE (CP) - INDICIOS
            "Huida": { 
                title: "HUIDA / EVASIÓN", weight: 4, 
                cases: ["State v. Grabmeier #5825", "State v. Glenn Armstrong Jr. #6952"] 
            },
            "K9 Alert": { 
                title: "MARCACIÓN K9", weight: 5, 
                cases: ["State v. Marah Winter (Ley Toast)", "Rodney Rogers v. K9 Hobbs (Ley Hobbs)"] 
            },
            "Vehículo Remolcado": { 
                title: "REGISTRO DE INVENTARIO", weight: 10, 
                cases: ["State v. Pantalones #7496"] 
            },
            "Custodia Policial": { 
                title: "BAJO CUSTODIA (MIRANDA)", weight: 10, 
                cases: ["Gage Cassidy v. The State #6479", "State v. Forelli (Regla Moberry)", "Bean-Blake Law (#34869)"] 
            }
        };
    }

    validate(selectedKeys) {
        let totalScore = 0;
        let applicableCases = [];
        let hasCP = false;
        let alerts = [];

        // REGLA FAQ: VIN CHECK
        if (selectedKeys.includes("VIN Check") && !selectedKeys.includes("Custodia Policial")) {
            alerts.push("⚠️ ERROR: No revisar VIN sin Custodia Policial (FAQ).");
        }

        selectedKeys.forEach(key => {
            const fact = this.facts[key];
            if (fact) {
                totalScore += fact.weight;
                applicableCases.push(...fact.cases);
            }
        });

        // LÓGICA DE CAUSA PROBABLE (CP)
        if (selectedKeys.includes("K9 Alert") || 
            selectedKeys.includes("Vehículo Remolcado") || 
            selectedKeys.includes("Custodia Policial") ||
            (selectedKeys.includes("Olor a marihuana") && selectedKeys.includes("CAD Alert"))) {
            hasCP = true;
        }

        const resultCases = [...new Set(applicableCases)];

        if (hasCP || totalScore >= 5) {
            return {
                status: "CAUSA PROBABLE (CP) ALCANZADA",
                color: "var(--accent-red)",
                actions: "REGISTRO COMPLETO / ARRESTO AUTORIZADO",
                cases: resultCases,
                alerts
            };
        } else if (totalScore >= 3) {
            return {
                status: "SOSPECHA RAZONABLE (RS) ALCANZADA",
                color: "var(--accent-gold)",
                actions: "DETENCIÓN / TERRY FRISK (SUPERFICIAL) AUTORIZADO",
                cases: resultCases,
                alerts
            };
        }

        return {
            status: "SITUACIÓN DOCUMENTADA",
            color: "var(--text-dim)",
            actions: "CONTINUAR INVESTIGACIÓN (Solo contacto consensuado)",
            cases: resultCases,
            alerts
        };
    }

    /**
     * Valida si un ciudadano es apto para licencia de armas
     * Requisitos Comunicado 13/04/2026
     */
    validateLicense(criminalRecord) {
        // Asumimos que criminalRecord es un array de objetos o IDs de cargos
        const bloodCrimes = ["Homicidio", "Asesinato", "Agresión", "Secuestro", "Mutilación"];
        const weaponCrimes = ["Posesión criminal de arma", "Venta de armas", "Fabricación de armas", "Exhibición de arma"];
        const heavyCrimes = ["Grave B", "Grave A"];

        let violations = [];

        criminalRecord.forEach(crime => {
            const crimeName = typeof crime === 'string' ? crime : crime.name;
            const crimeCat = typeof crime === 'string' ? "" : (crime.cat || "");

            if (bloodCrimes.some(b => crimeName.includes(b))) violations.push(`DELITO DE SANGRE: ${crimeName}`);
            if (weaponCrimes.some(w => crimeName.includes(w))) violations.push(`DELITO DE ARMAS: ${crimeName}`);
            if (heavyCrimes.some(h => crimeCat.includes(h))) violations.push(`DELITO SUPERIOR (Grave B+): ${crimeName}`);
        });

        if (violations.length > 0) {
            return {
                eligible: false,
                reason: "NO APTO PERMANENTE",
                violations: violations,
                color: "var(--accent-red)"
            };
        }

        return {
            eligible: true,
            reason: "APTO PARA TRÁMITE",
            violations: [],
            color: "var(--accent-green)"
        };
    }
}
