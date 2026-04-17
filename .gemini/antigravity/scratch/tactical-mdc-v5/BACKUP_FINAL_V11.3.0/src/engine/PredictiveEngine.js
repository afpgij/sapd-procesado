
/**
 * 🛰️ L.A.W. SYSTEM (LEGAL AI WARDEN) v1.0
 * Motor de análisis predictivo de riesgo y reincidencia.
 */

export class PredictiveEngine {
    constructor(penaltyData) {
        this.penaltyData = penaltyData;
    }

    /**
     * Analiza el riesgo basado en el historial y los cargos actuales.
     * @param {Array} currentCharges - IDs de cargos actuales.
     * @param {Array} criminalRecord - IDs de cargos previos en el MDW.
     */
    analyzeRisk(currentCharges, criminalRecord = []) {
        let score = 0;
        const analysis = {
            riskLevel: "BAJO",
            recidivism: false,
            dangerScale: 0,
            recommendation: "Procesamiento estándar.",
            factors: []
        };

        if (currentCharges.length === 0) return analysis;

        // 1. Análisis de Gravedad Actual
        currentCharges.forEach(id => {
            const data = this.penaltyData[id];
            if (!data) return;

            if (data.cat.includes("Grave A")) score += 40;
            else if (data.cat.includes("Grave B")) score += 25;
            else if (data.cat.includes("Grave D")) score += 15;
            else score += 5;
        });

        // 2. Análisis de Reincidencia
        const common = currentCharges.filter(id => criminalRecord.includes(id));
        if (common.length > 0) {
            analysis.recidivism = true;
            score += (common.length * 20);
            analysis.factors.push(`REINCIDENCIA DETECTADA: ${common.length} cargo(s) repetido(s).`);
        }

        // 3. Factores de Peligrosidad (Violencia/Armas)
        const violentKeywords = ["Homicidio", "Agresión", "Secuestro", "Arma", "Tiroteo"];
        const isViolent = currentCharges.some(id => {
            const name = this.penaltyData[id].name;
            return violentKeywords.some(kw => name.includes(kw));
        });

        if (isViolent) {
            score += 20;
            analysis.factors.push("COMPORTAMIENTO VIOLENTO/ARMADO DETECTADO.");
        }

        // 4. Determinación de Nivel y Recomendación
        analysis.dangerScale = Math.min(score, 100);

        if (analysis.dangerScale >= 80) {
            analysis.riskLevel = "EXTREMO";
            analysis.recommendation = "FIANZA DENEGADA. Prisión preventiva inmediata. Vigilancia máxima.";
        } else if (analysis.dangerScale >= 50) {
            analysis.riskLevel = "ALTO";
            analysis.recommendation = "FIANZA ELEVADA (+50%). Riesgo de fuga o reincidencia.";
        } else if (analysis.dangerScale >= 25) {
            analysis.riskLevel = "MEDIO";
            analysis.recommendation = "Procesamiento estándar con supervisión.";
        }

        return analysis;
    }
}
