
/**
 * NEXUS v6.24 - CONSULTOR DE DOCUMENTOS Y JURISPRUDENCIA
 */

import { JURISPRUDENCIA_DB } from '../data/juris_db.js';

export class DocumentConsultant {
    constructor() {
        this.jurisprudence = JURISPRUDENCIA_DB;
    }

    getJurisprudence() {
        return this.jurisprudence;
    }

    searchCase(query) {
        const q = query.toLowerCase();
        return this.jurisprudence.filter(j => 
            j.case.toLowerCase().includes(q) || 
            j.topic.toLowerCase().includes(q) ||
            j.tags.some(t => t.toLowerCase().includes(q))
        );
    }
}
