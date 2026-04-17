
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
        this.addLog("O.L.E.T. Systems ONLINE. Version v11.3.0 Tactical Legal Ready.");
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
                <h4 style="color: var(--accent-cyan); font-size: 0.8rem; margin-bottom: 25px;">ONX LAW ENFORCEMENT TERMINAL (O.L.E.T.)</h4>
                
                <!-- PROTOCOL REMINDER -->
                <div style="background:rgba(0,242,255,0.05); border:1px solid var(--accent-cyan); padding:10px 20px; border-radius:4px; margin-bottom:20px; display:flex; align-items:center; gap:15px; animation:fadeIn 0.5s ease;">
                    <i data-lucide="info" style="width:16px; height:16px; color:var(--accent-cyan);"></i>
                    <span style="font-size:0.65rem; color:var(--text-dim); letter-spacing:0.5px;">PROCOLO O.L.E.T.: REVISAR PERFIL DEL SUJETO ANTES DE PROCESAR (ÓRDENES DE ARRESTO / LICENCIAS).</span>
                </div>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div>
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui); margin-bottom:20px;">
                            <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:12px;">DETECCIÓN AUTOMÁTICA DE DELITOS</h5>
                            <textarea id="narrative-input" placeholder="Relata el incidente para detectar delitos automáticamente..." style="width:100%; height:100px; background:rgba(0,0,0,0.5); border:1px solid var(--accent-cyan); color:white; padding:10px; font-family:'JetBrains Mono'; font-size:0.65rem;"></textarea>
                            <div id="narrative-suggestions" style="margin-top:12px; display:flex; flex-wrap:wrap; gap:8px;"></div>
                        </div>
                        <div class="panel" style="padding:20px; border:1px solid var(--border-ui);">
                            <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:12px;">BÚSQUEDA MANUAL</h5>
                            <input type="text" id="sch" placeholder="Busca delito..." style="width:100%; height:42px; background:#000; border:1px solid var(--accent-cyan); color:white; padding:0 15px;">
                            <div id="lst" style="max-height:180px; overflow-y:auto; margin-top:10px;"></div>
                        </div>
                    </div>
                    <div class="panel" style="padding:25px; border:1px solid var(--accent-cyan); background:rgba(0,0,0,0.3);">
                        <h5 style="font-size:0.6rem; color:var(--accent-cyan);">EXPEDIENTE TÁCTICO</h5>
                        <div id="exp" style="min-height:220px; padding:15px; border:1px dashed rgba(255,255,255,0.05); margin-bottom:20px;"></div>
                        <div style="margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
                            <label style="font-size:0.65rem; color:white;"><input type="checkbox" id="collab"> COLABORACIÓN (-25%)</label>
                            <button onclick="window.clearExp()" style="background:none; border:none; color:red; font-size:0.55rem; cursor:pointer;">[ BORRAR TODO ]</button>
                        </div>
                        <div id="total" style="text-align:center; padding:20px; background:#000; border:2px solid var(--accent-cyan); color:var(--accent-cyan); font-weight:bold; font-size:1.4rem;">CÁRCEL: 0m | MULTA: $0</div>
                        
                        <!-- DYNAMIC PROTOCOL ALERTS -->
                        <div id="protocol-alerts" style="margin-top:10px;"></div>
                        <div style="margin-top:20px;">
                            <button id="btn-save-pc" class="smith-btn" style="background:#4ade80; color:black; width:100%;">💾 GUARDAR EXPEDIENTE EN PC</button>
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
                <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.background='rgba(0,242,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <div><div style="font-size:0.65rem; color:white;">${d.name}</div><div style="font-size:0.5rem; color:var(--text-dim);">$${d.fine.toLocaleString()} | ${d.jail}m</div></div>
                    <button onclick="window.addCharge('${id}')" style="background:var(--accent-cyan); border:none; padding:5px 12px; cursor:pointer; border-radius:4px; font-weight:bold; color:black;">+</button>
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
        const riskColors = { "BAJO": "#4ade80", "MEDIO": "#fbbf24", "ALTO": "#f87171", "EXTREMO": "#ff0000" };

        t.innerHTML = `
            <div style="margin-bottom:15px; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:15px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <span style="font-size:0.6rem; color:var(--text-dim);">L.A.W. RISK ASSESSMENT:</span>
                    <span style="font-family:'Orbitron'; font-size:0.75rem; color:${riskColors[risk.riskLevel]};">${risk.riskLevel} (${risk.dangerScale}%)</span>
                </div>
                <div style="font-size:0.55rem; color:white; opacity:0.8; text-align:left; background:rgba(0,0,0,0.2); padding:8px; border-radius:4px; border-left:2px solid ${riskColors[risk.riskLevel]};">
                    ${risk.recommendation}
                </div>
            </div>
            <div style="font-size:1.2rem; font-family:'Orbitron'; color:var(--accent-cyan); text-align:center;">
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
                        <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-top:15px; margin-bottom:15px; border-bottom:1px solid rgba(0,242,255,0.1); padding-bottom:5px;">SITUACIONES ESPECIALES</h5>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Vehículo Remolcado"> REMOLQUE/INVENT.</label>
                            <label class="check-item" style="display:block; margin-bottom:10px; font-size:0.65rem;"><input type="checkbox" value="Custodia Policial"> BAJO CUSTODIA</label>
                        </div>
                    </div>
                    <div style="text-align:center; padding:25px; background:rgba(0,0,0,0.4); border:2px solid var(--accent-cyan); display:flex; flex-direction:column; justify-content:center; align-items:center; min-height:200px;">
                        <h2 id="v-status" style="font-size:0.9rem; color:var(--text-dim); margin-bottom:10px;">ESPERANDO INDICIOS</h2>
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
                document.getElementById('v-cases').innerHTML = res.cases.length > 0 ? `<div style="border-top:1px solid rgba(255,255,255,0.1); margin-top:15px; padding-top:15px;"><span style="font-size:0.55rem; color:var(--text-dim);">🛡️ ESCUDO LEGAL:</span><br/><span style="font-size:0.65rem; color:var(--accent-cyan); font-weight:bold;">${res.cases.join(' • ')}</span></div>` : ''; 
            }
        }); 
    }

    renderJurisprudence() {
        const vp = document.getElementById('viewport-content');
        vp.innerHTML = `
            <div style="animation: fadeIn 0.4s ease;">
                <h4 style="color: var(--accent-cyan); margin-bottom: 25px;">BIBLIOTECA FEDERAL DE JURISPRUDENCIA</h4>
                <div class="panel" style="padding:20px; border:1px solid var(--accent-cyan); background:rgba(0,242,255,0.03); margin-bottom:20px;">
                    <input type="text" id="juris-search" placeholder="Busca doctrina, caso o etiqueta (ej: 'frisk', 'cassidy')..." style="width:100%; height:45px; background:#000; border:1px solid var(--accent-cyan); color:white; padding:0 15px; font-size:0.75rem;">
                </div>
                <div id="juris-list" style="display:grid; grid-gap:15px; max-height:600px; overflow-y:auto; padding-right:10px;"></div>
            </div>`;

        const list = document.getElementById('juris-list');
        const search = document.getElementById('juris-search');

        const updateList = (q = "") => {
            const results = this.consultant.searchCase(q);
            list.innerHTML = results.map(c => `
                <div class="panel" style="padding:20px; border:1px solid rgba(255,255,255,0.05); background:rgba(255,255,255,0.01);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:12px;">
                        <b style="color:var(--accent-cyan); font-size:0.8rem; font-family:'Orbitron';">${c.case}</b>
                        <span style="font-size:0.55rem; color:var(--text-dim); border:1px solid rgba(255,255,255,0.1); padding:2px 6px; border-radius:3px;">${c.id}</span>
                    </div>
                    <div style="font-size:0.6rem; color:var(--accent-gold); margin-bottom:10px; font-weight:bold;">TEMA: ${c.topic.toUpperCase()}</div>
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
                <h4 style="color: var(--accent-cyan); margin-bottom: 25px;">MOTOR DE ANÁLISIS S.M.I.T.H. (NARCOTICS & OTC)</h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div class="panel" style="padding:25px; border:1px solid var(--accent-cyan); background: rgba(0,0,0,0.2);">
                        <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:20px; border-bottom:1px solid rgba(0,242,255,0.1); padding-bottom:10px;">CONFIGURACIÓN DE MUESTRA</h5>
                        
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
                <h4 style="color: var(--accent-red); margin-bottom: 25px;">CENTRO DE INTELIGENCIA TÁCTICA (I.C.S.)</h4>
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
                <h4 style="color: var(--accent-gold); margin-bottom: 25px;">PROTOCOLO DE USO DE LA FUERZA (FACTORES ARMSTRONG)</h4>
                <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px;">
                    <div>
                        <div class="panel" style="padding:25px; border:1px solid var(--accent-gold); background: rgba(0,0,0,0.2); margin-bottom:25px;">
                            <h5 style="font-size:0.6rem; color:var(--accent-gold); margin-bottom:20px; border-bottom:1px solid rgba(255,204,0,0.1); padding-bottom:10px;">ANÁLISIS DE LA SITUACIÓN</h5>
                            
                            <div style="margin-bottom:20px;">
                                <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:10px;">NIVEL DE RESISTENCIA DEL SOSPECHOSO</label>
                                <select id="force-resistance" class="smith-input" style="border-color: var(--accent-gold); margin-bottom:0;">
                                    ${FORCE_DB.resistance_levels.map(l => `<option value="${l.level}">${l.level}</option>`).join('')}
                                </select>
                            </div>

                            <label style="display:block; font-size:0.6rem; color:var(--text-dim); margin-bottom:10px;">FACTORES ARMSTRONG PRESENTES</label>
                            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:20px;">
                                ${FORCE_DB.armstrong_factors.map(f => `
                                    <label class="check-item" style="font-size:0.65rem; color:white; padding:10px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:4px; cursor:pointer;">
                                        <input type="checkbox" value="${f.id}" class="armstrong-check"> <b>${f.id}</b>: ${f.name}
                                    </label>
                                `).join('')}
                            </div>

                            <button id="force-calc" class="smith-btn" style="background:var(--accent-gold); color:black;">EVALUAR RESPUESTA TÁCTICA</button>
                        </div>

                        <div class="panel" style="padding:20px; background:rgba(0,0,0,0.3);">
                            <h5 style="font-size:0.6rem; color:var(--accent-gold); margin-bottom:15px;">POLÍTICAS DE COMPROMISO</h5>
                            <ul style="font-size:0.65rem; color:var(--text-dim); line-height:1.6; padding-left:15px;">
                                ${FORCE_DB.policies.map(p => `<li>${p}</li>`).join('')}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <div id="force-result-area" style="margin-bottom:25px;">
                            <div class="result-card" style="border:1px dashed var(--accent-gold); opacity:0.5;">
                                <i data-lucide="shield-alert" style="width:40px; height:40px; color:var(--accent-gold); margin-bottom:15px;"></i>
                                <p style="font-size:0.7rem; color:var(--text-dim);">Selecciona el nivel de resistencia para determinar la escala de fuerza.</p>
                            </div>
                        </div>

                        <div class="panel" style="padding:20px; border-left:4px solid var(--accent-cyan);">
                            <h5 style="font-size:0.6rem; color:var(--accent-cyan); margin-bottom:15px;">PRIORIDAD DE VIDA</h5>
                            <div style="display:flex; flex-direction:column; gap:8px;">
                                ${FORCE_DB.priorities.map((p, i) => `
                                    <div style="display:flex; align-items:center; gap:10px; font-size:0.7rem;">
                                        <span style="color:var(--accent-cyan); font-weight:bold; font-family:'Orbitron';">${i + 1}.</span>
                                        <span style="color:white;">${p}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        if (window.lucide) window.lucide.createIcons();

        document.getElementById('force-calc').onclick = () => {
            const resLevel = document.getElementById('force-resistance').value;
            const resData = FORCE_DB.resistance_levels.find(l => l.level === resLevel);
            const checks = Array.from(document.querySelectorAll('.armstrong-check:checked')).length;
            const resultArea = document.getElementById('force-result-area');

            let alertMsg = "Respuesta Proporcional Estándar";
            if (checks >= 3) alertMsg = "SITUACIÓN DE ALTO RIESGO / EVALUAR ESCALADA";
            if (resLevel === 'Agresión Activa') alertMsg = "AMENAZA INMINENTE / PROTOCOLO LETAL ACTIVO";

            resultArea.innerHTML = `
                <div class="result-card" style="border:2px solid var(--accent-gold); background:rgba(0,204,255,0.02); text-align:left;">
                    <div style="font-size:0.5rem; color:var(--accent-gold); font-weight:bold; letter-spacing:1px; margin-bottom:5px;">FUERZA MÁXIMA AUTORIZADA</div>
                    <h2 style="color:white; font-size:1.1rem; font-family:'Orbitron'; margin-bottom:15px; border-bottom:1px solid rgba(255,204,0,0.2); padding-bottom:10px;">${resData.force_allowed}</h2>
                    
                    <div style="padding:12px; background:rgba(255,204,0,0.1); border-radius:4px; margin-bottom:15px;">
                        <span style="font-size:0.55rem; color:var(--accent-gold); display:block; font-weight:bold;">ALERTA TÁCTICA</span>
                        <span style="font-size:0.7rem; color:white;">${alertMsg}</span>
                    </div>

                    <p style="font-size:0.65rem; color:var(--text-dim); line-height:1.4;">
                        <b>JUSTIFICACIÓN:</b> Según el Escalamiento de Fuerza, ante una <i>${resLevel}</i>, se permiten medios de <i>${resData.force_allowed}</i> garantizando que el uso de la misma sea razonable y cese en cuanto el control sea efectivo.
                    </p>
                </div>`;
        };
    }

    renderDashboard() { document.getElementById('viewport-content').innerHTML = `<h2>STATUS TERMINAL v11.3.0-O.L.E.T.</h2><div class="panel" style="padding:40px; text-align:center;"><i data-lucide="shield-check" style="width:60px; height:60px; color:var(--accent-cyan); margin-bottom:20px;"></i><h3>ONX CORE SYSTEMS</h3><p style="font-size:0.8rem; color:var(--text-dim); margin-top:10px;">Terminal de cumplimiento de la ley ONX estable y sincronizada.</p></div>`; if(window.lucide) window.lucide.createIcons(); }
    addLog(msg) { const log = document.getElementById('telemetry-logs'); if (log) log.innerHTML = `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>` + log.innerHTML; }
}
new NexusMain();
