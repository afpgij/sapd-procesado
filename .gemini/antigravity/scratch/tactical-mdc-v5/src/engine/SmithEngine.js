
/**
 * NEXUS SMITH ENGINE v6.23 - Lógica OTC y Tolerancia Activa
 */

import { LEGAL_DB } from '../data/legal_db.js';

export class SmithEngine {
    constructor() {
        this.config = LEGAL_DB.smith_act;
    }

    analyzeSubstance(name, amount, hasMedicalCard = false) {
        const drug = this.config.thresholds.find(d => d.substance.toLowerCase() === name.toLowerCase());
        const isOTC = this.config.otc_list.includes(name);

        // REGLA DE LAS 1000 UNIDADES (FAQ)
        if (amount >= this.config.global_threshold) {
            return {
                degree: "POSESIÓN CON INTENCIÓN DE DISTRIBUIR (+1000)",
                fine: "$15.000",
                color: "var(--accent-red)",
                isLegal: false,
                isOTC: false
            };
        }

        // LÓGICA DE VENTA LIBRE (OTC)
        if (isOTC) {
            return {
                degree: `VENTA LIBRE (OTC): ${name.toUpperCase()}`,
                fine: "$0",
                color: "#4ade80", // GREEN
                isLegal: true,
                isOTC: true
            };
        }

        if (!drug) return { degree: `No catalogada: ${name.toUpperCase()}`, fine: "$0", color: "var(--text-dim)", isLegal: true, isOTC: false };

        // LÓGICA DE TOLERANCIA (CANNABIS)
        let threshold_legal = drug.legal_limit || 0;
        if (name.toLowerCase() === 'cannabis' && hasMedicalCard) {
            threshold_legal = drug.medical_limit || 10;
        }

        if (amount <= threshold_legal) {
            return {
                degree: `POSESIÓN AUTORIZADA (${amount} Unidades)`,
                fine: "$0",
                color: "#4ade80",
                isLegal: true,
                isOTC: false
            };
        }

        if (drug.first_degree > 0 && amount >= drug.first_degree) {
            return { degree: "POSESIÓN EN PRIMER GRADO", fine: "$2.500", color: "var(--accent-red)", isLegal: false, isOTC: false };
        }

        return { degree: "POSESIÓN EN SEGUNDO GRADO", fine: "$500", color: "var(--accent-gold)", isLegal: false, isOTC: false };
    }
}
