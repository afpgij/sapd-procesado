
/**
 * NEXUS v11.0-K - DEBRIEF INTELLIGENCE RESTORE
 */

import { NexusUI } from './ui/NexusUI.js';
import { DocumentConsultant } from './engine/DocumentConsultant.js';
import { SmithEngine } from './engine/SmithEngine.js';
import { PoliceValidator } from './engine/PoliceValidator.js';
import { PenaltyEngine, PENALTY_DATA } from './engine/PenaltyEngine.js';
import { SituationAnalyzer } from './engine/SituationAnalyzer.js';
import { PredictiveEngine } from './engine/PredictiveEngine.js';
import { LEGAL_DB } from './data/legal_db.js';
import { FORCE_DB } from './data/force_db.js';
import { INTEL_DB } from './data/intel_db.js';
import { TACTICAL_DATA } from './data/tactical_db.js';
import { RADIO_DB } from './data/radio_db.js';
import { CHANGELOG_DATA } from './data/changelog_db.js';

class NexusMain {
    constructor() {
        this.selectedCharges = [];
        this.ui = new NexusUI(document.getElementById('nexus-app'));
        this.consultant = new DocumentConsultant();
        this.smith = new SmithEngine();
        this.validator = new PoliceValidator();
        this.penalties = new PenaltyEngine();
        this.analyzer = new SituationAnalyzer();
        this.predictive = new PredictiveEngine(PENALTY_DATA);
        this.voiceEnabled = true;
        this.init();
    }

    async init() {
        this.ui.renderLayout();
        this.ui.showApp();
        this.addLog("O.L.E.T. Systems ONLINE. Version v11.7.0 Tactical Shield Active.");
        this.setupEventListeners();
        this.renderProcesado();
        this.renderChangelog();
        this.playWelcome();
    }

    playWelcome() {
        if (!this.voiceEnabled) return;
        const msg = new SpeechSynthesisUtterance("Sistema O L E T conectado. Base de datos federal sincronizada. Bienvenido, Oficial.");
        msg.lang = 'es-ES';
        msg.rate = 0.9;
        msg.pitch = 0.8; // Voz un poco más profunda y táctica
        window.speechSynthesis.speak(msg);
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) { e.preventDefault(); this.switchView(navItem.dataset.view, navItem); }
        });

        document.getElementById('view-changelog').onclick = (e) => {
            e.preventDefault();
            document.getElementById('changelog-modal').style.display = 'flex';
        };

        document.getElementById('close-changelog').onclick = () => {
            document.getElementById('changelog-modal').style.display = 'none';
        };
    }

    renderChangelog() {
        const list = document.getElementById('changelog-list');
        list.innerHTML = CHANGELOG_DATA.map(v => `
            <div style="border-left: 2px solid var(--accent-cyan); padding-left: 20px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-family:'Orbitron'; color:var(--accent-cyan); font-size:0.8rem;">${v.version}</span>
                    <span style="font-size:0.6rem; opacity:0.4;">${v.date}</span>
                </div>
                <h6 style="font-size:0.65rem; color:white; margin-bottom:10px; font-weight:bold;">${v.title}</h6>
                <ul style="font-size:0.65rem; color:var(--text-dim); line-height:1.6; padding-left:15px;">
                    ${v.changes.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }

    switchView(viewId, navEl) {
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        navEl.classList.add('active');
        const titleEl = document.getElementById('current-view-title');
        if (titleEl) titleEl.innerText = viewId.toUpperCase();
        switch(viewId) {
            case 'procesado': this.renderProcesado(); break;
            case 'radio': this.renderRadio(); break;
            case 'comunicados': this.renderComunicados(); break;
            case 'validator': this.renderValidator(); break;
            case 'smith': this.renderSmith(); break;
            case 'jurisprudence': this.renderJurisprudence(); break;
            case 'intel': this.renderIntel(); break;
            case 'force': this.renderForce(); break;
            case 'dashboard': this.renderDashboard(); break;
        }
    }

    // --- MÓDULO: PROCESADO (CON DEBRIEF) ---
    renderProcesado() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-primary); font-size: 0.8rem; margin-bottom: 25px;">ONX LAW ENFORCEMENT TERMINAL (O.L.E.T.)</h4>
                
                <!-- PROTOCOL REMINDER -->
                <div style="background:rgba(59, 130, 246, 0.05); border:1px solid var(--accent-primary); padding:10px 20px; border-radius:4px; margin-bottom:20px; display:flex; align-items:center; gap:15px; animation:fadeIn 0.5s ease;">
                    <i data-lucide="info" style="width:16px; height:16px; color:var(--accent-primary);"></i>
                    <span style="font-size:0.65rem; color:var(--text-dim); letter-spacing:0.5px;">PROCOLO O.L.E.T.: REVISAR PERFIL DEL SUJETO ANTES DE PROCESAR (ÓRDENES DE ARRESTO / LICENCIAS).</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui); margin-bottom:20px;">
                            <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:12px;">DETECCIÓN AUTOMÁTICA DE DELITOS</h5>
                            <textarea id="narrative-input" placeholder="Relata el incidente para detectar delitos automáticamente..." style="width:100%; height:110px; background:rgba(0,0,0,0.3); border:1px solid var(--border-ui); color:white; padding:15px; font-family:'JetBrains Mono'; font-size:0.65rem; border-radius:4px;"></textarea>
                            <div id="narrative-suggestions" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px;"></div>
                        </div>
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui);">
                            <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:12px;">BÚSQUEDA MANUAL</h5>
                            <input type="text" id="sch" placeholder="Busca delito..." style="width:100%; height:42px; background:#000; border:1px solid var(--border-ui); color:white; padding:0 15px; border-radius:4px;">
                            <div id="lst" style="max-height:180px; overflow-y:auto; margin-top:10px;"></div>
                        </div>
                    </div>
                    <div class="panel" style="padding:25px; border:1px solid var(--border-ui); background:rgba(0,0,0,0.1);">
                        <h5 style="font-size:0.6rem; color:var(--accent-primary);">EXPEDIENTE TÁCTICO</h5>
                        <div id="exp" style="min-height:220px; padding:15px; border:1px dashed rgba(255,255,255,0.05); margin-bottom:20px;"></div>
                        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                            <label style="font-size:0.65rem; color:white;"><input type="checkbox" id="collab"> COLABORACIÓN (-25%)</label>
                            <button onclick="window.clearExp()" style="background:none; border:none; color:red; font-size:0.55rem; cursor:pointer;">[ BORRAR TODO ]</button>
                        </div>
                        <div id="total" style="text-align:center; padding:20px; background:#050505; border:1px solid var(--accent-primary); border-left:5px solid var(--accent-primary); color:white; font-weight:bold; font-size:1.4rem; border-radius:4px;">CÁRCEL: 0m | MULTA: $0</div>
                        
                        <!-- DYNAMIC PROTOCOL ALERTS -->
                        <div id="protocol-alerts" style="margin-top:10px;"></div>
                        <div style="margin-top:20px;">
                            <button id="btn-save-pc" class="smith-btn" style="background:var(--accent-primary); color:white; width:100%; letter-spacing:1px; box-shadow:0 4px 10px rgba(59, 130, 246, 0.2);">💾 GUARDAR EXPEDIENTE EN PC</button>
                        </div>
                    </div>
                </div>
            </div>`;
        this.setupChargeHandlers(); 
        this.updateExpediente();
        this.setupDesktopControls();
        this.setupOpacitySlider();
    }

    setupOpacitySlider() {
        const slider = document.getElementById('opacity-slider');
        if (slider && window.nexusNative) {
            slider.oninput = (e) => {
                window.nexusNative.setOpacity(e.target.value);
            };
        }
    }

    setupDesktopControls() {
        const btnSave = document.getElementById('btn-save-pc');

        if (btnSave) {
            btnSave.onclick = () => {
                const totalText = document.getElementById('total').innerText;
                const charges = this.selectedCharges.map(id => `- ${PENALTY_DATA[id].name}`).join('\n');
                const content = `INFORME O.L.E.T.\nFecha: ${new Date().toLocaleString()}\n\nCARGOS:\n${charges}\n\nRESULTADO:\n${totalText}`;
                if (window.nexusNative) window.nexusNative.saveReport("Oficial", content);
            };
        }
    }

    // --- GESTIÓN DE CARGOS ---
    setupChargeHandlers() {
        const sch = document.getElementById('sch');
        const nar = document.getElementById('narrative-input');
        
        nar.oninput = () => {
            const sug = this.analyzer.analyze(nar.value);
            document.getElementById('narrative-suggestions').innerHTML = sug.map(s => `
                <button onclick="window.addCharge('${s.id}')" style="background:var(--accent-cyan); color:black; border:none; padding:5px 12px; font-size:0.55rem; cursor:pointer; border-radius:15px; font-weight:bold; animation:fadeIn 0.3s ease;">+ ${s.name}</button>
            `).join('');
        };

        const upd = (filter = "") => {
            const list = document.getElementById('lst');
            const f = filter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            list.innerHTML = Object.entries(PENALTY_DATA)
                .filter(([id, d]) => {
                    const name = d.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    return name.includes(f) || id.includes(f);
                })
                .map(([id, d]) => `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.02); margin-bottom:4px; border-radius:4px; transition:all 0.2s;" onmouseover="this.style.background='rgba(59, 130, 246, 0.1)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
                    <div><div style="font-size:0.7rem; color:white; font-weight:bold;">${d.name}</div><div style="font-size:0.55rem; color:var(--accent-amber); opacity:0.8;">$${d.fine.toLocaleString()} | ${d.jail}m</div></div>
                    <button onclick="window.addCharge('${id}')" style="background:var(--accent-primary); border:none; padding:6px 14px; cursor:pointer; border-radius:4px; font-weight:bold; color:white; font-size:0.8rem;">+</button>
                </div>
            `).join('');
        };
        sch.oninput = (e) => upd(e.target.value);
        window.addCharge = (id) => { if (!PENALTY_DATA[id].cumulative && this.selectedCharges.includes(id)) return; this.selectedCharges.push(id); this.updateExpediente(); };
        window.removeCharge = (i) => { this.selectedCharges.splice(i, 1); this.updateExpediente(); };
        window.clearExp = () => { this.selectedCharges = []; this.updateExpediente(); };
        upd();
    }

    updateExpediente() {
        const l = document.getElementById('exp');
        const t = document.getElementById('total');
        if (!l) return;
        
        if (this.selectedCharges.length === 0) { 
            l.innerHTML = `<div style="text-align:center; padding-top:40px; font-size:0.6rem; color:var(--text-dim);">Expediente vacío.</div>`; 
            t.innerHTML = "CÁRCEL: 0m | MULTA: $0"; 
            if (document.getElementById('protocol-alerts')) document.getElementById('protocol-alerts').innerHTML = '';
            return; 
        }

        let rawJail = 0; 
        let rawFine = 0; 
        const isCollab = document.getElementById('collab')?.checked;
        const needsRevoke = this.selectedCharges.some(id => PENALTY_DATA[id].licenseRevoke);

        l.innerHTML = this.selectedCharges.map((id, index) => {
            const d = PENALTY_DATA[id];
            rawJail += d.jail;
            rawFine += d.fine;
            const reminderHtml = d.reminder ? `<div style="font-size:0.5rem; color:var(--accent-gold); margin-top:4px; font-weight:bold;">${d.reminder}</div>` : '';
            return `
                <div style="display:flex; flex-direction:column; background:rgba(255,255,255,0.05); padding:10px; margin-bottom:5px; border-radius:4px; font-size:0.65rem; border-left:3px solid var(--accent-cyan);">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="color:white; font-weight:bold;">${d.name}</span>
                        <button onclick="window.removeCharge(${index})" style="color:rgba(255,0,0,0.6); background:none; border:none; cursor:pointer; font-size:1.1rem;">×</button>
                    </div>
                    ${reminderHtml}
                </div>`;
        }).join('');

        const finalJail = isCollab ? Math.floor(rawJail * 0.75) : rawJail;
        
        // --- Análisis Predictivo L.A.W. ---
        const risk = this.predictive.analyzeRisk(this.selectedCharges);
        const riskColors = { "NULO": "#9ca3af", "BAJO": "#4ade80", "MEDIO": "#fbbf24", "ALTO": "#f87171", "CRÍTICO": "#ff0000" };

        t.innerHTML = `
            <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                    <span style="font-size:0.55rem; color:var(--text-dim); letter-spacing:1px; font-weight:bold;">L.A.W. v2.0 NEURAL SENTINEL</span>
                    <span style="font-family:'Orbitron'; font-size:0.7rem; color:${riskColors[risk.riskLevel]}; text-shadow:0 0 10px ${riskColors[risk.riskLevel]}44;">${risk.riskLevel}</span>
                </div>
                
                <div style="background:rgba(255,255,255,0.05); height:4px; border-radius:2px; margin-bottom:12px; overflow:hidden;">
                    <div style="width:${risk.dangerScale}%; height:100%; background:${riskColors[risk.riskLevel]}; transition:width 0.5s ease; box-shadow:0 0 15px ${riskColors[risk.riskLevel]}88;"></div>
                </div>

                ${risk.strikes > 0 ? `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding:6px; background:rgba(255,0,0,0.1); border-radius:4px; border:1px solid rgba(255,0,0,0.2);">
                    <span style="font-size:0.55rem; color:#f87171; font-weight:bold;">ACUMULACIÓN DE STRIKES:</span>
                    <span style="font-family:'Orbitron'; font-size:0.75rem; color:#f87171;">${risk.strikes}</span>
                </div>` : ''}

                <div style="font-size:0.55rem; color:white; line-height:1.4; opacity:0.9; background:rgba(255,255,255,0.03); padding:8px; border-radius:4px; border-left:2px solid ${riskColors[risk.riskLevel]};">
                    <div style="font-weight:bold; margin-bottom:3px; color:${riskColors[risk.riskLevel]}; text-transform:uppercase;">Recomendación Táctica:</div>
                    ${risk.recommendation}
                </div>

                ${risk.factors.length > 0 ? `
                <div style="margin-top:10px;">
                    <div style="font-size:0.5rem; color:var(--text-dim); margin-bottom:5px; text-transform:uppercase;">Factores de Riesgo:</div>
                    ${risk.factors.map(f => `<div style="font-size:0.5rem; color:#fca5a5; display:flex; align-items:center; margin-bottom:2px;">• ${f}</div>`).join('')}
                </div>` : ''}
            </div>
            <div style="font-size:1.2rem; font-family:'Orbitron'; color:var(--accent-primary); text-align:center; text-shadow:none;">
                CÁRCEL: ${finalJail}m | $${rawFine.toLocaleString()}
            </div>
        `;

        // Alertas de Protocolo (Basadas en FAQ)
        const alertsDiv = document.getElementById('protocol-alerts');
        if (alertsDiv) {
            let alertsHtml = "";
            
            // Regla de Licencia de Conducir (Art. 316 FAQ)
            const trafficCrime = this.selectedCharges.some(id => PENALTY_DATA[id].licenseRevoke);
            if (trafficCrime) {
                alertsHtml += `
                    <div style="background:rgba(255,0,0,0.1); border:1px solid #ff4444; color:#ff4444; padding:10px; font-size:0.55rem; margin-bottom:8px; border-radius:4px;">
                        <strong>⚠️ CRITERIO DE LICENCIA (CONDUCIR):</strong><br>Verificar puntos. Si el total >= 15, suspender en MDW, añadir nota y etiqueta "Licencia Suspendida".
                    </div>`;
            }

            // Regla de Licencia de Armas (Art. 120 FAQ)
            const hasGraveB = this.selectedCharges.some(id => PENALTY_DATA[id].cat.includes("Grave B"));
            if (hasGraveB) {
                alertsHtml += `
                    <div style="background:rgba(255,165,0,0.1); border:1px solid #ffa500; color:#ffa500; padding:10px; font-size:0.55rem; margin-bottom:8px; border-radius:4px;">
                        <strong>⚠️ PROTOCOLO DE ARMAS (GRAVE B):</strong><br>Causa probable para retirar licencia de armas. Obligatorio especificar en debrief y perfil MDW.
                    </div>`;
            }

            alertsDiv.innerHTML = alertsHtml;
        }

        if (window.lucide) window.lucide.createIcons();
    }

    // --- OTROS MÓDULOS (CONGELADOS Y FUNCIONALES) ---
    renderValidator() { 
        const vp = document.getElementById('viewport-content'); 
        vp.innerHTML = `
            <h4>VALIDADOR LEGAL</h4>
            <div class="panel" style="padding:20px; border:1px solid var(--accent-cyan); background: rgba(0,0,0,0.2);">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:30px;">
                    <div>
                        <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:15px; border-bottom:1px solid rgba(0,242,255,0.1); padding-bottom:5px;">INDICIOS (RS/CP)</h5>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <div>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="CAD Alert"> ALERTA CAD</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Descrip. Coincidente"> DESC. COINCIDENTE</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Olor a marihuana"> OLOR MARIHUANA</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Bulto de Arma"> BULTO DE ARMA</label>
                            </div>
                            <div>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Huida"> HUIDA / EVASIÓN</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="K9 Alert"> MARCACIÓN K9</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Hot Gun"> HOT GUN (ID)</label>
                                <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Entrada Emergencia"> EMERGENCIA/VIDA</label>
                            </div>
                        </div>
                        <h5 style="font-size:0.6rem; color:var(--accent-amber); margin-top:15px; margin-bottom:15px; border-bottom:1px solid rgba(255,158,11,0.2); padding-bottom:5px;">SITUACIONES ESPECIALES</h5>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Vehículo Remolcado"> REMOLQUE/INVENT.</label>
                            <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Custodia Policial"> BAJO CUSTODIA</label>
                        </div>
                    </div>
                    <div style="text-align:center; padding:25px; background:rgba(0,0,0,0.4); border:2px solid var(--accent-primary); display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:200px; border-radius:8px;">
                        <h2 id="v-status" style="font-size:0.9rem; color:var(--text-dim); margin-bottom:10px; font-family:'Orbitron';">ESPERANDO INDICIOS</h2>
                        <div id="v-action" style="font-size:0.65rem; color:white; line-height:1.4;">Introduce datos para validar el escudo legal.</div>
                        <div id="v-cases" style="width:100%;"></div>
                    </div>
                </div>
            </div>`; 
        const cbs = vp.querySelectorAll('input[type="checkbox"]'); 
        cbs.forEach(cb => { 
            cb.onchange = () => { 
                const sel = Array.from(cbs).filter(c => c.checked).map(c => c.value); 
                const res = this.validator.validate(sel); 
                document.getElementById('v-status').innerText = res.status; 
                document.getElementById('v-status').style.color = res.color; 
                document.getElementById('v-action').innerText = res.actions; 
                document.getElementById('v-cases').innerHTML = res.cases.length > 0 ? `<div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:15px; padding-top:15px;"><span style="font-size:0.55rem; color:var(--text-dim);">🛡️ ESCUDO LEGAL:</span><br/><span style="font-size:0.65rem; color:var(--accent-primary); font-weight:bold;">${res.cases.join(' • ')}</span></div>` : ''; 
            }
        }); 
    }

    renderJurisprudence() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-primary); margin-bottom: 25px;">BIBLIOTECA FEDERAL DE JURISPRUDENCIA</h4>
                <div class="panel" style="padding:20px; border:1px solid var(--border-ui); background:rgba(0,0,0,0.1); margin-bottom:20px;">
                    <input type="text" id="juris-search" placeholder="Busca doctrina, caso o etiqueta (ej: 'frisk', 'cassidy')..." style="width:100%; height:45px; background:#000; border:1px solid var(--accent-primary); color:white; padding:0 15px; font-size:0.75rem; border-radius:4px;">
                </div>
                <div id="juris-list" style="display:grid; grid-gap:15px; max-height:600px; overflow-y:auto; padding-right:10px;"></div>
            </div>`;

        const list = document.getElementById('juris-list');
        const search = document.getElementById('juris-search');

        const updateList = (q = "") => {
            const results = this.consultant.searchCase(q);
            list.innerHTML = results.map(c => `
                <div class="panel" style="padding:20px; border:1px solid var(--border-ui); background:var(--bg-panel);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <b style="color:var(--accent-primary); font-size:0.8rem; font-family:'Orbitron';">${c.case}</b>
                        <span style="font-size:0.55rem; color:var(--text-dim); border:1px solid var(--border-ui); padding:2px 6px; border-radius:3px;">${c.id}</span>
                    </div>
                    <div style="font-size:0.6rem; color:var(--accent-amber); margin-bottom:10px; font-weight:bold;">TEMA: ${c.topic.toUpperCase()}</div>
                    <p style="font-size:0.75rem; color:white; line-height:1.5;">${c.doctrine}</p>
                    <div style="margin-top:12px; display:flex; gap:6px;">
                        ${c.tags.map(t => `<span style="font-size:0.5rem; color:var(--text-dim); background:rgba(255,255,255,0.05); padding:3px 8px; border-radius:10px;">#${t}</span>`).join('')}
                    </div>
                </div>
            `).join('');
        };

        search.oninput = (e) => updateList(e.target.value);
        updateList();
    }
    renderSmith() {
        const vp = document.getElementById('viewport-content');
        const substances = [
            ...LEGAL_DB.smith_act.thresholds.map(d => d.substance.charAt(0).toUpperCase() + d.substance.slice(1)),
            ...LEGAL_DB.smith_act.otc_list
        ].sort();

        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-primary); margin-bottom: 25px;">MOTOR DE ANÁLISIS S.M.I.T.H. (NARCOTICS & OTC)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div class="panel" style="padding:25px; border:1px solid var(--border-ui); background: rgba(0,0,0,0.2);">
                        <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:20px; border-bottom:1px solid rgba(59,130,246,0.1); padding-bottom:10px;">CONFIGURACIÓN DE MUESTRA</h5>
                        
                        <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:8px;">SUBSTANCIA O FÁRMACO</label>
                        <select id="smith-substance" class="smith-input">
                            ${substances.map(s => `<option value="${s}">${s}</option>`).join('')}
                        </select>

                        <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:8px;">CANTIDAD DETECTADA (UNIDADES)</label>
                        <input type="number" id="smith-amount" class="smith-input" value="1" min="0">

                        <div style="margin-bottom: 25px;">
                            <label class="check-item" style="font-size:0.65rem; color:white; cursor:pointer;">
                                <input type="checkbox" id="smith-medical"> ¿DISPONE DE CARNÉ MÉDICO? (CANNABIS)
                            </label>
                        </div>

                        <button id="smith-run" class="smith-btn">ANALIZAR MUESTRA</button>
                    </div>

                    <div id="smith-result-area" style="display:flex; flex-direction:column; justify-content:center; align-items:center;">
                        <div class="result-card" style="width:100%; border:1px dashed var(--border-ui); opacity:0.5;">
                            <i data-lucide="microscope" style="width:40px; height:40px; color:var(--text-dim); margin-bottom:15px;"></i>
                            <p style="font-size:0.7rem; color:var(--text-dim);">Esperando muestra para análisis...</p>
                        </div>
                    </div>
                </div>
            </div>`;
        
        if (window.lucide) window.lucide.createIcons();

        document.getElementById('smith-run').onclick = () => {
            const name = document.getElementById('smith-substance').value;
            const amount = parseInt(document.getElementById('smith-amount').value) || 0;
            const hasMedical = document.getElementById('smith-medical').checked;
            
            const res = this.smith.analyzeSubstance(name, amount, hasMedical);
            const resultArea = document.getElementById('smith-result-area');

            resultArea.innerHTML = `
                <div class="result-card" style="width:100%; border:2px solid ${res.color}; background: rgba(0,0,0,0.5);">
                    <h2 style="color:${res.color}; font-size:1rem; font-family:'Orbitron'; margin-bottom:15px;">${res.degree}</h2>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                        <div style="padding:10px; background:rgba(255,255,255,0.02); text-align:left;">
                            <span style="font-size:0.5rem; color:var(--text-dim); display:block;">ESTADO LEGAL</span>
                            <span style="font-size:0.75rem; color:${res.isLegal ? '#4ade80' : '#ff4a4a'}; font-weight:bold;">${res.isLegal ? 'ADMISIBLE' : 'ILEGAL'}</span>
                        </div>
                        <div style="padding:10px; background:rgba(255,255,255,0.02); text-align:left;">
                            <span style="font-size:0.5rem; color:var(--text-dim); display:block;">MULTA SUGERIDA</span>
                            <span style="font-size:0.75rem; color:white; font-weight:bold;">${res.fine}</span>
                        </div>
                    </div>
                    <div style="font-size:0.6rem; color:var(--text-dim); padding-top:10px; border-top:1px solid rgba(255,255,255,0.05);">
                        ${res.isOTC ? 'Sustancia de venta libre bajo control farmacéutico.' : 'Sustancia regulada bajo la ley S.M.I.T.H.'}
                    </div>
                </div>`;
        };
    }
    renderIntel() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: #ef4444; margin-bottom: 25px;">CENTRO DE INTELIGENCIA TÁCTICA (I.C.S.)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <div class="panel" style="padding:25px; border:1px solid var(--accent-red); background: rgba(255,0,0,0.05); margin-bottom:25px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <h5 style="color:var(--accent-red); font-size:0.7rem;">⚠️ ${INTEL_DB.alerts[0].title}</h5>
                                <span style="font-size:0.5rem; background:var(--accent-red); color:black; padding:2px 6px; font-weight:bold;">${INTEL_DB.alerts[0].type}</span>
                            </div>
                            <p style="font-size:0.7rem; color:white; margin-bottom:15px; font-weight:bold;">UBICACIÓN: ${INTEL_DB.alerts[0].location}</p>
                            <p style="font-size:0.65rem; color:var(--text-dim); line-height:1.4;">${INTEL_DB.alerts[0].protocol}</p>
                        </div>

                        <div class="panel" style="padding:20px; border:1px solid var(--accent-cyan);">
                            <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:15px;">PROTOCOLO 10.71 (TIROTEO MASIVO)</h5>
                            <ul style="font-size:0.65rem; color:white; line-height:1.6; list-style:none; padding:0;">
                                ${INTEL_DB.protocols.active_shooter.steps.map(s => `<li style="margin-bottom:8px; display:flex; gap:10px;"><span style="color:var(--accent-cyan);">▶</span> ${s}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <div class="panel" style="padding:20px; border:1px solid #4ade80; background:rgba(74,222,128,0.05);">
                            <h5 style="font-size:0.6rem; color:#4ade80; margin-bottom:15px;">FAR ACT (ESPECIES PROTEGIDAS)</h5>
                            <div style="font-size:0.65rem; color:var(--text-dim); margin-bottom:15px; border-bottom:1px solid rgba(74,222,128,0.1); padding-bottom:10px;">
                                ${INTEL_DB.protocols.environmental.strikes}
                            </div>
                            <div style="height:250px; overflow-y:auto; padding-right:10px;">
                                <p style="font-size:0.55rem; color:#4ade80; margin-bottom:10px; font-weight:bold;">LISTADO DE PROTECCIÓN:</p>
                                ${INTEL_DB.protocols.environmental.endangered.map(e => `<div style="font-size:0.6rem; color:white; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">${e}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    renderForce() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-amber); margin-bottom: 25px;">PROTOCOLO DE USO DE LA FUERZA (FACTORES ARMSTRONG)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <div class="panel" style="padding:25px; border:1px solid var(--border-ui); background: #152238; margin-bottom:25px; box-shadow: inset 0 0 20px rgba(0,0,0,0.5);">
                            <h5 style="font-size:0.6rem; color:var(--accent-amber); margin-bottom:20px; border-bottom:1px solid rgba(245,158,11,0.2); padding-bottom:10px;">ANÁLISIS DE LA SITUACIÓN</h5>
                            
                            <div style="margin-bottom:25px;">
                                <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:10px;">NIVEL DE RESISTENCIA DEL SOSPECHOSO</label>
                                <select id="force-resistance" class="smith-input" style="border: 1px solid var(--accent-amber); background: #000; color: white;">
                                    ${FORCE_DB.resistance_levels.map(l => `<option value="${l.level}">${l.level}</option>`).join('')}
                                </select>
                            </div>

                            <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:10px;">FACTORES ARMSTRONG PRESENTES</label>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                                ${FORCE_DB.armstrong_factors.map(f => `
                                    <label class="check-item" style="font-size:0.65rem; color:white; padding:12px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.05); border-radius:4px; cursor:pointer; display:flex; align-items:center; gap:10px;">
                                        <input type="checkbox" value="${f.id}" class="armstrong-check"> 
                                        <span><b style="color:var(--accent-amber);">${f.id}</b>: ${f.name}</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                    </div>

                    <div id="force-result-area" style="display:flex; flex-direction:column; gap:20px; justify-content:center; align-items:center;">
                        <div class="result-card" style="width:100%; border:1px dashed var(--border-ui); opacity:0.5; background:rgba(0,0,0,0.2); text-align:center; padding:40px;">
                            <i data-lucide="shield-alert" style="width:40px; height:40px; color:var(--text-dim); margin-bottom:15px;"></i>
                            <p style="font-size:0.7rem; color:var(--text-dim);">Esperando entrada de datos tácticos...</p>
                        </div>
                    </div>
                </div>

                <!-- MONITOR DE DES-ESCALADA (CAJA NEGRA) -->
                <div class="panel" style="margin-top:30px; padding:25px; border-top:3px solid var(--accent-primary); background:rgba(0,0,0,0.4);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                        <h5 style="font-size:0.7rem; color:var(--accent-primary); font-family:'Orbitron';">MONITOR DE DES-ESCALADA (REGISTRO TÁCTICO)</h5>
                        <button onclick="window.clearForceLog()" style="background:none; border:1px solid rgba(255,0,0,0.3); color:#ef4444; font-size:0.5rem; padding:4px 10px; border-radius:4px; cursor:pointer;">[ REINICIAR BITÁCORA ]</button>
                    </div>
                    
                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px;">
                        <div>
                            <div style="font-size:0.55rem; color:var(--text-dim); margin-bottom:10px;">REGISTRAR HITO DE ACTUACIÓN:</div>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
                                <button onclick="window.addForceLog('Sospechoso cesa resistencia', 'down')" class="log-btn" style="background:#065f46; border:1px solid #10b981;">⬇️ CESE RESISTENCIA</button>
                                <button onclick="window.addForceLog('Arma enfundada/tirada', 'down')" class="log-btn" style="background:#065f46; border:1px solid #10b981;">⬇️ ARMA ASEGURADA</button>
                                <button onclick="window.addForceLog('Amenaza inminente / Arma', 'up')" class="log-btn" style="background:#7f1d1d; border:1px solid #ef4444;">⬆️ AMENAZA ARMA</button>
                                <button onclick="window.addForceLog('Intento de atropello/huida', 'up')" class="log-btn" style="background:#7f1d1d; border:1px solid #ef4444;">⬆️ INTENTO HUIDA</button>
                            </div>
                        </div>
                        <div style="background:#0a0a0a; border-radius:4px; padding:15px; border:1px solid rgba(255,255,255,0.05);">
                            <div id="force-timeline" style="max-height:150px; overflow-y:auto; font-family:'JetBrains Mono'; font-size:0.6rem; color:white;">
                                <div style="color:var(--text-dim); text-align:center; padding-top:20px;">Bitácora vacía. Registra eventos durante la intervención.</div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    .log-btn { padding:10px; color:white; font-size:0.55rem; font-weight:bold; border-radius:4px; cursor:pointer; text-transform:uppercase; transition:filter 0.2s; }
                    .log-btn:hover { filter:brightness(1.3); }
                </style>
            </div>`;
        
        if (window.lucide) window.lucide.createIcons();

        const updateForce = () => {
            const resLevel = document.getElementById('force-resistance').value;
            const resData = FORCE_DB.resistance_levels.find(l => l.level === resLevel);
            const checks = Array.from(document.querySelectorAll('.armstrong-check:checked')).length;
            const resultArea = document.getElementById('force-result-area');

            let alertMsg = "Respuesta Proporcional Estándar";
            let alertColor = "var(--accent-amber)";
            if (checks >= 3) { alertMsg = "SITUACIÓN DE RIESGO ELEVADO / POSIBLE ESCALADA"; alertColor = "#f59e0b"; }
            if (resLevel.includes('Activa')) { alertMsg = "AMENAZA INMINENTE / PROTOCOLO LETAL"; alertColor = "#ef4444"; }

            resultArea.innerHTML = `
                <div class="result-card" style="width:100%; border:2px solid ${alertColor}; background: #152238; padding:30px; border-radius:8px; box-shadow: 0 10px 40px rgba(0,0,0,0.6); animation: fadeIn 0.3s ease;">
                    <div style="font-size:0.5rem; color:var(--text-dim); font-weight:bold; letter-spacing:1px; margin-bottom:10px;">FUERZA MÁXIMA AUTORIZADA:</div>
                    <h2 style="color:white; font-size:1.3rem; font-family:'Orbitron'; margin-bottom:20px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px;">${resData.force_allowed || resData.status}</h2>
                    
                    <div style="padding:15px; background:rgba(0,0,0,0.3); border-radius:4px; margin-bottom:15px; border-left:4px solid ${alertColor};">
                        <span style="font-size:0.55rem; color:var(--text-dim); display:block; font-weight:bold; margin-bottom:5px;">INDICACIONES TÁCTICAS:</span>
                        <span style="font-size:0.7rem; color:white; line-height:1.4;">${resData.actions || alertMsg}</span>
                    </div>

                    <p style="font-size:0.6rem; color:var(--text-dim); line-height:1.5; opacity:0.8;">
                        <b>CRITERIO PROFESIONAL:</b> El oficial debe evaluar si la resistencia cesa. En ese momento, la fuerza aplicada debe reducirse inmediatamente según el protocolo de des-escalada.
                    </p>
                </div>`;
        };

        document.getElementById('force-resistance').onchange = updateForce;
        document.querySelectorAll('.armstrong-check').forEach(c => c.onchange = updateForce);

        window.addForceLog = (msg, type) => {
            const tl = document.getElementById('force-timeline');
            if (tl.innerText.includes('Bitácora vacía')) tl.innerHTML = '';
            
            const time = new Date().toLocaleTimeString();
            const color = type === 'up' ? '#ef4444' : '#10b981';
            const logEntry = document.createElement('div');
            logEntry.style.marginBottom = '8px';
            logEntry.style.borderLeft = `3px solid ${color}`;
            logEntry.style.paddingLeft = '10px';
            logEntry.innerHTML = `
                <span style="color:var(--text-dim); font-size:0.5rem;">[${time}]</span>
                <span style="color:${color}; font-weight:bold; margin-right:5px;">${type === 'up' ? '▲' : '▼'}</span>
                <span>${msg}</span>
            `;
            tl.prepend(logEntry);
            this.addLog(`Evento de ${type === 'up' ? 'Escalada' : 'Des-escalada'} Registrado: ${msg}`);
        };

        window.clearForceLog = () => {
            document.getElementById('force-timeline').innerHTML = '<div style="color:var(--text-dim); text-align:center; padding-top:20px;">Bitácora vacía. Registra eventos durante la intervención.</div>';
        };
    }

    renderRadio() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-amber); margin-bottom: 25px;">CENTRO DE COMUNICACIONES TÁCTICAS</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <!-- COLUMNA IZQUIERDA: CÓDIGOS 10 -->
                    <div>
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui); background:rgba(0,0,0,0.2); margin-bottom:20px;">
                            <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:12px;">BUSCADOR DE CÓDIGOS 10</h5>
                            <input type="text" id="radio-search" placeholder="Escribe código o descripción (ej: '10.33')..." style="width:100%; height:42px; background:#000; border:1px solid var(--accent-primary); color:white; padding:0 15px; border-radius:4px;">
                            
                            <div id="radio-codes-list" style="max-height:500px; overflow-y:auto; margin-top:15px; padding-right:5px;">
                                <!-- DINAMICO -->
                            </div>
                        </div>
                    </div>

                    <!-- COLUMNA DERECHA: ALFABETOS Y CALLSIGNS -->
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui);">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                                <h5 style="font-size:0.6rem; color:var(--accent-amber);">ALFABETO FONÉTICO</h5>
                                <select id="alphabet-type" style="background:#000; color:var(--accent-amber); border:1px solid var(--accent-amber); font-size:0.6rem; padding:2px 5px; border-radius:4px;">
                                    <option value="otan">OTAN / INTERNACIONAL</option>
                                    <option value="police">POLICIAL / ADAM-BOY</option>
                                </select>
                            </div>
                            <div id="alphabet-grid" style="display:grid; grid-template-columns: repeat(3, 1fr); gap:10px; font-family:'JetBrains Mono'; font-size:0.55rem;">
                                <!-- DINAMICO -->
                            </div>
                        </div>

                        <div class="panel" style="padding:20px; border-left:4px solid var(--accent-primary); background:rgba(59, 130, 246, 0.05);">
                            <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:10px;">FORMATO DE CALLSIGN</h5>
                            <div style="font-size:0.9rem; font-family:'Orbitron'; color:white; margin-bottom:5px;">${RADIO_DB.callsign_format.pattern}</div>
                            <p style="font-size:0.6rem; color:var(--text-dim); line-height:1.4;">${RADIO_DB.callsign_format.description}</p>
                            
                            <div style="margin-top:15px; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                                <div>
                                    <span style="font-size:0.55rem; color:var(--accent-primary); display:block; border-bottom:1px solid rgba(59, 130, 246, 0.2); margin-bottom:5px;">RANGO (#)</span>
                                    ${Object.entries(RADIO_DB.ranks).slice(0,5).map(([n, r]) => `<div style="font-size:0.55rem; color:white;">${n}: ${r}</div>`).join('')}
                                </div>
                                <div>
                                    <span style="font-size:0.55rem; color:var(--accent-primary); display:block; border-bottom:1px solid rgba(59, 130, 246, 0.2); margin-bottom:5px;">DPTO (X)</span>
                                    ${Object.entries(RADIO_DB.departments).slice(0,5).map(([d, l]) => `<div style="font-size:0.55rem; color:white;">${l}: ${d}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        const codeList = document.getElementById('radio-codes-list');
        const searchInput = document.getElementById('radio-search');
        const alphabetGrid = document.getElementById('alphabet-grid');
        const alphabetType = document.getElementById('alphabet-type');

        const allCodes = [...RADIO_DB.codes_10_common, ...RADIO_DB.codes_10_other];

        const updateCodes = (q = "") => {
            const query = q.toLowerCase();
            const filtered = allCodes.filter(c => c.code.toLowerCase().includes(query) || c.desc.toLowerCase().includes(query));
            
            codeList.innerHTML = filtered.map(c => `
                <div style="padding:10px; background:${c.critical ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255,255,255,0.02)'}; border-left:3px solid ${c.critical ? '#ef4444' : (c.help ? '#f59e0b' : 'var(--accent-primary)')}; border-radius:4px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-family:'JetBrains Mono'; font-weight:bold; font-size:0.7rem; color:${c.critical ? '#ef4444' : 'var(--text-main)'};">${c.code}</span>
                    <span style="font-size:0.65rem; color:var(--text-dim); text-align:right;">${c.desc.toUpperCase()}</span>
                </div>
            `).join('');
        };

        const updateAlphabet = () => {
            const data = RADIO_DB.alphabets[alphabetType.value];
            alphabetGrid.innerHTML = Object.entries(data).map(([letter, word]) => `
                <div style="display:flex; gap:8px;">
                    <b style="color:var(--accent-amber);">${letter}</b>
                    <span style="color:white; opacity:0.8;">${word}</span>
                </div>
            `).join('');
        };

        searchInput.oninput = (e) => updateCodes(e.target.value);
        alphabetType.onchange = updateAlphabet;

        updateCodes();
        updateAlphabet();
    }

    renderComunicados() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-primary); margin-bottom: 25px;">MANUAL DE COMUNICADOS Y DESPACHO</h4>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <!-- DERECHOS CASSIDY -->
                    <div class="panel" style="padding:25px; border-left:4px solid #ef4444; background:rgba(239, 68, 68, 0.05);">
                        <h5 style="color:#ef4444; font-size:0.7rem; margin-bottom:15px; font-family:'Orbitron';">LECTURA DE DERECHOS (CASSIDY)</h5>
                        <p style="font-size:0.75rem; color:white; line-height:1.6; font-style:italic;">"${RADIO_DB.protocols['Cassidy Rights'].text}"</p>
                        <div style="margin-top:20px; font-size:0.6rem; color:var(--text-dim);">
                            <b>NOTA:</b> Leer íntegramente al detener o antes de cualquier interrogatorio autoincriminatorio.
                        </div>
                    </div>

                    <!-- PROTOCOLOS DE RADIO -->
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui); background:#152238;">
                            <h5 style="font-size:0.6rem; color:var(--accent-amber); margin-bottom:15px; border-bottom:1px solid rgba(245,158,11,0.2); padding-bottom:10px;">PROCOLO 10-38 (PARADA DE TRÁFICO)</h5>
                            <ul style="font-size:0.65rem; color:white; line-height:1.6; padding-left:15px;">
                                ${RADIO_DB.protocols['10-38 Traffic Stop'].steps.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>

                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui); background:#152238;">
                            <h5 style="font-size:0.6rem; color:var(--accent-primary); margin-bottom:15px; border-bottom:1px solid rgba(59,130,246,0.2); padding-bottom:10px;">PROTOCOLO 10-52 (ASISTENCIA MÉDICA)</h5>
                            <ul style="font-size:0.65rem; color:white; line-height:1.6; padding-left:15px;">
                                ${RADIO_DB.protocols['10-52 Medical Assistance'].steps.map(s => `<li>${s}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- FRECUENCIAS -->
                <div class="panel" style="padding:20px; margin-top:25px; border:1px solid var(--border-ui);">
                    <h5 style="font-size:0.6rem; color:var(--text-dim); margin-bottom:15px; letter-spacing:1px;">FRECUENCIAS DE OPERACIÓN DEPARTAMENTAL</h5>
                    <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:15px;">
                        ${RADIO_DB.frequencies.map(f => `
                            <div style="text-align:center; padding:10px; background:rgba(255,255,255,0.02); border-radius:4px;">
                                <div style="font-size:0.75rem; font-family:'Orbitron'; color:var(--accent-primary);">${f.ch}</div>
                                <div style="font-size:0.5rem; color:var(--text-dim); margin-top:4px;">${f.name}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>`;
    }

    renderDashboard() { document.getElementById('viewport-content').innerHTML = `<h2>STATUS TERMINAL v11.6.0-O.L.E.T.</h2><div class="panel" style="padding:40px; text-align:center; background:#152238; border:1px solid var(--accent-primary);"><i data-lucide="shield-check" style="width:60px; height:60px; color:var(--accent-primary); margin-bottom:20px;"></i><h3>ONX CORE SYSTEMS</h3><p style="font-size:0.8rem; color:var(--text-dim); margin-top:10px;">Terminal de cumplimiento de la ley Federal Cobalt sincronizada.</p></div>`; if(window.lucide) window.lucide.createIcons(); }
    addLog(msg) { const log = document.getElementById('telemetry-logs'); if (log) log.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + log.innerHTML; }
}
new NexusMain();
