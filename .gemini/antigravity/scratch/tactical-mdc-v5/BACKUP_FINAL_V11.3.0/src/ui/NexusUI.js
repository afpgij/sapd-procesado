
/**
 * NEXUS UI v9.1 - MODULAR HIGH-FIDELITY (RECOVERY)
 */

export class NexusUI {
    constructor(container) {
        this.container = container;
    }

    renderLayout() {
        this.container.innerHTML = `
            <div class="mdc-container">
                <header class="mdc-header">
                    <div class="header-left">
                        <div class="logo-area">
                            <i data-lucide="shield-check" class="logo-icon"></i>
                            <div class="logo-text">
                                <span class="brand" style="font-family:'Orbitron';">O.L.E.T.</span>
                                <span class="model" style="font-size:0.6rem; opacity:0.6; color:var(--accent-cyan);">ONX LAW ENFORCEMENT</span>
                            </div>
                        </div>
                    </div>
                    <div class="header-center">
                        <div class="status-badge">
                            <span class="pulse"></span>
                            <span id="current-view-title">PROCESADO</span>
                        </div>
                    </div>
                </header>

                <main class="mdc-main">
                    <nav class="side-nav">
                        <a href="#" class="nav-item active" data-view="procesado"><i data-lucide="calculator"></i><span>Detección de Delitos</span></a>
                        <a href="#" class="nav-item" data-view="validator"><i data-lucide="scale"></i><span>Validador Legal</span></a>
                        <a href="#" class="nav-item" data-view="smith"><i data-lucide="test-tube-2"></i><span>SMITH / OTC</span></a>
                        <a href="#" class="nav-item" data-view="jurisprudence"><i data-lucide="book-open"></i><span>Jurisprudencia</span></a>
                        <a href="#" class="nav-item" data-view="intel"><i data-lucide="alert-triangle"></i><span>Inteligencia</span></a>
                        <a href="#" class="nav-item" data-view="force"><i data-lucide="frown"></i><span>Uso de la Fuerza</span></a>
                        <a href="#" class="nav-item" data-view="dashboard"><i data-lucide="terminal"></i><span>Status Terminal</span></a>
                    </nav>

                    <section class="viewport">
                        <div id="viewport-content" class="viewport-content"></div>
                    </section>
                </main>

                <footer class="mdc-footer" style="display:flex; justify-content:space-between; align-items:center; padding: 0 40px; background: rgba(0,0,0,0.4); border-top: 1px solid var(--border-ui); height: 50px;">
                    <div class="telemetry" style="display:flex; align-items:center; gap:20px;">
                        <div id="telemetry-logs" class="logs" style="font-size: 0.6rem; opacity: 0.7;">
                            <div>[SYSTEM] O.L.E.T. DESKTOP v11.2 ELITE ONLINE...</div>
                        </div>
                        <div class="opacity-control" style="display:flex; align-items:center; gap:10px; border-left: 1px solid rgba(255,255,255,0.1); padding-left:20px;">
                            <i data-lucide="eye" style="width:12px; height:12px; color:var(--accent-cyan);"></i>
                            <input type="range" id="opacity-slider" min="0.3" max="1.0" step="0.05" value="1.0" style="width:80px; cursor:pointer;">
                        </div>
                    </div>
                    <div class="footer-meta" style="display:flex; gap: 30px; align-items:center;">
                        <span style="font-size:0.55rem; opacity:0.4; letter-spacing: 1px;">ALT+M: TOGGLE WINDOW</span>
                        <a href="#" id="view-changelog" style="color: var(--accent-cyan); text-decoration:none; font-size: 0.7rem; font-weight: bold; border: 1px solid var(--accent-cyan); padding: 5px 12px; border-radius: 4px; background: rgba(0,242,255,0.05);">VERSION HISTORY</a>
                    </div>
                </footer>
            </div>
            
            <div id="changelog-modal" class="modal-overlay" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.85); z-index:9999; justify-content:center; align-items:center; backdrop-filter:blur(8px);">
                <div class="changelog-panel" style="background: var(--bg-panel); border:1px solid var(--accent-cyan); width: 620px; max-height:85vh; overflow-y:auto; padding:40px; border-radius:12px; box-shadow:0 0 60px rgba(0,242,255,0.25);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:30px;">
                        <h3 style="font-family:'Orbitron'; color:var(--accent-cyan); font-size:1rem;">NEXUS DEVELOPMENT LOG</h3>
                        <button id="close-changelog" style="background:none; border:none; color:white; font-size:2rem; cursor:pointer;">×</button>
                    </div>
                    <div id="changelog-list" style="display:flex; flex-direction:column; gap:30px;"></div>
                </div>
            </div>
        `;
        if (window.lucide) window.lucide.createIcons();
    }

    showApp() { this.container.style.opacity = '1'; }
}
