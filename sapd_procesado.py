import customtkinter as ctk
import json
import sys
from pathlib import Path

# ── Appearance ───────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

# ── Paths ────────────────────────────────────────────────────────────────────
if getattr(sys, "frozen", False):
    EXE_DIR   = Path(sys.executable).parent
    INTERNAL  = Path(sys._MEIPASS)
    DB_PATH   = EXE_DIR / "charges_db.json"       if (EXE_DIR / "charges_db.json").exists()       else INTERNAL / "charges_db.json"
    JURI_PATH = EXE_DIR / "jurisprudencia_db.json" if (EXE_DIR / "jurisprudencia_db.json").exists() else INTERNAL / "jurisprudencia_db.json"
else:
    EXE_DIR   = Path(__file__).parent
    DB_PATH   = EXE_DIR / "charges_db.json"
    JURI_PATH = EXE_DIR / "jurisprudencia_db.json"

# ── Design tokens ────────────────────────────────────────────────────────────
C = {
    "bg_deep":       "#080812",
    "bg_base":       "#0f0f1e",
    "bg_card":       "#15152a",
    "bg_elevated":   "#1c1c34",
    "bg_hover":      "#22223a",
    "bg_input":      "#12121f",
    "accent":        "#4d79ff",
    "accent_dim":    "#2a4acc",
    "accent_muted":  "#1a2a5a",
    "success":       "#2dbd6e",
    "success_dim":   "#133a22",
    "warning":       "#f0a030",
    "danger":        "#e03838",
    "danger_dim":    "#3a1010",
    "text_primary":  "#e8e8f2",
    "text_secondary":"#9090b8",
    "text_muted":    "#505070",
    "border":        "#252545",
    "border_bright": "#353560",
    "sr_bg":         "#1a2210",
    "sr_text":       "#c8d864",
    "cp_bg":         "#221010",
    "cp_text":       "#ff8080",
    "topbar":        "#06060f",
    "tabbar":        "#0a0a18",
    "right_panel":   "#0c0c1a",
}

SEV_COLOR = {
    "Infracción":    "#4a7fd4",
    "Delito leve C": "#4a9e3a",
    "Delito leve B": "#a89020",
    "Delito leve A": "#c87828",
    "Delito grave D":"#c04848",
    "Delito grave C":"#a02828",
    "Delito grave B":"#801818",
    "Delito grave A":"#5a0808",
}

# ── Fonts ────────────────────────────────────────────────────────────────────
F = {
    "title":    ("Segoe UI", 15, "bold"),
    "heading":  ("Segoe UI", 12, "bold"),
    "body":     ("Segoe UI", 11),
    "body_b":   ("Segoe UI", 11, "bold"),
    "small":    ("Segoe UI", 10),
    "small_b":  ("Segoe UI", 10, "bold"),
    "badge":    ("Segoe UI",  9, "bold"),
    "mono":     ("Consolas",  10),
}

# ── Data ─────────────────────────────────────────────────────────────────────
def load_db():
    with open(DB_PATH, encoding="utf-8") as f:
        return json.load(f)

def load_juri():
    with open(JURI_PATH, encoding="utf-8") as f:
        return json.load(f)

def reload_db():
    global DB, CHARGES, ACTIONS, CATEGORIES, JURI_DB, SITUACIONES, CASOS
    DB = load_db()
    CHARGES     = DB["charges"]
    ACTIONS     = DB["actions"]
    CATEGORIES  = DB["categories"]
    JURI_DB     = load_juri()
    SITUACIONES = JURI_DB["situaciones"]
    CASOS       = JURI_DB.get("casos", [])

DB = load_db()
CHARGES     = DB["charges"]
ACTIONS     = DB["actions"]
CATEGORIES  = DB["categories"]
JURI_DB     = load_juri()
SITUACIONES = JURI_DB["situaciones"]
CASOS       = JURI_DB.get("casos", [])

# ── Incompatibility rules  (fuente: FAQ SAPD + Comunicados) ──────────────────
# Cada regla: ids = conjunto de IDs que NO deben coexistir, msg = explicación
INCOMPAT_RULES = [
    {
        "ids": {"c007", "c006"},
        "msg": "Evasión imprudente NO es compatible con Conducción temeraria · FAQ",
    },
    {
        "ids": {"c058", "c059"},
        "msg": "Acumulación menor y mayor son excluyentes — aplica solo la que corresponda (6+ menor / 15+ mayor) · FAQ",
    },
    {
        "ids": {"c014", "c015"},
        "msg": "Robo de vehículo 1° y 2° son excluyentes — usa 1° si intención de quedarlo, 2° si temporal · FAQ",
    },
    {
        "ids": {"c071", "c072"},
        "msg": "Robo 1° (seguridad baja) y Robo 2° (seguridad media) son excluyentes · FAQ",
    },
    {
        "ids": {"c072", "c073"},
        "msg": "Robo 2° y Robo a institución de alto valor son excluyentes · FAQ",
    },
    {
        "ids": {"c071", "c073"},
        "msg": "Robo 1° y Robo a institución de alto valor son excluyentes · FAQ",
    },
    {
        "ids": {"c045", "c097"},
        "msg": "Agravante POGS NO se aplica en tiroteos/agresiones relacionadas con pandillas · FAQ",
    },
    {
        "ids": {"c046", "c097"},
        "msg": "Agravante POGS (empleado gubernamental) NO se aplica en tiroteos de pandillas · FAQ",
    },
    {
        "ids": {"c041", "c042"},
        "msg": "Homicidio involuntario y Homicidio en 3° son excluyentes — aplica solo uno · Código penal",
    },
    {
        "ids": {"c042", "c043"},
        "msg": "Homicidio en 3° y Homicidio son excluyentes — aplica solo uno · Código penal",
    },
    {
        "ids": {"c041", "c043"},
        "msg": "Homicidio involuntario y Homicidio son excluyentes — aplica solo uno · Código penal",
    },
    {
        "ids": {"c043", "c044"},
        "msg": "Homicidio y Homicidio de empleado gubernamental son excluyentes — aplica solo uno · Código penal",
    },
]

# ── Cómplice auto-remove rules (fuente: FAQ SAPD) ────────────────────────────
# Cuando el cargo KEY se marca como cómplice, se eliminan automáticamente
# los cargos del conjunto VALUE (que no aplican a pasajeros en ese contexto).
# Ejemplo: en un 10-90 normal el pasajero NO recibe robo de vehículo (c014/c015).
COMPLICE_REMOVE_RULES: dict[str, set[str]] = {
    "c071": {"c014", "c015", "c012"},   # Robo 1° cómplice → sin robo vehículo ni fraude registro
    "c072": {"c014", "c015", "c012"},   # Robo 2° cómplice → ídem
    "c073": {"c014", "c015", "c012"},   # Robo alto valor cómplice → ídem
}
# Cargos que se heredan como cómplice al marcar el robo principal como cómplice
COMPLICE_INHERIT_RULES: dict[str, set[str]] = {
    "c071": {"c007"},   # Evasión imprudente pasa a cómplice (el pasajero también huye en el vehículo)
    "c072": {"c007"},
    "c073": {"c007"},
}

def get_active_warnings(selected_ids: set) -> list[str]:
    """Devuelve lista de mensajes de advertencia para los cargos seleccionados."""
    return [
        r["msg"] for r in INCOMPAT_RULES
        if r["ids"].issubset(selected_ids)
    ]

def get_charges_by_ids(ids):
    lookup = {c["id"]: c for c in CHARGES}
    seen, out = set(), []
    for cid in ids:
        if cid in lookup and cid not in seen:
            out.append(lookup[cid]); seen.add(cid)
    return out

# ── Severity sort order ───────────────────────────────────────────────────────
SEV_ORDER = {
    "Infracción":    0,
    "Delito leve C": 1,
    "Delito leve B": 2,
    "Delito leve A": 3,
    "Delito grave D":4,
    "Delito grave C":5,
    "Delito grave B":6,
    "Delito grave A":7,
}

# ── Helpers ──────────────────────────────────────────────────────────────────
def hsep(parent, color=None, height=1, pady=0, padx=0):
    ctk.CTkFrame(parent, height=height, fg_color=color or C["border"], corner_radius=0
                 ).pack(fill="x", pady=pady, padx=padx)

# ── Tooltip ──────────────────────────────────────────────────────────────────
class Tooltip:
    """Lightweight hover tooltip for any widget."""
    def __init__(self, widget, text: str):
        self._tip: ctk.CTkToplevel | None = None
        widget.bind("<Enter>", lambda e: self._show(widget, text), add="+")
        widget.bind("<Leave>", lambda e: self._hide(), add="+")

    def _show(self, widget, text):
        if self._tip:
            return
        x = widget.winfo_rootx() + 6
        y = widget.winfo_rooty() + widget.winfo_height() + 4
        self._tip = ctk.CTkToplevel()
        self._tip.wm_overrideredirect(True)
        self._tip.wm_geometry(f"+{x}+{y}")
        self._tip.attributes("-topmost", True)
        ctk.CTkFrame(self._tip, fg_color="#1a1a30",
                     corner_radius=6, border_width=1,
                     border_color=C["border_bright"]
                     ).pack(padx=0, pady=0)
        ctk.CTkLabel(self._tip, text=text, font=F["small"],
                     text_color=C["text_secondary"],
                     fg_color="#1a1a30", corner_radius=6,
                     justify="left", wraplength=260,
                     padx=10, pady=6
                     ).pack()

    def _hide(self):
        if self._tip:
            self._tip.destroy()
            self._tip = None

# ── Widgets ──────────────────────────────────────────────────────────────────
class ChargeCard(ctk.CTkFrame):
    def __init__(self, master, charge, on_toggle=None, selected=False, **kw):
        super().__init__(master, corner_radius=8, fg_color=C["bg_card"],
                         border_width=1, border_color=C["border"], **kw)
        self.charge    = charge
        self.selected  = selected
        self.on_toggle = on_toggle
        self._build()

    def _build(self):
        sev   = self.charge["severity"]
        color = SEV_COLOR.get(sev, "#555")

        # Left severity strip
        strip = ctk.CTkFrame(self, width=4, fg_color=color, corner_radius=0)
        strip.pack(side="left", fill="y")
        strip.pack_propagate(False)

        # Content
        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(side="left", fill="both", expand=True, padx=(10, 8), pady=8)

        # Row 1: badge + fine
        row1 = ctk.CTkFrame(body, fg_color="transparent")
        row1.pack(fill="x")

        ctk.CTkLabel(row1, text=sev, fg_color=color, text_color="white",
                     corner_radius=4, font=F["badge"], padx=6, pady=2
                     ).pack(side="left")

        if self.charge.get("fine"):
            ctk.CTkLabel(row1, text=f"${self.charge['fine']:,.0f}",
                         font=F["small_b"], text_color=C["success"]
                         ).pack(side="right")

        # Name
        ctk.CTkLabel(body, text=self.charge["name"], font=F["body_b"],
                     text_color=C["text_primary"], anchor="w", wraplength=400
                     ).pack(fill="x", pady=(3, 1))

        # Description
        ctk.CTkLabel(body, text=self.charge["description"], font=F["small"],
                     text_color=C["text_secondary"], anchor="w", wraplength=400
                     ).pack(fill="x")

        # Stats + button
        row2 = ctk.CTkFrame(body, fg_color="transparent")
        row2.pack(fill="x", pady=(5, 0))

        if self.charge.get("jail_minutes", 0) > 0:
            ctk.CTkLabel(row2, text=f"🔒 {self.charge['jail_minutes']} min",
                         font=F["small"], text_color="#ff8888"
                         ).pack(side="left", padx=(0, 8))

        if self.charge.get("points", 0) > 0:
            ctk.CTkLabel(row2, text=f"● {self.charge['points']} pts",
                         font=F["small"], text_color=C["warning"]
                         ).pack(side="left")

        if self.on_toggle:
            self._is_sel = self.selected
            self.btn = ctk.CTkButton(
                row2, text="✓ Añadido" if self.selected else "+ Añadir",
                width=84, height=24, font=F["small"],
                corner_radius=4,
                fg_color=C["success_dim"]  if self.selected else C["accent_muted"],
                hover_color="#1a5a30"      if self.selected else C["accent_dim"],
                text_color=C["success"]    if self.selected else C["accent"],
                command=self._toggle
            )
            self.btn.pack(side="right")

    def _toggle(self):
        self.selected = not self.selected
        if self.on_toggle:
            self.on_toggle(self.charge, self.selected)
        if self.selected:
            self.btn.configure(text="✓ Añadido", fg_color=C["success_dim"],
                               hover_color="#1a5a30", text_color=C["success"])
        else:
            self.btn.configure(text="+ Añadir", fg_color=C["accent_muted"],
                               hover_color=C["accent_dim"], text_color=C["accent"])


class ScrollableChargeList(ctk.CTkScrollableFrame):
    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self.cards = []

    def clear(self):
        for w in self.winfo_children(): w.destroy()
        self.cards = []

    def show_charges(self, charges, on_toggle=None, selected_ids=None):
        self.clear()
        selected_ids = selected_ids or set()
        if not charges:
            ctk.CTkLabel(self, text="Sin resultados.", font=F["body"],
                         text_color=C["text_muted"]).pack(pady=20)
            return
        for ch in charges:
            card = ChargeCard(self, ch, on_toggle=on_toggle,
                              selected=ch["id"] in selected_ids)
            card.pack(fill="x", pady=3, padx=2)
            self.cards.append(card)


class SelectedPanel(ctk.CTkScrollableFrame):
    def __init__(self, master, on_remove, on_toggle_complice, on_personal_vehicle, **kw):
        super().__init__(master, **kw)
        self.on_remove           = on_remove
        self.on_toggle_complice  = on_toggle_complice
        self.on_personal_vehicle = on_personal_vehicle

    def refresh(self, charges, complice_ids: set):
        for w in self.winfo_children(): w.destroy()
        if not charges:
            ctk.CTkLabel(self, text="Ningún cargo añadido.",
                         font=F["body"], text_color=C["text_muted"]
                         ).pack(pady=16)
            return
        for ch in charges:
            self._row(ch, ch["id"] in complice_ids)

    def _row(self, ch, is_complice: bool):
        # Outer row — border turns purple when cómplice
        border_col = "#4a2070" if is_complice else C["border"]
        bg_col     = "#1a0d2a" if is_complice else C["bg_elevated"]
        row = ctk.CTkFrame(self, fg_color=bg_col,
                           corner_radius=6, border_width=1,
                           border_color=border_col)
        row.pack(fill="x", pady=2, padx=2)

        sev   = ch["severity"]
        color = SEV_COLOR.get(sev, "#555")

        # Left severity strip
        ctk.CTkFrame(row, width=3, fg_color=color, corner_radius=0
                     ).pack(side="left", fill="y")

        # Content area (vertical: name row + controls row)
        content = ctk.CTkFrame(row, fg_color="transparent")
        content.pack(side="left", fill="x", expand=True, padx=(8, 6), pady=5)

        # ── Row 1: severity badge + charge name (full width, wraps) ──────────
        name_row = ctk.CTkFrame(content, fg_color="transparent")
        name_row.pack(fill="x")

        ctk.CTkLabel(name_row, text=sev, fg_color=color, text_color="white",
                     corner_radius=3, font=F["badge"], padx=4, pady=1
                     ).pack(side="left")

        ctk.CTkLabel(name_row, text=ch["name"], font=F["small"],
                     text_color=C["text_primary"], anchor="w",
                     wraplength=310, justify="left"
                     ).pack(side="left", fill="x", expand=True, padx=(6, 0))

        # ── Row 2: fine + controls (right-aligned) ───────────────────────────
        ctrl_row = ctk.CTkFrame(content, fg_color="transparent")
        ctrl_row.pack(fill="x", pady=(3, 0))

        # Fine badge (left)
        if ch.get("fine"):
            ctk.CTkLabel(ctrl_row, text=f"${ch['fine']:,.0f}",
                         font=F["badge"], text_color=C["success"],
                         fg_color=C["success_dim"], corner_radius=4,
                         padx=5, pady=1
                         ).pack(side="left")

        # Controls (right-aligned)
        # Remove button
        ctk.CTkButton(ctrl_row, text="✕", width=22, height=20,
                      fg_color=C["danger_dim"], hover_color=C["danger"],
                      text_color=C["danger"], font=F["small_b"],
                      corner_radius=4,
                      command=lambda c=ch: self.on_remove(c)
                      ).pack(side="right", padx=(2, 0))

        # Autor / Cómplice toggle pill
        pill_text  = "👥 Cómplice" if is_complice else "✏ Autor"
        pill_fg    = "#2a0a4a"    if is_complice else C["bg_card"]
        pill_hover = "#3d1060"    if is_complice else C["bg_elevated"]
        pill_txt   = "#c084fc"    if is_complice else C["text_muted"]
        ctk.CTkButton(
            ctrl_row, text=pill_text, width=82, height=20,
            fg_color=pill_fg, hover_color=pill_hover,
            text_color=pill_txt, font=F["badge"],
            corner_radius=10, border_width=1,
            border_color="#7a30b0" if is_complice else C["border"],
            command=lambda c=ch: self.on_toggle_complice(c["id"])
        ).pack(side="right", padx=2)

        # 10-99? button for vehicle robbery charges
        if ch["id"] in ("c014", "c015"):
            ctk.CTkButton(
                ctrl_row, text="🚗 10-99?", width=70, height=20,
                fg_color="#0a2010", hover_color="#103a1a",
                text_color="#60d090", font=F["badge"],
                corner_radius=10, border_width=1,
                border_color="#1a5030",
                command=lambda c=ch: self.on_personal_vehicle(c["id"])
            ).pack(side="right", padx=2)

    @staticmethod
    def build_summary(charges, complice_ids: set = None, state_id: str = ""):
        complice_ids = complice_ids or set()
        if not charges:
            return "Sin cargos seleccionados."
        header = "═══ RESUMEN ═══"
        if state_id:
            header += f"  |  State ID: {state_id}"
        lines = [header + "\n"]
        total_fine = total_jail = 0
        n_complice = 0
        for ch in charges:
            complice = ch["id"] in complice_ids
            if complice:
                n_complice += 1
            tag  = " [CÓMPLICE]" if complice else ""
            line = f"• {ch['name']}{tag} [{ch['severity']}]"
            if ch.get("fine"):
                line += f"  ${ch['fine']:,.0f}"
                total_fine += ch["fine"]
            if ch.get("jail_minutes", 0) > 0:
                line += f"  🔒{ch['jail_minutes']}min"
                total_jail = max(total_jail, ch["jail_minutes"])
            lines.append(line)
        lines.append(f"\n💰 Total multas : ${total_fine:,.0f}")
        if total_jail:
            lines.append(f"🔒 Prisión (mayor): {total_jail} min")
        lines.append(f"📋 Cargos totales : {len(charges)}")
        if n_complice:
            lines.append(f"👥 Cargos como cómplice: {n_complice}")

        sel_ids = {ch["id"] for ch in charges}
        warnings = get_active_warnings(sel_ids)
        if warnings:
            lines.append("\n⚠ INCOMPATIBILIDADES:")
            for w in warnings:
                lines.append(f"  ⚠ {w}")
        return "\n".join(lines)


# ── Main App ──────────────────────────────────────────────────────────────────
class SAPDApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("SAPD · Asistente de Procesado — ONX")
        self.geometry("1180x740")
        self.minsize(960, 640)
        self.configure(fg_color=C["bg_deep"])
        self.selected:       dict[str, dict] = {}
        self._complice:      set[str]        = set()
        self._history:       list            = []   # undo stack: [(selected, complice), ...]
        self._global_complice_on: bool       = False
        self._build_ui()
        self._update_db_label()
        # Keyboard shortcut: Ctrl+Z → undo
        self.bind("<Control-z>", lambda e: self._undo())

    # ── DB management ────────────────────────────────────────────────────────
    def _update_db_label(self):
        ext = EXE_DIR / "charges_db.json"
        if ext.exists():
            self.db_lbl.configure(text=f"DB externa · {len(CHARGES)} cargos",
                                  text_color=C["success"])
        else:
            self.db_lbl.configure(text=f"DB interna · {len(CHARGES)} cargos",
                                  text_color=C["text_muted"])

    def _reload_db(self):
        try:
            reload_db()
            self._rebuild_dynamic_tabs()
            self.selected.clear()
            self._refresh_right()
            self._update_db_label()
            self.db_lbl.configure(text_color=C["success"])
            self.after(2000, self._update_db_label)
        except Exception as e:
            self.db_lbl.configure(text=f"Error: {e}", text_color=C["danger"])

    def _open_db_editor(self):
        import subprocess, shutil
        target = EXE_DIR / "charges_db.json"
        if not target.exists():
            src = INTERNAL / "charges_db.json" if getattr(sys, "frozen", False) else DB_PATH
            shutil.copy(src, target)
        subprocess.Popen(["notepad.exe", str(target)])
        self.db_lbl.configure(text="Guarda el archivo → pulsa Recargar",
                              text_color=C["warning"])

    def _rebuild_dynamic_tabs(self):
        for tid in list(self.tab_frames):
            self.tab_frames[tid].destroy()
            del self.tab_frames[tid]
        self._build_tab_acciones(self._content)
        self._build_tab_categoria(self._content)
        self._build_tab_juridico(self._content)
        self._switch_tab("acciones")

    # ── UI skeleton ──────────────────────────────────────────────────────────
    def _build_ui(self):
        self._build_topbar()
        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True)
        self._build_left(body)
        self._build_right(body)

    def _build_topbar(self):
        bar = ctk.CTkFrame(self, fg_color=C["topbar"], corner_radius=0, height=54)
        bar.pack(fill="x")
        bar.pack_propagate(False)

        # Left: logo
        logo_wrap = ctk.CTkFrame(bar, fg_color="transparent")
        logo_wrap.pack(side="left", padx=18, pady=0, fill="y")

        ctk.CTkLabel(logo_wrap, text="SAPD",
                     font=("Segoe UI", 18, "bold"), text_color=C["accent"]
                     ).pack(side="left", pady=14)
        ctk.CTkLabel(logo_wrap, text="  Asistente de Procesado",
                     font=("Segoe UI", 13), text_color=C["text_secondary"]
                     ).pack(side="left", pady=14)

        # Right: controls
        ctrl = ctk.CTkFrame(bar, fg_color="transparent")
        ctrl.pack(side="right", padx=16, fill="y")

        self.db_lbl = ctk.CTkLabel(ctrl, text="", font=F["small"],
                                   text_color=C["text_muted"])
        self.db_lbl.pack(side="right", padx=(8, 0), pady=14)

        for text, cmd, clr in [
            ("⟳ Recargar", self._reload_db,    C["bg_elevated"]),
            ("✎ Editar DB", self._open_db_editor, C["bg_elevated"]),
        ]:
            ctk.CTkButton(ctrl, text=text, width=100, height=30,
                          fg_color=clr, hover_color=C["bg_hover"],
                          text_color=C["text_secondary"], font=F["small"],
                          corner_radius=6, border_width=1,
                          border_color=C["border"],
                          command=cmd
                          ).pack(side="right", padx=3, pady=12)

        # Bottom accent line
        ctk.CTkFrame(self, height=2, fg_color=C["accent"], corner_radius=0
                     ).pack(fill="x")

    def _build_left(self, body):
        left = ctk.CTkFrame(body, fg_color=C["bg_base"], corner_radius=0)
        left.pack(side="left", fill="both", expand=True)

        # Tab bar
        tabbar = ctk.CTkFrame(left, fg_color=C["tabbar"], corner_radius=0, height=46)
        tabbar.pack(fill="x")
        tabbar.pack_propagate(False)

        self._tab_var     = ctk.StringVar(value="acciones")
        self._tab_buttons: dict[str, ctk.CTkButton] = {}
        self.tab_frames:   dict[str, ctk.CTkFrame]  = {}

        tabs = [
            ("acciones",  "☑  Acciones rápidas"),
            ("categoria", "▤  Por categoría"),
            ("juridico",  "⚖  Causa Probable"),
        ]
        for tid, tlabel in tabs:
            btn = ctk.CTkButton(
                tabbar, text=tlabel, width=185, height=46,
                corner_radius=0,
                fg_color=C["bg_base"] if tid == "acciones" else "transparent",
                hover_color=C["bg_elevated"],
                text_color=C["text_primary"] if tid == "acciones" else C["text_muted"],
                font=F["body"],
                command=lambda t=tid: self._switch_tab(t)
            )
            btn.pack(side="left")
            self._tab_buttons[tid] = btn

        # Active tab indicator (thin accent bar)
        self._tab_indicator = ctk.CTkFrame(tabbar, width=185, height=2,
                                           fg_color=C["accent"], corner_radius=0)
        self._tab_indicator.place(x=0, y=44)

        hsep(left, C["border"])

        self._content = ctk.CTkFrame(left, fg_color="transparent", corner_radius=0)
        self._content.pack(fill="both", expand=True)

        self._build_tab_acciones(self._content)
        self._build_tab_categoria(self._content)
        self._build_tab_juridico(self._content)
        self._switch_tab("acciones")

    def _build_right(self, body):
        right = ctk.CTkFrame(body, fg_color=C["right_panel"], corner_radius=0,
                             width=390, border_width=0)
        right.pack(side="right", fill="both")
        right.pack_propagate(False)

        # ── State ID row ─────────────────────────────────────────────────────
        sid_row = ctk.CTkFrame(right, fg_color="transparent")
        sid_row.pack(fill="x", padx=14, pady=(12, 4))

        ctk.CTkLabel(sid_row, text="State ID del detenido",
                     font=F["small_b"], text_color=C["text_muted"]
                     ).pack(side="left")

        self._state_id_entry = ctk.CTkEntry(
            sid_row, placeholder_text="#00000", font=F["body_b"],
            fg_color=C["bg_input"], border_color=C["border"],
            text_color=C["accent"], height=28, width=90,
        )
        self._state_id_entry.pack(side="right")
        self._state_id_entry.bind("<KeyRelease>", lambda e: self._refresh_summary())

        # ── Header row ───────────────────────────────────────────────────────
        rh = ctk.CTkFrame(right, fg_color="transparent")
        rh.pack(fill="x", padx=14, pady=(0, 4))

        ctk.CTkLabel(rh, text="Cargos seleccionados",
                     font=F["heading"], text_color=C["text_secondary"]
                     ).pack(side="left")
        self.count_lbl = ctk.CTkLabel(rh, text="0", font=F["small_b"],
                                      fg_color=C["accent_muted"],
                                      text_color=C["accent"],
                                      corner_radius=10, padx=8, pady=1)
        self.count_lbl.pack(side="left", padx=6)

        # Global cómplice toggle
        self._global_complice_btn = ctk.CTkButton(
            rh, text="👥 Todo cómplice", width=110, height=24,
            fg_color=C["bg_card"], hover_color="#2a0a4a",
            text_color=C["text_muted"], font=F["badge"],
            corner_radius=10, border_width=1, border_color=C["border"],
            command=self._toggle_global_complice,
        )
        self._global_complice_btn.pack(side="right")

        hsep(right, C["border"], padx=14)

        # Charge list
        self.selected_panel = SelectedPanel(
            right,
            on_remove=self._remove_charge,
            on_toggle_complice=self._toggle_complice,
            on_personal_vehicle=self._apply_personal_vehicle,
            fg_color="transparent",
        )
        self.selected_panel.pack(fill="both", expand=True, padx=8)

        hsep(right, C["border"], padx=14, pady=(4, 0))

        # Warnings panel (shown only when incompatibilities exist)
        self._warn_outer = ctk.CTkFrame(
            right,
            fg_color="#1e1200",
            corner_radius=8,
            border_width=1,
            border_color="#4a3000",
        )
        # Not packed yet — shown via _update_warnings()
        self._warn_labels: list[ctk.CTkLabel] = []

        # Header row inside warn_outer
        warn_hrow = ctk.CTkFrame(self._warn_outer, fg_color="transparent")
        warn_hrow.pack(fill="x", padx=10, pady=(6, 2))
        ctk.CTkLabel(
            warn_hrow,
            text="⚠  Incompatibilidades detectadas",
            font=F["small_b"], text_color=C["warning"],
        ).pack(side="left")

        self._warn_body = ctk.CTkFrame(self._warn_outer, fg_color="transparent")
        self._warn_body.pack(fill="x", padx=10, pady=(0, 6))

        # Totals box
        totals = ctk.CTkFrame(right, fg_color=C["bg_elevated"], corner_radius=8,
                              border_width=1, border_color=C["border"])
        totals.pack(fill="x", padx=12, pady=8)
        self._totals_frame = totals

        trow = ctk.CTkFrame(totals, fg_color="transparent")
        trow.pack(fill="x", padx=14, pady=10)

        self.total_fine_lbl = ctk.CTkLabel(trow, text="$0", font=F["title"],
                                           text_color=C["success"])
        self.total_fine_lbl.pack(side="left")

        self.total_jail_lbl = ctk.CTkLabel(trow, text="", font=F["body_b"],
                                           text_color="#ff9999")
        self.total_jail_lbl.pack(side="right")

        # Action buttons
        btns = ctk.CTkFrame(right, fg_color="transparent")
        btns.pack(fill="x", padx=12, pady=(0, 6))

        ctk.CTkButton(btns, text="🗑  Limpiar", width=80, height=30,
                      fg_color=C["danger_dim"], hover_color="#5a1a1a",
                      text_color=C["danger"], font=F["small"],
                      corner_radius=6, border_width=1, border_color=C["danger_dim"],
                      command=self._clear_all
                      ).pack(side="left")

        self._undo_btn = ctk.CTkButton(
            btns, text="↩ Deshacer", width=90, height=30,
            fg_color=C["bg_elevated"], hover_color=C["bg_hover"],
            text_color=C["text_muted"], font=F["small"],
            corner_radius=6, border_width=1, border_color=C["border"],
            command=self._undo, state="disabled",
        )
        self._undo_btn.pack(side="left", padx=4)

        ctk.CTkButton(btns, text="📋 Copiar", height=30,
                      fg_color=C["accent_muted"], hover_color=C["accent_dim"],
                      text_color=C["accent"], font=F["small"],
                      corner_radius=6, border_width=1, border_color=C["accent_muted"],
                      command=self._copy_summary
                      ).pack(side="right")

        # Summary textbox
        self.summary_box = ctk.CTkTextbox(
            right, height=140, font=F["mono"],
            fg_color=C["bg_input"], text_color=C["text_secondary"],
            border_width=1, border_color=C["border"],
            corner_radius=8, state="disabled"
        )
        self.summary_box.pack(fill="x", padx=12, pady=(0, 12))

    # ── Tab switching ─────────────────────────────────────────────────────────
    def _switch_tab(self, tab_id: str):
        self._tab_var.set(tab_id)
        for tid, f in self.tab_frames.items():
            f.pack_forget()
        self.tab_frames[tab_id].pack(fill="both", expand=True)

        tab_order = ["acciones", "categoria", "juridico"]
        idx = tab_order.index(tab_id) if tab_id in tab_order else 0
        self._tab_indicator.place(x=idx * 185, y=44)

        for tid, btn in self._tab_buttons.items():
            active = tid == tab_id
            btn.configure(
                fg_color=C["bg_base"]       if active else "transparent",
                text_color=C["text_primary"] if active else C["text_muted"],
            )

    # ── Tab: Acciones ─────────────────────────────────────────────────────────
    # Group definitions: ordered list of (display_name, set_of_identifying_charge_ids)
    _ACTION_GROUP_DEFS = [
        ("🏦  Robos",      {"c071", "c072", "c073", "c074", "c014", "c015"}),
        ("🚗  Huida",      {"c007", "c022", "c023"}),
        ("🔫  Armas",      {"c048", "c049", "c050", "c051", "c052", "c057", "c058", "c059", "c060"}),
        ("💊  Drogas",     {"c064", "c065", "c066", "c067", "c068", "c069"}),
        ("👊  Personas",   {"c025", "c031", "c032", "c033", "c034", "c036", "c037",
                            "c039", "c040", "c043", "c044", "c045", "c046", "c083", "c099"}),
        ("🚙  Vehículos",  {"c002", "c008", "c011", "c012", "c013"}),
        ("⚙  Otros",       set()),  # catch-all
    ]

    @staticmethod
    def _action_group_name(action) -> str:
        ids = set(action["charges"])
        for name, keys in SAPDApp._ACTION_GROUP_DEFS:
            if ids & keys:
                return name
        return "⚙  Otros"

    @staticmethod
    def _action_meta(action) -> tuple[int, int, int]:
        """Returns (total_fine, max_jail, charge_count) for an action."""
        lookup = {c["id"]: c for c in CHARGES}
        charges = [lookup[cid] for cid in action["charges"] if cid in lookup]
        fine = sum(c.get("fine", 0) for c in charges)
        jail = max((c.get("jail_minutes", 0) for c in charges), default=0)
        return fine, jail, len(charges)

    def _build_tab_acciones(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self.tab_frames["acciones"] = frame

        # ── Top bar ───────────────────────────────────────────────────────────
        frow = ctk.CTkFrame(frame, fg_color="transparent")
        frow.pack(fill="x", padx=14, pady=(10, 6))

        ctk.CTkLabel(frow, text="Situaciones cometidas", font=F["heading"],
                     text_color=C["text_secondary"]).pack(side="left")

        # Checked counter badge
        self._action_checked_lbl = ctk.CTkLabel(
            frow, text="", font=F["small_b"],
            fg_color=C["accent_muted"], text_color=C["accent"],
            corner_radius=10, padx=8, pady=1,
        )
        self._action_checked_lbl.pack(side="left", padx=6)

        self.action_filter = ctk.CTkEntry(
            frow, placeholder_text="🔍 Filtrar...", font=F["body"],
            fg_color=C["bg_input"], border_color=C["border"],
            text_color=C["text_primary"], height=30, width=160,
        )
        self.action_filter.pack(side="right")
        self.action_filter.bind("<KeyRelease>", self._filter_actions)

        hsep(frame, padx=14, pady=(0, 2))

        # ── Scrollable list ───────────────────────────────────────────────────
        scrl = ctk.CTkScrollableFrame(frame, fg_color="transparent", label_text="")
        scrl.pack(fill="both", expand=True, padx=8)

        # _action_vars stores (BooleanVar, row_frame, CTkCheckBox, action)
        self._action_vars: list[tuple[ctk.BooleanVar, ctk.CTkFrame, ctk.CTkCheckBox, dict]] = []
        # Group header frames for show/hide during filter
        self._action_group_headers: list[tuple[ctk.CTkFrame, list]] = []

        # Group actions
        from collections import defaultdict
        grouped: dict[str, list] = defaultdict(list)
        for action in ACTIONS:
            grouped[self._action_group_name(action)].append(action)

        # Render in defined order
        group_order = [name for name, _ in self._ACTION_GROUP_DEFS]
        for g_name in group_order:
            g_actions = grouped.get(g_name, [])
            if not g_actions:
                continue

            # Group header
            g_hdr = ctk.CTkFrame(scrl, fg_color="transparent")
            g_hdr.pack(fill="x", pady=(8, 2), padx=4)

            # Left accent bar + label
            ctk.CTkFrame(g_hdr, width=3, height=18,
                         fg_color=C["accent_dim"], corner_radius=2
                         ).pack(side="left", padx=(0, 6))
            ctk.CTkLabel(g_hdr, text=g_name, font=F["small_b"],
                         text_color=C["text_muted"]
                         ).pack(side="left")

            row_widgets = []

            # Split into autor and cómplice sub-groups for visual separation
            autor_actions   = [a for a in g_actions if not a.get("complice")]
            complice_actions = [a for a in g_actions if a.get("complice")]

            def _build_action_row(action, scrl=scrl):
                fine, jail, n_ch = self._action_meta(action)
                var = ctk.BooleanVar(value=False)
                row = ctk.CTkFrame(scrl, fg_color="transparent",
                                   corner_radius=6, height=34)
                row.pack(fill="x", pady=1, padx=2)
                row.pack_propagate(False)

                def _on_toggle(v=var, r=row, a=action):
                    self._push_history()
                    is_complice = a.get("complice") or self._global_complice_on
                    if v.get():
                        r.configure(fg_color=C["accent_muted"])
                        charges_obj = get_charges_by_ids(a["charges"])

                        if is_complice:
                            # Pre-calcular todos los cargos a eliminar por reglas de cómplice
                            to_remove: set[str] = set()
                            for ch in charges_obj:
                                to_remove.update(COMPLICE_REMOVE_RULES.get(ch["id"], set()))
                            # Añadir solo los que no están en la lista de eliminación
                            for ch in charges_obj:
                                if ch["id"] not in to_remove:
                                    self.selected[ch["id"]] = ch
                                    self._complice.add(ch["id"])
                            # Eliminar incompatibles del selected existente
                            for rid in to_remove:
                                self.selected.pop(rid, None)
                                self._complice.discard(rid)
                            # Heredar cómplice a cargos relacionados (ej: evasión)
                            for ch in charges_obj:
                                for rid in COMPLICE_INHERIT_RULES.get(ch["id"], set()):
                                    if rid in self.selected:
                                        self._complice.add(rid)
                        else:
                            # Autor: añadir todos sin restricciones
                            for ch in charges_obj:
                                self.selected[ch["id"]] = ch
                    else:
                        r.configure(fg_color="transparent")
                        # Quitar cargos que no aporta ninguna otra acción marcada
                        other_charges: set[str] = set()
                        for v2, r2, cb2, a2 in self._action_vars:
                            if v2 is not v and v2.get():
                                other_charges.update(a2["charges"])
                        for cid in a["charges"]:
                            if cid not in other_charges:
                                self.selected.pop(cid, None)
                                self._complice.discard(cid)
                    self._update_action_counter()
                    self._refresh_right()

                cb = ctk.CTkCheckBox(
                    row, text=action["label"], font=F["body"],
                    text_color=C["text_primary"],
                    fg_color=C["accent"], hover_color=C["accent_dim"],
                    border_color=C["border_bright"],
                    checkmark_color="white",
                    variable=var, command=_on_toggle, width=0,
                )
                cb.pack(side="left", padx=(6, 4), pady=2)

                # Badges (right side)
                badge_row = ctk.CTkFrame(row, fg_color="transparent")
                badge_row.pack(side="right", padx=4)

                if jail > 0:
                    ctk.CTkLabel(badge_row, text=f"🔒{jail}m",
                                 font=F["badge"], text_color="#ff8888",
                                 fg_color="#2a1010", corner_radius=4,
                                 padx=5, pady=1).pack(side="right", padx=2)
                if fine > 0:
                    ctk.CTkLabel(badge_row, text=f"${fine:,.0f}",
                                 font=F["badge"], text_color=C["success"],
                                 fg_color=C["success_dim"], corner_radius=4,
                                 padx=5, pady=1).pack(side="right", padx=2)
                if action.get("complice"):
                    ctk.CTkLabel(badge_row, text="👥 Cómplice",
                                 font=F["badge"], text_color="#c084fc",
                                 fg_color="#2a0a4a", corner_radius=4,
                                 padx=5, pady=1).pack(side="right", padx=2)
                if n_ch > 1:
                    ctk.CTkLabel(badge_row, text=f"{n_ch}✦",
                                 font=F["badge"], text_color=C["text_muted"],
                                 fg_color=C["bg_elevated"], corner_radius=4,
                                 padx=4, pady=1).pack(side="right", padx=2)

                self._action_vars.append((var, row, cb, action))
                row_widgets.append(row)

            for action in autor_actions:
                _build_action_row(action)

            if complice_actions:
                # Cómplice sub-header
                sub_hdr = ctk.CTkFrame(scrl, fg_color="transparent")
                sub_hdr.pack(fill="x", pady=(6, 1), padx=4)
                ctk.CTkFrame(sub_hdr, width=3, height=14,
                             fg_color="#7a30b0", corner_radius=2
                             ).pack(side="left", padx=(0, 6))
                ctk.CTkLabel(sub_hdr, text="👥 Como cómplice",
                             font=F["small_b"], text_color="#7a50a0"
                             ).pack(side="left")
                row_widgets.append(sub_hdr)
                for action in complice_actions:
                    _build_action_row(action)

            self._action_group_headers.append((g_hdr, row_widgets))

        # ── Bottom buttons ────────────────────────────────────────────────────
        hsep(frame, padx=14, pady=(4, 0))
        brow = ctk.CTkFrame(frame, fg_color="transparent")
        brow.pack(fill="x", padx=12, pady=8)

        ctk.CTkLabel(brow, text="Los cargos se añaden al marcar  ·",
                     font=F["small"], text_color=C["text_muted"]
                     ).pack(side="left")

        ctk.CTkButton(brow, text="✕ Desmarcar todo", height=30, width=130,
                      fg_color=C["bg_elevated"], hover_color=C["bg_hover"],
                      text_color=C["text_secondary"], font=F["small"],
                      corner_radius=6, border_width=1, border_color=C["border"],
                      command=self._clear_action_checks
                      ).pack(side="right")

    # ── Tab: Categoría ────────────────────────────────────────────────────────
    def _build_tab_categoria(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self.tab_frames["categoria"] = frame

        ctk.CTkLabel(frame, text="Categoría de delitos", font=F["heading"],
                     text_color=C["text_secondary"]
                     ).pack(anchor="w", padx=14, pady=(12, 6))

        hsep(frame, padx=14, pady=(0, 6))

        # Category buttons grid
        cat_outer = ctk.CTkFrame(frame, fg_color="transparent")
        cat_outer.pack(fill="x", padx=12, pady=(0, 6))

        cats = list(CATEGORIES.items())
        cols = 3
        for i, (cat_id, cat_name) in enumerate(cats):
            row_idx = i // cols
            col_idx = i % cols
            if col_idx == 0:
                row_frame = ctk.CTkFrame(cat_outer, fg_color="transparent")
                row_frame.pack(fill="x", pady=2)
            ctk.CTkButton(
                row_frame, text=cat_name, height=32,
                font=F["small"], fg_color=C["bg_elevated"],
                hover_color=C["bg_hover"], text_color=C["text_secondary"],
                corner_radius=6, border_width=1, border_color=C["border"],
                command=lambda c=cat_id: self._show_category(c)
            ).pack(side="left", fill="x", expand=True, padx=2)

        hsep(frame, padx=14)

        self.cat_results = ScrollableChargeList(frame, fg_color="transparent",
                                                label_text="")
        self.cat_results.pack(fill="both", expand=True, padx=10)

    # ── Tab: Jurídico ─────────────────────────────────────────────────────────
    def _build_tab_juridico(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self.tab_frames["juridico"] = frame

        # Sub-tab bar
        sub_bar = ctk.CTkFrame(frame, fg_color=C["tabbar"], height=38, corner_radius=0)
        sub_bar.pack(fill="x")
        sub_bar.pack_propagate(False)

        self._juri_sub_frames: dict[str, ctk.CTkFrame] = {}
        self._juri_sub_btns:   dict[str, ctk.CTkButton] = {}

        for sid, slabel in [("eval", "⚖  Evaluación"), ("casos", "📖  Jurisprudencia")]:
            btn = ctk.CTkButton(
                sub_bar, text=slabel, width=175, height=38,
                corner_radius=0,
                fg_color=C["bg_base"] if sid == "eval" else "transparent",
                hover_color=C["bg_elevated"],
                text_color=C["text_primary"] if sid == "eval" else C["text_muted"],
                font=F["small"],
                command=lambda s=sid: self._switch_juri_sub(s)
            )
            btn.pack(side="left")
            self._juri_sub_btns[sid] = btn

        self._juri_sub_indicator = ctk.CTkFrame(sub_bar, width=175, height=2,
                                                fg_color=C["warning"],
                                                corner_radius=0)
        self._juri_sub_indicator.place(x=0, y=36)

        hsep(frame, C["border"])

        sub_content = ctk.CTkFrame(frame, fg_color="transparent")
        sub_content.pack(fill="both", expand=True)
        self._juri_sub_content = sub_content

        self._build_juri_eval(sub_content)
        self._build_juri_casos(sub_content)
        self._switch_juri_sub("eval")

    def _switch_juri_sub(self, sid: str):
        for k, f in self._juri_sub_frames.items():
            f.pack_forget()
        self._juri_sub_frames[sid].pack(fill="both", expand=True)
        x = 0 if sid == "eval" else 175
        self._juri_sub_indicator.place(x=x, y=36)
        for k, b in self._juri_sub_btns.items():
            active = k == sid
            b.configure(fg_color=C["bg_base"] if active else "transparent",
                        text_color=C["text_primary"] if active else C["text_muted"])

    def _build_juri_eval(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self._juri_sub_frames["eval"] = frame

        ctk.CTkLabel(frame, text="Marca las situaciones observadas:",
                     font=F["small"], text_color=C["text_muted"]
                     ).pack(anchor="w", padx=14, pady=(8, 4))

        # Checkbox list
        scrl = ctk.CTkScrollableFrame(frame, fg_color="transparent",
                                      label_text="", height=230)
        scrl.pack(fill="x", padx=10)

        self._juri_vars: list[tuple[ctk.BooleanVar, dict]] = []
        sr_items = [s for s in SITUACIONES if s["tipo"] == "sospecha_razonable"]
        cp_items = [s for s in SITUACIONES if s["tipo"] == "causa_probable"]

        # SR section header
        sh = ctk.CTkFrame(scrl, fg_color=C["sr_bg"], corner_radius=6,
                          border_width=1, border_color="#303820")
        sh.pack(fill="x", pady=(2, 3), padx=2)
        ctk.CTkLabel(sh, text="🟡  SOSPECHA RAZONABLE — detener e identificar",
                     font=F["small_b"], text_color=C["sr_text"], anchor="w"
                     ).pack(fill="x", padx=10, pady=5)

        for sit in sr_items:
            var = ctk.BooleanVar(value=False)
            cb  = ctk.CTkCheckBox(scrl, text=sit["label"], font=F["small"],
                                  text_color=C["sr_text"],
                                  fg_color="#7a7a10", hover_color="#6a6a20",
                                  border_color=C["border_bright"],
                                  variable=var)
            cb.pack(anchor="w", padx=18, pady=2)
            self._juri_vars.append((var, sit))

        ctk.CTkFrame(scrl, height=1, fg_color=C["border"]
                     ).pack(fill="x", pady=6, padx=4)

        # CP section header
        ch = ctk.CTkFrame(scrl, fg_color=C["cp_bg"], corner_radius=6,
                          border_width=1, border_color="#3a1818")
        ch.pack(fill="x", pady=(0, 3), padx=2)
        ctk.CTkLabel(ch, text="🔴  CAUSA PROBABLE — para arrestar",
                     font=F["small_b"], text_color=C["cp_text"], anchor="w"
                     ).pack(fill="x", padx=10, pady=5)

        for sit in cp_items:
            var = ctk.BooleanVar(value=False)
            cb  = ctk.CTkCheckBox(scrl, text=sit["label"], font=F["small"],
                                  text_color=C["cp_text"],
                                  fg_color="#8a1a1a", hover_color="#7a1010",
                                  border_color=C["border_bright"],
                                  variable=var)
            cb.pack(anchor="w", padx=18, pady=2)
            self._juri_vars.append((var, sit))

        # Buttons
        hsep(frame, padx=12, pady=(4, 0))
        brow = ctk.CTkFrame(frame, fg_color="transparent")
        brow.pack(fill="x", padx=12, pady=6)

        ctk.CTkButton(brow, text="⚖  Evaluar situación", height=32,
                      fg_color="#2a1a4a", hover_color="#3a2a6a",
                      text_color="#bb88ff", font=F["body_b"],
                      corner_radius=6, border_width=1, border_color="#3a2a6a",
                      command=self._evaluate_juridico
                      ).pack(side="left", fill="x", expand=True, padx=(0, 6))

        ctk.CTkButton(brow, text="Limpiar", height=32, width=80,
                      fg_color=C["bg_elevated"], hover_color=C["bg_hover"],
                      text_color=C["text_secondary"], font=F["small"],
                      corner_radius=6, border_width=1, border_color=C["border"],
                      command=self._clear_juri_checks
                      ).pack(side="right")

        # Result
        ctk.CTkLabel(frame, text="Resultado:", font=F["small_b"],
                     text_color=C["text_muted"], anchor="w"
                     ).pack(fill="x", padx=14, pady=(2, 2))

        self.juri_result_box = ctk.CTkTextbox(
            frame, font=F["mono"], fg_color=C["bg_input"],
            text_color=C["text_secondary"], border_width=1,
            border_color=C["border"], corner_radius=8, state="disabled"
        )
        self.juri_result_box.pack(fill="both", expand=True, padx=12, pady=(0, 4))

        ctk.CTkButton(frame, text="📋 Copiar evaluación", height=26,
                      fg_color=C["accent_muted"], hover_color=C["accent_dim"],
                      text_color=C["accent"], font=F["small"],
                      corner_radius=6,
                      command=self._copy_juri_result
                      ).pack(anchor="e", padx=12, pady=(0, 8))

    def _build_juri_casos(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self._juri_sub_frames["casos"] = frame

        # Search
        self._caso_filter = ctk.CTkEntry(
            frame, placeholder_text="Buscar caso o categoría...",
            font=F["body"], fg_color=C["bg_input"],
            border_color=C["border"], text_color=C["text_primary"],
            height=32
        )
        self._caso_filter.pack(fill="x", padx=12, pady=(10, 6))
        self._caso_filter.bind("<KeyRelease>", self._filter_casos)

        pane = ctk.CTkFrame(frame, fg_color="transparent")
        pane.pack(fill="both", expand=True, padx=10, pady=(0, 10))

        # List panel
        self._casos_list_frame = ctk.CTkScrollableFrame(
            pane, fg_color=C["bg_card"], width=220, label_text="",
            border_width=1, border_color=C["border"], corner_radius=8
        )
        self._casos_list_frame.pack(side="left", fill="y", padx=(0, 6))

        # Detail panel
        detail = ctk.CTkFrame(pane, fg_color=C["bg_input"], corner_radius=8,
                              border_width=1, border_color=C["border"])
        detail.pack(side="left", fill="both", expand=True)

        self._caso_detalle = ctk.CTkTextbox(
            detail, font=("Segoe UI", 11), fg_color=C["bg_input"],
            text_color=C["text_secondary"], state="disabled",
            wrap="word", border_width=0
        )
        self._caso_detalle.pack(fill="both", expand=True, padx=6, pady=6)

        self._caso_btns: list[ctk.CTkButton] = []
        self._render_casos_list(CASOS)

    # ── Casos helpers ─────────────────────────────────────────────────────────
    def _render_casos_list(self, casos):
        for w in self._casos_list_frame.winfo_children(): w.destroy()
        self._caso_btns.clear()
        for caso in casos:
            btn = ctk.CTkButton(
                self._casos_list_frame, text=caso["nombre"],
                font=F["small"], fg_color="transparent",
                hover_color=C["bg_hover"], text_color=C["accent"],
                anchor="w", height=36, corner_radius=4,
                command=lambda c=caso: self._show_caso_detalle(c)
            )
            btn.pack(fill="x", pady=1, padx=2)
            self._caso_btns.append(btn)

    def _filter_casos(self, event=None):
        q = self._caso_filter.get().lower()
        filtered = [c for c in CASOS
                    if q in c["nombre"].lower() or q in c["categoria"].lower()
                    or q in c["resumen"].lower()] if q else CASOS
        self._render_casos_list(filtered)

    def _show_caso_detalle(self, caso):
        lines = [
            f"{caso['nombre']}",
            f"Categoría: {caso['categoria']}",
            "",
            "DOCTRINA:",
            caso["resumen"],
        ]
        if caso.get("nota"):
            lines += ["", f"⚠ NOTA OPERATIVA:", caso["nota"]]
        self._caso_detalle.configure(state="normal")
        self._caso_detalle.delete("1.0", "end")
        self._caso_detalle.insert("1.0", "\n".join(lines))
        self._caso_detalle.configure(state="disabled")

    # ── Jurídico — Evaluación ─────────────────────────────────────────────────
    def _clear_juri_checks(self):
        for var, _ in self._juri_vars: var.set(False)
        self._set_juri_result("Sin situaciones marcadas.")

    def _evaluate_juridico(self):
        sr = [(v, s) for v, s in self._juri_vars if v.get() and s["tipo"] == "sospecha_razonable"]
        cp = [(v, s) for v, s in self._juri_vars if v.get() and s["tipo"] == "causa_probable"]

        if not sr and not cp:
            self._set_juri_result(
                "⚠  Ninguna situación marcada.\n\n"
                "Marca las situaciones observadas para evaluar si tienes\n"
                "sospecha razonable o causa probable."
            ); return

        L = []
        if cp:
            L += ["🔴  CAUSA PROBABLE ESTABLECIDA",
                  "    → Fundamento legal para ARRESTAR al sujeto.", ""]
        elif sr:
            L += ["🟡  SOSPECHA RAZONABLE",
                  "    → Puedes DETENER e IDENTIFICAR al sujeto.",
                  "    → Sin CP suficiente para arresto formal todavía.", ""]

        L.append("─" * 60)

        if sr:
            L += ["", "▸ SOSPECHA RAZONABLE — situaciones marcadas:"]
            for _, s in sr:
                L += [f"\n  ✔ {s['label']}",
                      f"    ⚖ {s['jurisprudencia']}",
                      f"    {s['detalle']}",
                      f"    → {s['accion']}"]

        if cp:
            L += ["", "▸ CAUSA PROBABLE — situaciones marcadas:"]
            for _, s in cp:
                L += [f"\n  ✔ {s['label']}",
                      f"    ⚖ {s['jurisprudencia']}",
                      f"    {s['detalle']}",
                      f"    → {s['accion']}"]

        L += ["", "─" * 60,
              "Adjuntar fotografías de toda causa probable.",
              "Consultar pestaña 'Jurisprudencia' para la doctrina completa."]
        self._set_juri_result("\n".join(L))

    def _set_juri_result(self, text: str):
        self.juri_result_box.configure(state="normal")
        self.juri_result_box.delete("1.0", "end")
        self.juri_result_box.insert("1.0", text)
        self.juri_result_box.configure(state="disabled")

    def _copy_juri_result(self):
        text = self.juri_result_box.get("1.0", "end").strip()
        if text:
            self.clipboard_clear(); self.clipboard_append(text)

    # ── Charge logic ──────────────────────────────────────────────────────────
    def _toggle_charge(self, charge, added):
        if added: self.selected[charge["id"]] = charge
        else:      self.selected.pop(charge["id"], None)
        self._refresh_right()

    def _push_history(self):
        """Guarda el estado actual antes de un cambio (máx. 20 pasos)."""
        self._history.append((dict(self.selected), set(self._complice)))
        if len(self._history) > 20:
            self._history.pop(0)
        self._undo_btn.configure(state="normal", text_color=C["text_secondary"])

    def _undo(self):
        if not self._history:
            return
        self.selected, self._complice = self._history.pop()
        if not self._history:
            self._undo_btn.configure(state="disabled", text_color=C["text_muted"])
        # Sync checkbox states with restored selected
        for var, row, cb, action in self._action_vars:
            all_in = all(cid in self.selected for cid in action["charges"])
            var.set(all_in)
            row.configure(fg_color=C["accent_muted"] if all_in else "transparent")
        self._update_action_counter()
        self._refresh_right()

    def _toggle_global_complice(self):
        """Marca / desmarca todos los cargos actuales como cómplice de golpe."""
        self._push_history()
        self._global_complice_on = not self._global_complice_on
        if self._global_complice_on:
            self._complice = set(self.selected.keys())
            self._global_complice_btn.configure(
                fg_color="#2a0a4a", text_color="#c084fc",
                border_color="#7a30b0")
        else:
            self._complice.clear()
            self._global_complice_btn.configure(
                fg_color=C["bg_card"], text_color=C["text_muted"],
                border_color=C["border"])
        self._refresh_right()

    def _apply_personal_vehicle(self, charge_id: str):
        """
        Aplica los cargos pertinentes cuando el robo de vehículo fue un 10-99B/C
        (robo personal/dedicado, no incidental a otro aviso).
        Según FAQ:
          - Evasión imprudente (c007): el conductor huyó con el vehículo robado
          - Fraude en registro Menor (c012): suele usarse matrícula falsa
          - Si es 1° grado (c014): también Fraude Mayor (c013) por VIN borrado / piezas scratch
        """
        lookup = {c["id"]: c for c in CHARGES}
        to_add = ["c007", "c012"]
        if charge_id == "c014":          # 1° grado → intención permanente → VIN borrado probable
            to_add.append("c013")
        added = []
        for cid in to_add:
            if cid not in self.selected and cid in lookup:
                self.selected[cid] = lookup[cid]
                added.append(lookup[cid]["name"])
        self._refresh_right()
        # Feedback visual breve en el summary box
        if added:
            self.summary_box.configure(state="normal")
            self.summary_box.insert("end", f"\n✅ 10-99 añadido: {', '.join(added)}")
            self.summary_box.configure(state="disabled")
            self.after(2000, self._refresh_summary)

    def _toggle_complice(self, charge_id: str):
        if charge_id in self._complice:
            self._complice.discard(charge_id)
        else:
            self._complice.add(charge_id)
            # Auto-eliminar cargos incompatibles con ser cómplice (FAQ)
            to_remove = COMPLICE_REMOVE_RULES.get(charge_id, set())
            for rid in to_remove:
                if rid in self.selected:
                    self.selected.pop(rid)
                    self._complice.discard(rid)
            # Heredar cómplice en cargos relacionados (ej: evasión pasa a cómplice)
            to_inherit = COMPLICE_INHERIT_RULES.get(charge_id, set())
            for rid in to_inherit:
                if rid in self.selected:
                    self._complice.add(rid)
        self._refresh_right()

    def _remove_charge(self, charge):
        self._push_history()
        self.selected.pop(charge["id"], None)
        self._complice.discard(charge["id"])
        self._refresh_right()
        for card in self.cat_results.cards:
            if card.charge["id"] == charge["id"]:
                card.selected = False
                if hasattr(card, "btn"):
                    card.btn.configure(text="+ Añadir",
                                       fg_color=C["accent_muted"],
                                       hover_color=C["accent_dim"],
                                       text_color=C["accent"])

    def _update_action_counter(self):
        n = sum(1 for var, row, cb, action in self._action_vars if var.get())
        if n:
            self._action_checked_lbl.configure(text=f"{n} marcada{'s' if n != 1 else ''}")
            self._action_checked_lbl.pack(side="left", padx=6)
        else:
            self._action_checked_lbl.pack_forget()

    def _apply_actions(self):
        for var, row, cb, action in self._action_vars:
            if var.get():
                for ch in get_charges_by_ids(action["charges"]):
                    self.selected[ch["id"]] = ch
                    # Auto-mark as cómplice for actions that imply it (FAQ)
                    if action.get("complice"):
                        self._complice.add(ch["id"])
        self._refresh_right()

    def _clear_action_checks(self):
        for var, row, cb, action in self._action_vars:
            var.set(False)
            row.configure(fg_color="transparent")
        self._update_action_counter()

    def _filter_actions(self, event=None):
        q = self.action_filter.get().lower()
        for g_hdr, rows in self._action_group_headers:
            any_visible = False
            for row in rows:
                # find matching action via cb text
                match = any(
                    q in action["label"].lower()
                    for var, r, cb, action in self._action_vars
                    if r is row
                )
                if match or not q:
                    row.pack(fill="x", pady=1, padx=2)
                    any_visible = True
                else:
                    row.pack_forget()
            if any_visible or not q:
                g_hdr.pack(fill="x", pady=(8, 2), padx=4)
            else:
                g_hdr.pack_forget()

    def _show_category(self, cat_id):
        charges = [c for c in CHARGES if c["category"] == cat_id]
        self.cat_results.show_charges(charges, on_toggle=self._toggle_charge,
                                      selected_ids=set(self.selected))

    def _clear_all(self):
        self._push_history()
        self.selected.clear()
        self._complice.clear()
        self._global_complice_on = False
        self._global_complice_btn.configure(
            fg_color=C["bg_card"], text_color=C["text_muted"], border_color=C["border"])
        for var, row, cb, action in self._action_vars:
            var.set(False)
            row.configure(fg_color="transparent")
        self._update_action_counter()
        self._refresh_right()

    def _copy_summary(self):
        sid = self._state_id_entry.get().strip()
        text = SelectedPanel.build_summary(list(self.selected.values()), self._complice, sid)
        self.clipboard_clear(); self.clipboard_append(text)
        self.summary_box.configure(state="normal")
        self.summary_box.insert("end", "\n✅ Copiado!")
        self.summary_box.configure(state="disabled")
        self.after(1500, self._refresh_summary)

    def _refresh_right(self):
        # Sort by severity descending (graves arriba)
        charges = sorted(
            self.selected.values(),
            key=lambda c: SEV_ORDER.get(c["severity"], 0),
            reverse=True,
        )
        self.selected_panel.refresh(charges, self._complice)
        self.count_lbl.configure(text=str(len(charges)))

        total_fine = sum(c.get("fine", 0) for c in charges)
        total_jail = max((c.get("jail_minutes", 0) for c in charges), default=0)
        self.total_fine_lbl.configure(text=f"${total_fine:,.0f}")
        self.total_jail_lbl.configure(
            text=f"🔒 {total_jail} min" if total_jail else ""
        )

        # ── Warnings ──────────────────────────────────────────────────────────
        sel_ids = set(self.selected.keys())
        warnings = get_active_warnings(sel_ids)
        self._update_warnings(warnings)

        self._refresh_summary()

    def _update_warnings(self, warnings: list[str]):
        """Muestra u oculta el panel de incompatibilidades."""
        # Clear previous labels
        for lbl in self._warn_labels:
            lbl.destroy()
        self._warn_labels.clear()

        if not warnings:
            self._warn_outer.pack_forget()
            return

        for i, msg in enumerate(warnings):
            lbl = ctk.CTkLabel(
                self._warn_body,
                text=f"• {msg}",
                font=F["small"],
                text_color="#ffcc66",
                anchor="w",
                wraplength=340,
                justify="left",
            )
            lbl.pack(anchor="w", pady=(2, 0))
            self._warn_labels.append(lbl)

        # Place warn_outer before totals box if not already shown
        if not self._warn_outer.winfo_ismapped():
            self._warn_outer.pack(fill="x", padx=12, pady=(4, 2),
                                  before=self._totals_frame)

    def _refresh_summary(self):
        sid = self._state_id_entry.get().strip() if hasattr(self, "_state_id_entry") else ""
        text = SelectedPanel.build_summary(list(self.selected.values()), self._complice, sid)
        self.summary_box.configure(state="normal")
        self.summary_box.delete("1.0", "end")
        self.summary_box.insert("1.0", text)
        self.summary_box.configure(state="disabled")


# ── Entry ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = SAPDApp()
    app.mainloop()
