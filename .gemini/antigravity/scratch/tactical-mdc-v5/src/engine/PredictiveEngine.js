/**
 * 🛰️ L.A.W. SYSTEM (LEGAL AI WARDEN) v2.0 - NEURAL SENTINEL
 * Motor de análisis predictivo de riesgo, reincidencia y cumplimiento penal.
 */

export class PredictiveEngine {
    constructor(penaltyData) {
        this.penaltyData = penaltyData;
        
        // Configuración de Pesos de Peligrosidad (Strikes/Categoría)
        this.CAT_WEIGHTS = {
            "Delito Grave A": 50,
            "Delito Grave B": 30,
            "Delito Grave C": 20,
            "Delito Grave D": 15,
            "Delito Leve A": 10,
            "Delito Leve B": 5,
            "Delito Leve C": 2,
            "Infracción": 1
        };

        // Mapeo de Strikes por Categoría (Cargos.txt)
        this.STRIKE_MAP = {
            "p-homicide": 8,
            "p-homicide-gov": 5,
            "p-attempt-homicide-gov": 5,
            "p-weapon-manufacture": 5,
            "p-fraud-maj": 5,
            "v-street-race-org": 5,
            "p-robbery-inst": 5,
            "v-reckless": 3,
            "v-dui": 3,
            "v-hit-run": 3,
            "p-assault-gov": 3,
            "p-robbery-viol": 2,
            "p-homicide-3": 2,
            "p-homicide-inv": 1,
            "p-weapon-pos-negligent": 1
        };
    }

    /**
     * Analiza el riesgo basado en los cargos actuales y el historial.
     */
    analyzeRisk(currentCharges, criminalRecord = []) {
        if (!currentCharges || currentCharges.length === 0) {
            return {
                riskLevel: "NULO",
                dangerScale: 0,
                recommendation: "Sin cargos activos.",
                factors: [],
                strikes: 0,
                bailable: true
            };
        }

        let score = 0;
        let totalStrikes = 0;
        const matchedFactors = new Set();
        const analysis = {
            riskLevel: "BAJO",
            dangerScale: 0,
            recommendation: "Procesamiento estándar.",
            factors: [],
            strikes: 0,
            bailable: true
        };

        // 1. Análisis de Gravedad y Strikes
        currentCharges.forEach(id => {
            const data = this.penaltyData[id];
            if (!data) return;

            // Peso por categoría
            const catWeight = this.CAT_WEIGHTS[data.cat] || 5;
            score += catWeight;

            // Conteo de Strikes
            if (this.STRIKE_MAP[id]) {
                totalStrikes += this.STRIKE_MAP[id];
                matchedFactors.add(`ACUMULACIÓN DE STRIKES: +${this.STRIKE_MAP[id]} (${data.name})`);
            }

            // Denegación de fianza automática por categoría
            if (data.cat.includes("Grave A") || data.cat.includes("Grave B")) {
                analysis.bailable = false;
                matchedFactors.add("DELITO NO FIANZABLE DETECTADO.");
            }
        });

        // 2. Análisis de Comportamiento (Factores Críticos)
        const categories = currentCharges.map(id => this.penaltyData[id]?.name || "");
        
        // Violencia Extrema
        if (categories.some(n => n.includes("Homicidio") || n.includes("Mutilación") || n.includes("Secuestro"))) {
            score += 30;
            matchedFactors.add("VIOLENCIA EXTREMA CONTRA PERSONAS.");
        }

        // Ataques al Estado
        if (categories.some(n => n.includes("Agente") || n.includes("Gob") || n.includes("Institución"))) {
            score += 25;
            matchedFactors.add("ATAQUE DIRECTO A FUNCIONARIO/ESTADO.");
        }

        // Armas y Explosivos
        if (categories.some(n => n.includes("Arma") || n.includes("Rifle") || n.includes("Explosivo"))) {
            score += 20;
            matchedFactors.add("DISPONIBILIDAD DE ARMAMENTO PESADO/ILEGAL.");
        }

        // Drogas (S.M.I.T.H Act)
        if (categories.some(n => n.includes("Sustancia") || n.includes("Distribución") || n.includes("Tráfico"))) {
            score += 15;
            matchedFactors.add("ACTIVIDAD RELACIONADA CON TRÁFICO ILÍCITO.");
        }

        // 3. Simulación de Reincidencia (si se proporciona historial)
        if (criminalRecord.length > 0) {
            const recidivismCount = currentCharges.filter(id => criminalRecord.includes(id)).length;
            if (recidivismCount > 0) {
                score += (recidivismCount * 15);
                matchedFactors.add(`REINCIDENCIA ESPECÍFICA DETECTADA (${recidivismCount} delitos repetidos).`);
            }
        }

        // 4. Cálculo de Escala y Nivel Final
        analysis.strikes = totalStrikes;
        analysis.factors = Array.from(matchedFactors);
        
        // Multiplicador por strikes acumulados
        score += (totalStrikes * 10);
        
        analysis.dangerScale = Math.min(score, 100);

        if (analysis.dangerScale >= 85 || totalStrikes >= 8) {
            analysis.riskLevel = "CRÍTICO";
            analysis.recommendation = "MÁXIMA SEGURIDAD. Fianza denegada. Traslado a prisión escoltado. Posible 10-13A/B.";
        } else if (analysis.dangerScale >= 60 || totalStrikes >= 5) {
            analysis.riskLevel = "ALTO";
            analysis.recommendation = "ALTO RIESGO. Revisar Derecho a Abogado (10 min). Notificar Mando si hay resistencia.";
        } else if (analysis.dangerScale >= 30 || totalStrikes >= 2) {
            analysis.riskLevel = "MEDIO";
            analysis.recommendation = "RIESGO MODERADO. Procesar con precaución. Verificar pertenencias en maletero.";
        } else {
            analysis.riskLevel = "BAJO";
            analysis.recommendation = "Procedimientos estándar de procesamiento y citación.";
        }

        return analysis;
    }
}

