
/**
 * NEXUS v6.22 - MASTER DATABASE (COMPLETE SMITH CATALOG)
 */

export const LEGAL_DB = {
    penal_code: [
        {
            category: "Vehículos e Infracciones",
            entries: [
                { id: "V-1", name: "Semáforo en Rojo", fine: 100, points: 1, cat: "Infracción" },
                { id: "V-15", name: "Conducción bajo efectos", fine: 750, points: 15, jail: 10, cat: "Delito leve A" },
                { id: "V-42", name: "Fraude en registro (Mayor)", fine: 2500, cat: "Delito", note: "VIN borrado." }
            ]
        },
        {
            category: "Narcóticos (S.M.I.T.H.)",
            entries: [
                { id: "N-1", name: "Posesión 2º Grado", fine: 500, cat: "Delito leve A" },
                { id: "N-2", name: "Posesión 1er Grado", fine: 2500, cat: "Delito grave B" },
                { id: "N-3", name: "Intención de distribuir (+1000)", fine: 15000, cat: "Delito grave A" }
            ]
        }
    ],

    smith_act: {
        global_threshold: 1000,
        thresholds: [
            // LISTA I
            { substance: "crack", first_degree: 51, second_degree: 1, list: "I" },
            { substance: "extasis", first_degree: 8, second_degree: 1, list: "I" },
            { substance: "heroin", first_degree: 1, second_degree: 0, list: "I" },
            { substance: "lsd", first_degree: 6, second_degree: 1, list: "I" },
            { substance: "metanfetamina", first_degree: 11, second_degree: 1, list: "I" },
            { substance: "mdpv", first_degree: 6, second_degree: 1, list: "I" },
            { substance: "zorfanyl", first_degree: 1, second_degree: 0, list: "I" },
            
            // LISTA II
            { substance: "adderall", first_degree: 11, second_degree: 1, list: "II" },
            { substance: "antiarritmicos", first_degree: 6, second_degree: 1, list: "II" },
            { substance: "ketamina", first_degree: 8, second_degree: 1, list: "II" },
            { substance: "morfina", first_degree: 1, second_degree: 0, list: "II" },
            { substance: "paralizantes", first_degree: 1, second_degree: 0, list: "II" },
            { substance: "peyote", first_degree: 21, second_degree: 1, list: "II" },
            
            // LISTA III
            { substance: "cannabis", first_degree: 131, second_degree: 4, legal_limit: 3, medical_limit: 10, list: "III" },
            { substance: "adrenalina", first_degree: 16, second_degree: 1, list: "III" },
            { substance: "antiinflamatorios", first_degree: 0, second_degree: 1, list: "III" }, // Cualquier cantidad es 2º grado
            { substance: "bullshark", first_degree: 8, second_degree: 1, list: "III" },
            { substance: "codeina", first_degree: 11, second_degree: 1, list: "III" },
            { substance: "inmunosupresores", first_degree: 11, second_degree: 1, list: "III" },
            { substance: "lidocaina", first_degree: 0, second_degree: 1, list: "III" },
            { substance: "relajantes musculares", first_degree: 11, second_degree: 1, list: "III" },
            { substance: "esteroides", first_degree: 11, second_degree: 1, list: "III" },
            { substance: "estimulantes", first_degree: 16, second_degree: 1, list: "III" },
            { substance: "farmacos psiquiatricos", first_degree: 11, second_degree: 1, list: "III" },
            { substance: "otros medicamentos", first_degree: 16, second_degree: 1, list: "III" }
        ],
        otc_list: [
            "Antibiotics", "Antihistamines", "Bozone", "Glucose", 
            "Laxatives", "Multi-Vitamins", "Painkillers", 
            "Substance O", "Formula 420"
        ],
        extra_charges: {
            purchase: "Compra de sustancia controlada",
            manufacturing: "Fabricación de sustancia controlada",
            distribution: "Posesión con intención de distribuir (+1000)"
        }
    }
};

