
// Antigravity Nexus v5.0 Master Core - Persistent Edition
const PENAL_DB = [
    { id: "v_semaforo", name: "Semáforo en Rojo", fine: 100, time: 0, cat: "Infracción" },
    { id: "v_sin_lic", name: "Conducción sin licencia", fine: 175, time: 0, cat: "Infracción" },
    { id: "v_exc_vel_1", name: "Exceso velocidad (Grave)", fine: 300, time: 0, cat: "Infracción" },
    { id: "v_dui", name: "Conducción Alcohol/Drogas", fine: 750, time: 15, cat: "Delito Leve A" },
    { id: "v_evasion", name: "Evasión imprudente", fine: 400, time: 25, cat: "Delito Grave D" },
    { id: "v_hit_run", name: "Atropello y fuga", fine: 700, time: 30, cat: "Delito Grave D" },
    { id: "p_rob_viol", name: "Robo con Violencia", fine: 1000, time: 15, cat: "Delito Grave D" },
    { id: "p_rob_med", name: "Robo Medios (Segundo)", fine: 1500, time: 100, cat: "Delito Grave B" },
    { id: "p_rob_alt", name: "Robo Institución (Alto)", fine: 2500, time: 120, cat: "Delito Grave B" },
    { id: "p_secuestro", name: "Secuestro", fine: 500, time: 20, cat: "Delito Grave B" },
    { id: "p_agresion", name: "Agresión y lesiones", fine: 400, time: 10, cat: "Delito Leve A" },
    { id: "p_agresion_ag", name: "Agresión Agente", fine: 3500, time: 30, cat: "Delito Grave B" },
    { id: "p_armas_pos", name: "Posesión Negligente de Arma", fine: 500, time: 0, cat: "Delito Grave B", reminder: "⚠️ REVISAR SI EXISTE DENUNCIA" },
    { id: "p_armas_exh", name: "Exhibición Arma Fuego", fine: 225, time: 10, cat: "Delito Leve A" },
    { id: "p_armas_desc", name: "Descarga Negligente", fine: 400, time: 10, cat: "Delito Leve A" },
    { id: "p_explo_pos", name: "Posesión Explosivos", fine: 950, time: 30, cat: "Delito Grave D" },
    { id: "p_explo_uso", name: "Uso de Explosivos", fine: 6000, time: 40, cat: "Delito Grave B" },
    { id: "p_brujeria", name: "Brujería (Magia/Rituales)", fine: 50, time: 0, cat: "Infracción" },
    { id: "p_pogs", name: "Agravante POGS", fine: 500, time: 40, cat: "Delito Grave B" },
    { id: "o_res_arr", name: "Resistencia al arresto", fine: 350, time: 10, cat: "Delito Leve A" },
    { id: "o_obs_jus", name: "Obstrucción de Justicia", fine: 500, time: 20, cat: "Delito Leve A" },
    { id: "o_cohecho", name: "Cohecho (Soborno)", fine: 225, time: 5, cat: "Delito Leve B" }
];

const TACTICAL_DATA = {
    bolos: [
        { id: "BOLO-001", name: "John 'Scar' Doe", priority: "ALTA", description: "Sospechoso de atraco a mano armada. Visto última vez en Downtown.", lastSeen: "12:15 - San Andreas Ave" },
        { id: "BOLO-002", name: "Ramses V", priority: "MEDIA", description: "Conducción temeraria y evasión. Vehículo: Sultan RS Azul.", lastSeen: "11:30 - Sandy Shores" },
        { id: "BOLO-003", name: "Marta Wayne", priority: "CRÍTICA", description: "Fuga de prisión. Extremadamente peligrosa.", lastSeen: "09:00 - Terminal" }
    ],
    citizens: [
        { id: "CID-5050", name: "Arthur Morgan", age: 36, gender: "M", status: "Limpio", criminalRecord: [], notes: "Residente de Strawberry." },
        { id: "CID-1234", name: "Michael De Santa", age: 48, gender: "M", status: "Bajo Vigilancia", criminalRecord: ["r_rob_pri", "v_evasion"], notes: "Ex-atracador." },
        { id: "CID-9988", name: "Luz Noceda", age: 22, gender: "F", status: "Limpio", criminalRecord: [], notes: "Estudiante de medicina." }
    ],
    jurisprudence: [
        { title: "S.M.I.T.H. Act - Artículo 1", content: "Uso proporcional de la fuerza en arrestos de Tipo B." },
        { title: "Protocolo Miranda", content: "Deber de lectura de derechos tras privación de libertad inmediata." },
        { title: "Código de Registro", content: "Límites legales para el registro de vehículos sin orden judicial." }
    ]
};

class NexusCore {
    constructor() {
        this.logContainer = document.getElementById('telemetry-logs');
        this.viewport = document.getElementById('viewport');
        this.laws = PENAL_DB;
        this.data = JSON.parse(localStorage.getItem('nexus_persistent_data')) || TACTICAL_DATA;
        this.caseHistory = JSON.parse(localStorage.getItem('nexus_case_history')) || [];
        this.isRedAlert = localStorage.getItem('nexus_red_alert') === 'true';
        
        if (this.viewport) {
            this.init();
        }
    }

    init() {
        this.addLog('Nexus v5.0 Master Protocol inicializado.');
        this.addLog(`[OK] Memoria persistente cargada: ${this.caseHistory.length} registros.`);
        
        if (this.isRedAlert) document.body.classList.add('red-alert');

        this.renderView('dashboard');

        const nav = document.getElementById('main-nav');
        if (nav) {
            nav.addEventListener('click', (e) => {
                const link = e.target.closest('a');
                if (link && link.dataset.view) {
                    e.preventDefault();
                    this.switchNav(link);
                    this.renderView(link.dataset.view);
                }
            });
        }

        const alertBtn = document.getElementById('alert-toggle');
        if (alertBtn) alertBtn.addEventListener('click', () => this.toggleRedAlert());

        this.refreshIcons();
        setInterval(() => this.simulateTraffic(), 12000);
        this.saveData(); // Guardado inicial por si venimos de boilerplate
    }

    saveData() {
        localStorage.setItem('nexus_persistent_data', JSON.stringify(this.data));
        localStorage.setItem('nexus_case_history', JSON.stringify(this.caseHistory));
        localStorage.setItem('nexus_red_alert', this.isRedAlert);
    }

    refreshIcons() {
        if (window.lucide) window.lucide.createIcons();
    }

    switchNav(activeEl) {
        document.querySelectorAll('#main-nav a').forEach(l => l.classList.remove('active'));
        activeEl.classList.add('active');
    }

    toggleRedAlert() {
        this.isRedAlert = !this.isRedAlert;
        document.body.classList.toggle('red-alert', this.isRedAlert);
        const btn = document.getElementById('alert-toggle');
        if (this.isRedAlert) {
            this.addLog('[CRÍTICO] ALERTA ROJA ACTIVADA');
            btn.innerHTML = `<i data-lucide="shield-off" style="width: 14px;"></i> DESACTIVAR ALERTA`;
            btn.style.background = '#ff4a4a';
            btn.style.color = 'white';
        } else {
            this.addLog('[INFO] PROTOCOLO NORMAL RESTABLECIDO');
            btn.innerHTML = `<i data-lucide="shield-alert" style="width: 14px;"></i> ALERTA ROJA`;
            btn.style.background = 'rgba(255, 74, 74, 0.1)';
            btn.style.color = '#ff4a4a';
        }
        this.saveData();
        this.refreshIcons();
    }

    renderView(viewId) {
        if (!this.viewport) return;
        this.viewport.innerHTML = '';
        this.viewport.classList.remove('view-transition');
        void this.viewport.offsetWidth;
        this.viewport.classList.add('view-transition');

        this.addLog(`Render: ${viewId.toUpperCase()}`);

        switch(viewId) {
            case 'dashboard': this.renderDashboard(); break;
            case 'bolos': this.renderBolos(); break;
            case 'cargos': this.renderCargos(); break;
            case 'crm': this.renderCRM(); break;
            case 'jurisprudencia': this.renderJurisprudencia(); break;
            case 'analizador': this.renderAnalizador(); break;
            case 'historial': this.renderHistory(); break; // Nueva vista
        }
        this.refreshIcons();
    }

    renderDashboard() {
        this.viewport.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column; gap: 20px;">
                <h2 class="font-orbitron" style="color: var(--accent-primary);">NEXUS HUB</h2>
                
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px;">
                    <div class="panel" style="background: rgba(0, 212, 255, 0.05); text-align: center;">
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">HISTORIAL</span>
                        <p style="font-size: 2rem; font-weight: bold; font-family: Orbitron; color: var(--accent-primary);">${this.caseHistory.length}</p>
                    </div>
                    <div class="panel" style="background: rgba(255, 74, 74, 0.05); text-align: center;">
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">AVISOS BOLO</span>
                        <p style="font-size: 2rem; font-weight: bold; font-family: Orbitron; color: var(--accent-critical);">${this.data.bolos.length}</p>
                    </div>
                    <div class="panel" style="background: rgba(112, 0, 255, 0.05); text-align: center;">
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">CIUDADANOS</span>
                        <p style="font-size: 2rem; font-weight: bold; font-family: Orbitron; color: #7000ff;">${this.data.citizens.length}</p>
                    </div>
                    <div class="panel" style="background: rgba(0,0,0,0.2); text-align: center;">
                        <span style="font-size: 0.6rem; color: var(--text-secondary);">ESTADO MEMORIA</span>
                        <p style="font-size: 2rem; font-weight: bold; font-family: Orbitron; color: #4ade80;">OK</p>
                    </div>
                </div>

                <div class="panel" style="flex: 1; min-height: 250px; background: #000; position: relative; overflow: hidden; border: 1px solid rgba(0,212,255,0.1);">
                    <svg width="100%" height="100%" viewBox="0 0 800 400" preserveAspectRatio="xMidYMid slice" style="opacity: 0.3">
                        <path d="M0,200 Q200,100 400,200 T800,200" fill="none" stroke="var(--accent-primary)" stroke-width="0.5" />
                        <circle cx="200" cy="150" r="3" fill="var(--accent-critical)" />
                        <circle cx="500" cy="250" r="3" fill="var(--accent-primary)" />
                        <circle cx="200" cy="300" r="1.5" fill="var(--accent-secondary)" />
                    </svg>
                    <div style="position: absolute; top: 15px; left: 15px;">
                        <h4 class="font-orbitron" style="font-size: 0.75rem; color: var(--accent-primary); margin-bottom: 5px;">MAPA TÁCTICO PERSISTENTE</h4>
                        <p style="font-size: 0.6rem; color: var(--text-secondary);">Posiciones de la última sesión sincronizadas.</p>
                    </div>
                </div>
            </div>
        `;
    }

    renderBolos() {
        this.viewport.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h2 class="font-orbitron" style="color: var(--accent-critical);">AVISOS BOLO ACTIVOS</h2>
                <div class="bolo-grid">
                    ${this.data.bolos.map(bolo => `
                        <div class="bolo-card">
                            <div class="bolo-header">
                                <span class="font-orbitron" style="font-size: 0.7rem; color: var(--accent-critical);">${bolo.id}</span>
                                <span style="background: ${bolo.priority === 'CRÍTICA' ? 'var(--accent-critical)' : 'rgba(255,255,255,0.1)'}; font-size: 0.6rem; padding: 2px 8px; border-radius: 4px;">${bolo.priority}</span>
                            </div>
                            <div style="height: 120px; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center;">
                                <i data-lucide="user" style="width: 32px; opacity: 0.2;"></i>
                            </div>
                            <div style="padding: 15px;">
                                <h4 style="margin-bottom: 5px;">${bolo.name}</h4>
                                <p style="font-size: 0.7rem; color: var(--text-secondary); height: 35px; overflow: hidden;">${bolo.description}</p>
                                <div style="margin-top: 10px; font-size: 0.6rem; display: flex; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 5px;">
                                    <span>VISTO: <span style="color: white">${bolo.lastSeen}</span></span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderCargos() {
        this.viewport.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h2 class="font-orbitron" style="color: var(--accent-primary);">CÓDIGO PENAL S.M.I.T.H</h2>
                <input type="text" id="law-search" class="search-input" placeholder="Buscar cargo o ID...">
                <div id="laws-display" class="laws-grid"></div>
            </div>
        `;
        const input = document.getElementById('law-search');
        if (input) input.addEventListener('input', (e) => this.filterLaws(e.target.value));
        this.displayLaws(this.laws);
    }

    displayLaws(list) {
        const display = document.getElementById('laws-display');
        display.innerHTML = list.map(law => {
            const catCls = law.cat.toLowerCase().replace(/ /g, '-').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            return `
                <div class="law-card">
                    <div class="law-header">
                        <span class="law-id">#${law.id}</span>
                        <span class="law-cat cat-${catCls}">${law.cat}</span>
                    </div>
                    <h4 style="font-size: 0.8rem;">${law.name}</h4>
                    <div class="law-footer">
                        <div class="law-stat"><span class="stat-label">Multa</span><span class="stat-value" style="color: #4ade80">$${law.fine}</span></div>
                        <div class="law-stat"><span class="stat-label">Tiempo</span><span class="stat-value" style="color: #fbbf24">${law.time}m</span></div>
                    </div>
                </div>`;
        }).join('');
    }

    filterLaws(q) {
        const query = q.toLowerCase();
        this.displayLaws(this.laws.filter(l => l.name.toLowerCase().includes(query) || l.id.toLowerCase().includes(query)));
    }

    renderCRM() {
        this.viewport.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h2 class="font-orbitron" style="color: var(--accent-primary);">CIUDADANOS (CRM PERSISTENTE)</h2>
                <input type="text" id="citizen-search" class="search-input" placeholder="Nombre o ID ciudadano...">
                <div id="citizen-results" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                     ${this.data.citizens.map(c => this.createCitizenCard(c)).join('')}
                </div>
            </div>
        `;
        const input = document.getElementById('citizen-search');
        if (input) input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            const res = this.data.citizens.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
            document.getElementById('citizen-results').innerHTML = res.map(c => this.createCitizenCard(c)).join('');
        });
    }

    createCitizenCard(c) {
        // Obtenemos nombres de cargos reales para el historial criminal
        const crimes = c.criminalRecord.map(id => {
            const law = this.laws.find(l => l.id === id);
            return law ? law.name : id;
        }).join(', ');

        return `
            <div class="law-card" style="border-left: 4px solid ${c.status === 'Limpio' ? '#4ade80' : '#ff4a4a'}">
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                    <span class="law-id">${c.id}</span>
                    <span style="font-size: 0.6rem; color: ${c.status === 'Limpio' ? '#4ade80' : '#ff4a4a'}">${c.status.toUpperCase()}</span>
                </div>
                <h4>${c.name}</h4>
                <div style="font-size: 0.7rem; color: var(--text-secondary);">
                    <span>${c.age} años | ${c.gender}</span>
                    <p style="margin-top: 8px; color: var(--accent-primary); font-size: 0.65rem;">HISTORIAL: <span style="color: var(--text-primary)">${crimes || 'Ninguno'}</span></p>
                    <p style="margin-top: 5px; italic; opacity: 0.6;">${c.notes}</p>
                </div>
            </div>
        `;
    }

    renderAnalizador() {
        this.viewport.innerHTML = `
            <div style="height: 100%; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 20px;">
                    <h2 class="font-orbitron" style="color: var(--accent-primary);">ANALIZADOR SMITH v5.2</h2>
                    <button id="save-report" class="search-input" style="width: auto; padding: 5px 15px; background: var(--accent-secondary); border: none; font-size: 0.7rem; cursor: pointer; visibility: hidden;">GUARDAR EN MEMORIA</button>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 350px; gap: 20px; flex: 1;">
                    <div class="panel" style="display: flex; flex-direction: column; background: rgba(0,0,0,0.3);">
                        <textarea id="debrief-input" class="search-input" style="flex: 1; resize: none; border-color: transparent;" placeholder="Describa el incidente ocurrido..."></textarea>
                    </div>
                    <div class="panel" id="detector-side" style="background: rgba(0, 212, 255, 0.02);">
                        <h4 class="font-orbitron" style="color: var(--accent-primary); font-size: 0.75rem; margin-bottom: 15px;">CARGOS SUGERIDOS</h4>
                        <div id="detection-results" style="display: flex; flex-direction: column; gap: 8px;"></div>
                    </div>
                </div>
            </div>
        `;

        const debriefInput = document.getElementById('debrief-input');
        const saveBtn = document.getElementById('save-report');
        
        debriefInput.addEventListener('input', (e) => {
            const results = this.analyzeText(e.target.value);
            saveBtn.style.visibility = (results.length > 0 && e.target.value.length > 10) ? 'visible' : 'hidden';
            this.currentDetections = results;
        });

        saveBtn.addEventListener('click', () => {
            const report = {
                id: Date.now(),
                timestamp: new Date().toLocaleString(),
                text: debriefInput.value,
                charges: this.currentDetections.map(d => d.name)
            };
            this.caseHistory.unshift(report);
            this.saveData();
            this.addLog('[MEMORIA] Caso guardado en el historial.');
            this.renderView('historial');
        });
    }

    renderHistory() {
        this.viewport.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h2 class="font-orbitron" style="color: var(--accent-primary);">REGISTRO DE MEMORIA NEXUS</h2>
                    <button id="clear-history" style="background: transparent; border: 1px solid var(--accent-critical); color: var(--accent-critical); padding: 5px 10px; border-radius: 4px; font-size: 0.6rem; cursor: pointer;">LIMPIAR MEMORIA</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${this.caseHistory.length === 0 ? '<p style="text-align:center; margin-top: 50px; opacity: 0.5;">No hay casos registrados en la memoria local.</p>' : ''}
                    ${this.caseHistory.map(h => `
                        <div class="panel" style="background: rgba(255,255,255,0.02); border-left: 2px solid var(--accent-secondary);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span style="font-size: 0.6rem; color: var(--accent-secondary); font-family: Orbitron;">ID-${h.id}</span>
                                <span style="font-size: 0.6rem; color: var(--text-secondary);">${h.timestamp}</span>
                            </div>
                            <p style="font-size: 0.8rem; margin-bottom: 10px; color: var(--text-primary); line-height: 1.4;">${h.text}</p>
                            <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                                ${h.charges.map(c => `<span style="font-size: 0.55rem; background: rgba(0, 212, 255, 0.1); color: var(--accent-primary); padding: 2px 6px; border-radius: 10px; border: 1px solid rgba(0, 212, 255, 0.2);">${c}</span>`).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const clearBtn = document.getElementById('clear-history');
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (confirm("¿Estás seguro de borrar toda la memoria de incidentes?")) {
                this.caseHistory = [];
                this.saveData();
                this.renderView('historial');
            }
        });
    }

    analyzeText(text) {
        const container = document.getElementById('detection-results');
        if (!text.trim()) {
            container.innerHTML = '<p style="font-size: 0.7rem; opacity: 0.5; color: center;">Esperando relato...</p>';
            return [];
        }

        const lowerText = text.toLowerCase();
        const keywords = {
            'velocidad': ['exc_vel'], 'rojo': ['semaforo'], 'licencia': ['sin_lic'],
            'arma': ['fue', 'arm', 'bla'], 'pistola': ['fue'], 'cuchillo': ['bla'],
            'pegar': ['agresion'], 'robo': ['robo', 'hurto'], 'fuga': ['fuga', 'evasion']
        };

        const detected = new Set();
        Object.keys(keywords).forEach(key => {
            if (lowerText.includes(key)) keywords[key].forEach(id => {
                const match = this.laws.find(l => l.id.includes(id));
                if (match) detected.add(match);
            });
        });

        const results = Array.from(detected);
        container.innerHTML = results.map(law => `
            <div class="law-card" style="padding: 8px; border-left: 2px solid var(--accent-primary); margin: 0;">
                <h5 style="font-size: 0.7rem;">${law.name}</h5>
            </div>
        `).join('');
        
        return results;
    }

    renderJurisprudencia() {
        this.viewport.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 20px;">
                <h2 class="font-orbitron" style="color: var(--accent-primary);">PROTOCOLOS TÁCTICOS</h2>
                <div style="display: flex; flex-direction: column; gap: 15px;">
                    ${this.data.jurisprudence.map(j => `
                        <div class="panel" style="background: rgba(255,255,255,0.02);">
                            <h4 class="font-orbitron" style="font-size: 0.8rem; color: var(--accent-primary); margin-bottom: 5px;">${j.title}</h4>
                            <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5;">${j.content}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    addLog(message) {
        if (!this.logContainer) return;
        const log = document.createElement('div');
        log.style.marginBottom = '4px';
        log.innerHTML = `<span style="opacity: 0.5">[${new Date().toLocaleTimeString()}]</span> ${message}`;
        this.logContainer.prepend(log);
    }

    simulateTraffic() {
        const msgs = ["Sincronizando registros persistentes...", "Escaneando BBDD ciudadana...", "Memoria de incidentes optimizada."];
        this.addLog(msgs[Math.floor(Math.random() * msgs.length)]);
    }
}

document.addEventListener('DOMContentLoaded', () => { window.nexus = new NexusCore(); });
