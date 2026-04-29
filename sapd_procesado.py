import customtkinter as ctk
import json
import os
import sys
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

if getattr(sys, "frozen", False):
    EXE_DIR = Path(sys.executable).parent
    INTERNAL = Path(sys._MEIPASS)
    # JSON externo junto al exe tiene prioridad → fácil de actualizar sin recompilar
    DB_PATH = EXE_DIR / "charges_db.json" if (EXE_DIR / "charges_db.json").exists() else INTERNAL / "charges_db.json"
else:
    EXE_DIR = Path(__file__).parent
    DB_PATH = EXE_DIR / "charges_db.json"

SEVERITY_COLOR = {
    "Infracción":   "#5b8dd9",
    "Delito leve C": "#a0c878",
    "Delito leve B": "#d4c264",
    "Delito leve A": "#e89040",
    "Delito grave D": "#e05050",
    "Delito grave C": "#c03030",
    "Delito grave B": "#a01010",
    "Delito grave A": "#800000",
}

# ── Data ────────────────────────────────────────────────────────────────────
def load_db():
    with open(DB_PATH, encoding="utf-8") as f:
        return json.load(f)

def reload_db():
    global DB, CHARGES, ACTIONS, CATEGORIES
    DB = load_db()
    CHARGES = DB["charges"]
    ACTIONS = DB["actions"]
    CATEGORIES = DB["categories"]

DB = load_db()
CHARGES = DB["charges"]
ACTIONS = DB["actions"]
CATEGORIES = DB["categories"]

def search_charges(query: str) -> list[dict]:
    if not query.strip():
        return []
    q = query.lower()
    results = []
    seen = set()
    for charge in CHARGES:
        if charge["id"] in seen:
            continue
        score = 0
        name_lower = charge["name"].lower()
        desc_lower = charge["description"].lower()
        if q in name_lower:
            score += 10
        for kw in charge["keywords"]:
            if kw in q or q in kw:
                score += 5
        words = q.split()
        for w in words:
            if len(w) > 3:
                if w in name_lower:
                    score += 3
                if w in desc_lower:
                    score += 1
                for kw in charge["keywords"]:
                    if w in kw:
                        score += 2
        if score > 0:
            results.append((score, charge))
            seen.add(charge["id"])
    results.sort(key=lambda x: -x[0])
    return [c for _, c in results]

def get_charges_by_ids(ids: list[str]) -> list[dict]:
    lookup = {c["id"]: c for c in CHARGES}
    seen = set()
    out = []
    for cid in ids:
        if cid in lookup and cid not in seen:
            out.append(lookup[cid])
            seen.add(cid)
    return out

# ── Widgets ─────────────────────────────────────────────────────────────────
class ChargeCard(ctk.CTkFrame):
    def __init__(self, master, charge: dict, on_toggle=None, selected=False, **kw):
        super().__init__(master, corner_radius=8, fg_color="#2a2a3a", **kw)
        self.charge = charge
        self.selected = selected
        self.on_toggle = on_toggle
        self._build()

    def _build(self):
        sev = self.charge["severity"]
        color = SEVERITY_COLOR.get(sev, "#888888")

        # Header row
        hdr = ctk.CTkFrame(self, fg_color="transparent")
        hdr.pack(fill="x", padx=10, pady=(8, 2))

        sev_badge = ctk.CTkLabel(
            hdr, text=sev, fg_color=color, text_color="white",
            corner_radius=5, font=("Segoe UI", 11, "bold"),
            padx=6, pady=2
        )
        sev_badge.pack(side="left")

        if self.charge.get("fine"):
            fine_lbl = ctk.CTkLabel(
                hdr, text=f"${self.charge['fine']:,.0f}",
                text_color="#aaffaa", font=("Segoe UI", 11, "bold")
            )
            fine_lbl.pack(side="right")

        # Name
        name_lbl = ctk.CTkLabel(
            self, text=self.charge["name"],
            font=("Segoe UI", 13, "bold"), text_color="white",
            anchor="w", wraplength=480
        )
        name_lbl.pack(fill="x", padx=10, pady=(2, 0))

        # Description
        desc_lbl = ctk.CTkLabel(
            self, text=self.charge["description"],
            font=("Segoe UI", 11), text_color="#bbbbbb",
            anchor="w", wraplength=480
        )
        desc_lbl.pack(fill="x", padx=10, pady=(0, 4))

        # Stats row
        stats = ctk.CTkFrame(self, fg_color="transparent")
        stats.pack(fill="x", padx=10, pady=(0, 8))

        if self.charge.get("jail_minutes") and self.charge["jail_minutes"] > 0:
            jail_lbl = ctk.CTkLabel(
                stats, text=f"🔒 {self.charge['jail_minutes']} min",
                font=("Segoe UI", 11), text_color="#ff9999"
            )
            jail_lbl.pack(side="left", padx=(0, 10))

        if self.charge.get("points") and self.charge["points"] > 0:
            pts_lbl = ctk.CTkLabel(
                stats, text=f"📍 {self.charge['points']} pts",
                font=("Segoe UI", 11), text_color="#ffcc88"
            )
            pts_lbl.pack(side="left")

        # Toggle button
        if self.on_toggle:
            btn_text = "✓ Añadido" if self.selected else "+ Añadir"
            btn_color = "#1a6b1a" if self.selected else "#1a3a6b"
            self.btn = ctk.CTkButton(
                stats, text=btn_text, width=90, height=26,
                fg_color=btn_color, hover_color="#2a5a2a" if self.selected else "#2a4a8b",
                font=("Segoe UI", 11), command=self._toggle
            )
            self.btn.pack(side="right")

    def _toggle(self):
        self.selected = not self.selected
        if self.on_toggle:
            self.on_toggle(self.charge, self.selected)
        if self.selected:
            self.btn.configure(text="✓ Añadido", fg_color="#1a6b1a", hover_color="#2a5a2a")
        else:
            self.btn.configure(text="+ Añadir", fg_color="#1a3a6b", hover_color="#2a4a8b")


class ScrollableChargeList(ctk.CTkScrollableFrame):
    def __init__(self, master, **kw):
        super().__init__(master, **kw)
        self.cards = []

    def clear(self):
        for w in self.winfo_children():
            w.destroy()
        self.cards = []

    def show_charges(self, charges: list[dict], on_toggle=None, selected_ids=None):
        self.clear()
        selected_ids = selected_ids or set()
        if not charges:
            ctk.CTkLabel(
                self, text="No se encontraron cargos.",
                text_color="#888888", font=("Segoe UI", 12)
            ).pack(pady=20)
            return
        for ch in charges:
            card = ChargeCard(
                self, ch,
                on_toggle=on_toggle,
                selected=ch["id"] in selected_ids
            )
            card.pack(fill="x", pady=4, padx=2)
            self.cards.append(card)


class SelectedPanel(ctk.CTkScrollableFrame):
    def __init__(self, master, on_remove, **kw):
        super().__init__(master, **kw)
        self.on_remove = on_remove
        self.rows = {}

    def refresh(self, selected_charges: list[dict]):
        for w in self.winfo_children():
            w.destroy()
        self.rows = {}
        if not selected_charges:
            ctk.CTkLabel(
                self, text="Ningún cargo añadido.",
                text_color="#666666", font=("Segoe UI", 11)
            ).pack(pady=10)
            return
        for ch in selected_charges:
            row = ctk.CTkFrame(self, fg_color="#232330", corner_radius=6)
            row.pack(fill="x", pady=2, padx=2)
            sev = ch["severity"]
            color = SEVERITY_COLOR.get(sev, "#888")
            ctk.CTkLabel(
                row, text=sev, fg_color=color, text_color="white",
                corner_radius=4, font=("Segoe UI", 10, "bold"), padx=5, pady=1
            ).pack(side="left", padx=(6, 4), pady=4)
            ctk.CTkLabel(
                row, text=ch["name"], font=("Segoe UI", 11),
                text_color="white", anchor="w"
            ).pack(side="left", fill="x", expand=True, pady=4)
            if ch.get("fine"):
                ctk.CTkLabel(
                    row, text=f"${ch['fine']:,.0f}",
                    font=("Segoe UI", 10), text_color="#aaffaa"
                ).pack(side="left", padx=6)
            ctk.CTkButton(
                row, text="✕", width=26, height=26,
                fg_color="#6b1a1a", hover_color="#9b2a2a",
                font=("Segoe UI", 11, "bold"),
                command=lambda c=ch: self.on_remove(c)
            ).pack(side="right", padx=4, pady=4)

    def get_summary(self, charges: list[dict]) -> str:
        if not charges:
            return "Sin cargos seleccionados."
        lines = ["═══ RESUMEN DE CARGOS ═══\n"]
        total_fine = 0
        total_jail = 0
        for ch in charges:
            line = f"• {ch['name']} [{ch['severity']}]"
            if ch.get("fine"):
                line += f" — ${ch['fine']:,.0f}"
                total_fine += ch["fine"]
            if ch.get("jail_minutes") and ch["jail_minutes"] > 0:
                line += f" — 🔒 {ch['jail_minutes']} min"
                total_jail = max(total_jail, ch["jail_minutes"])
            lines.append(line)
        lines.append(f"\n💰 Total multas: ${total_fine:,.0f}")
        if total_jail > 0:
            lines.append(f"🔒 Tiempo prisión (mayor): {total_jail} min")
        lines.append(f"\nTotal cargos: {len(charges)}")
        return "\n".join(lines)


# ── Main App ─────────────────────────────────────────────────────────────────
class SAPDApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("SAPD – Asistente de Procesado | ONX")
        self.geometry("1100x700")
        self.minsize(900, 600)
        self.selected: dict[str, dict] = {}  # id -> charge

        self._build_ui()
        self._update_db_label()

    def _update_db_label(self):
        ext = EXE_DIR / "charges_db.json"
        if ext.exists():
            self.db_source_lbl.configure(text=f"DB: externa ({len(CHARGES)} cargos)", text_color="#88cc88")
        else:
            self.db_source_lbl.configure(text=f"DB: interna ({len(CHARGES)} cargos)", text_color="#888888")

    def _reload_db(self):
        try:
            reload_db()
            # Reconstruir pestañas de acciones y categoría
            self._rebuild_dynamic_tabs()
            self.selected.clear()
            self._refresh_right()
            self._update_db_label()
            self.db_source_lbl.configure(text_color="#aaffaa")
            self.after(2000, self._update_db_label)
        except Exception as e:
            self.db_source_lbl.configure(text=f"Error: {e}", text_color="#ff6666")

    def _open_db_editor(self):
        import subprocess
        target = EXE_DIR / "charges_db.json"
        if not target.exists():
            # Exportar la DB interna para que el usuario la pueda editar
            import shutil
            src = INTERNAL / "charges_db.json" if getattr(sys, "frozen", False) else DB_PATH
            shutil.copy(src, target)
        subprocess.Popen(["notepad.exe", str(target)])
        self.db_source_lbl.configure(text="Abre notepad → guarda → pulsa Recargar", text_color="#ffcc66")

    def _rebuild_dynamic_tabs(self):
        content = self._content_frame
        for tid in list(self.tab_frames.keys()):
            self.tab_frames[tid].destroy()
            del self.tab_frames[tid]
        self._build_tab_acciones(content)
        self._build_tab_categoria(content)
        self._switch_tab("acciones")

    def _build_ui(self):
        # Top bar
        topbar = ctk.CTkFrame(self, height=52, fg_color="#12121e", corner_radius=0)
        topbar.pack(fill="x")
        topbar.pack_propagate(False)

        ctk.CTkLabel(
            topbar,
            text="🚔  SAPD — Asistente de Procesado",
            font=("Segoe UI", 16, "bold"), text_color="#5599ff"
        ).pack(side="left", padx=16, pady=12)

        self.db_source_lbl = ctk.CTkLabel(
            topbar, text="", font=("Segoe UI", 10), text_color="#555577"
        )
        self.db_source_lbl.pack(side="right", padx=(0, 8))

        ctk.CTkButton(
            topbar, text="⟳ Recargar", width=90, height=30,
            fg_color="#1a3a1a", hover_color="#2a5a2a",
            font=("Segoe UI", 11),
            command=self._reload_db
        ).pack(side="right", padx=(0, 4))

        ctk.CTkButton(
            topbar, text="✎ Editar DB", width=90, height=30,
            fg_color="#1a2a3a", hover_color="#2a3a5a",
            font=("Segoe UI", 11),
            command=self._open_db_editor
        ).pack(side="right", padx=(0, 4))

        # Main body: left (search) + right (selected)
        body = ctk.CTkFrame(self, fg_color="transparent")
        body.pack(fill="both", expand=True, padx=0, pady=0)

        # ── LEFT PANEL ───────────────────────────────────────────────────────
        left = ctk.CTkFrame(body, fg_color="#1a1a28", corner_radius=0, width=640)
        left.pack(side="left", fill="both", expand=True)

        # Tabs
        tab_bar = ctk.CTkFrame(left, fg_color="#141420", height=42, corner_radius=0)
        tab_bar.pack(fill="x")
        tab_bar.pack_propagate(False)

        self.tab_var = ctk.StringVar(value="acciones")
        self._tab_buttons: dict[str, ctk.CTkButton] = {}
        for tab_id, tab_label in [("acciones", "☑️ Acciones rápidas"), ("categoria", "📂 Por categoría")]:
            btn = ctk.CTkButton(
                tab_bar, text=tab_label, width=180, height=42,
                corner_radius=0,
                fg_color="#1e1e2e" if tab_id == "acciones" else "transparent",
                hover_color="#1e1e2e",
                font=("Segoe UI", 12),
                command=lambda t=tab_id: self._switch_tab(t)
            )
            btn.pack(side="left")
            self._tab_buttons[tab_id] = btn

        self.tab_frames: dict[str, ctk.CTkFrame] = {}

        # Content area under tabs
        content = ctk.CTkFrame(left, fg_color="#1a1a28", corner_radius=0)
        content.pack(fill="both", expand=True)
        self._content_frame = content

        self._build_tab_acciones(content)
        self._build_tab_categoria(content)

        self._switch_tab("acciones")

        # ── RIGHT PANEL ──────────────────────────────────────────────────────
        right = ctk.CTkFrame(body, fg_color="#121220", corner_radius=0, width=400)
        right.pack(side="right", fill="both")
        right.pack_propagate(False)

        ctk.CTkLabel(
            right, text="Cargos seleccionados",
            font=("Segoe UI", 13, "bold"), text_color="#aaaacc"
        ).pack(pady=(12, 4), padx=12, anchor="w")

        self.selected_panel = SelectedPanel(
            right, on_remove=self._remove_charge,
            fg_color="transparent", width=380
        )
        self.selected_panel.pack(fill="both", expand=True, padx=6)

        # Bottom buttons
        btns = ctk.CTkFrame(right, fg_color="transparent")
        btns.pack(fill="x", padx=10, pady=8)

        ctk.CTkButton(
            btns, text="🗑️ Limpiar todo", width=130, height=32,
            fg_color="#4a1a1a", hover_color="#7a2a2a",
            font=("Segoe UI", 11),
            command=self._clear_all
        ).pack(side="left")

        ctk.CTkButton(
            btns, text="📋 Copiar resumen", width=150, height=32,
            fg_color="#1a3a6b", hover_color="#2a5a9b",
            font=("Segoe UI", 11),
            command=self._copy_summary
        ).pack(side="right")

        # Summary area
        self.summary_box = ctk.CTkTextbox(
            right, height=160, font=("Consolas", 10),
            fg_color="#0d0d18", text_color="#cccccc", state="disabled"
        )
        self.summary_box.pack(fill="x", padx=10, pady=(0, 10))

    # ── Tabs ─────────────────────────────────────────────────────────────────
    def _build_tab_acciones(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self.tab_frames["acciones"] = frame

        ctk.CTkLabel(
            frame,
            text="Selecciona las acciones cometidas:",
            font=("Segoe UI", 12), text_color="#aaaacc"
        ).pack(anchor="w", padx=14, pady=(12, 4))

        # Filter at top
        self.action_filter = ctk.CTkEntry(
            frame, placeholder_text="Filtrar acciones...",
            font=("Segoe UI", 11), height=32
        )
        self.action_filter.pack(fill="x", padx=12, pady=(0, 4))

        scrl = ctk.CTkScrollableFrame(frame, fg_color="transparent", label_text="")
        scrl.pack(fill="both", expand=True, padx=8)

        self._action_vars: list[tuple[ctk.BooleanVar, ctk.CTkCheckBox, dict]] = []
        self._action_scroll = scrl

        for action in ACTIONS:
            var = ctk.BooleanVar(value=False)
            cb = ctk.CTkCheckBox(
                scrl, text=action["label"],
                font=("Segoe UI", 12), text_color="white",
                fg_color="#1a4a8a", hover_color="#2a6abb",
                variable=var
            )
            cb.pack(anchor="w", padx=8, pady=2)
            self._action_vars.append((var, cb, action))

        self.action_filter.bind("<KeyRelease>", self._filter_actions)

        btn_row = ctk.CTkFrame(frame, fg_color="transparent")
        btn_row.pack(fill="x", padx=12, pady=6)

        ctk.CTkButton(
            btn_row, text="✓ Aplicar seleccionadas", height=34,
            font=("Segoe UI", 12, "bold"),
            command=self._apply_actions
        ).pack(side="left", fill="x", expand=True, padx=(0, 4))

        ctk.CTkButton(
            btn_row, text="✕ Desmarcar todo", height=34, width=130,
            fg_color="#4a1a1a", hover_color="#7a2a2a",
            font=("Segoe UI", 11),
            command=self._clear_action_checks
        ).pack(side="right")

    def _build_tab_categoria(self, parent):
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        self.tab_frames["categoria"] = frame

        ctk.CTkLabel(
            frame,
            text="Selecciona categoría de delitos:",
            font=("Segoe UI", 12), text_color="#aaaacc"
        ).pack(anchor="w", padx=14, pady=(12, 6))

        cat_row = ctk.CTkFrame(frame, fg_color="transparent")
        cat_row.pack(fill="x", padx=12, pady=(0, 8))

        self.cat_var = ctk.StringVar(value="")
        for cat_id, cat_name in CATEGORIES.items():
            ctk.CTkButton(
                cat_row, text=cat_name, height=30,
                font=("Segoe UI", 10),
                fg_color="#1e2e4a", hover_color="#2e4a6a",
                command=lambda c=cat_id: self._show_category(c)
            ).pack(fill="x", pady=1)

        self.cat_results = ScrollableChargeList(
            frame, fg_color="transparent", label_text=""
        )
        self.cat_results.pack(fill="both", expand=True, padx=8)

    # ── Tab switching ─────────────────────────────────────────────────────────
    def _switch_tab(self, tab_id: str):
        self.tab_var.set(tab_id)
        for tid, frame in self.tab_frames.items():
            frame.pack_forget()
        self.tab_frames[tab_id].pack(fill="both", expand=True)
        for tid, btn in self._tab_buttons.items():
            btn.configure(fg_color="#1e1e2e" if tid == tab_id else "transparent")

    # ── Actions ──────────────────────────────────────────────────────────────
    def _toggle_charge(self, charge: dict, added: bool):
        if added:
            self.selected[charge["id"]] = charge
        else:
            self.selected.pop(charge["id"], None)
        self._refresh_right()

    def _remove_charge(self, charge: dict):
        self.selected.pop(charge["id"], None)
        self._refresh_right()
        for card in self.cat_results.cards:
            if card.charge["id"] == charge["id"]:
                card.selected = False
                if hasattr(card, "btn"):
                    card.btn.configure(text="+ Añadir", fg_color="#1a3a6b", hover_color="#2a4a8b")

    def _apply_actions(self):
        for var, cb, action in self._action_vars:
            if var.get():
                charges = get_charges_by_ids(action["charges"])
                for ch in charges:
                    self.selected[ch["id"]] = ch
        self._refresh_right()

    def _clear_action_checks(self):
        for var, cb, action in self._action_vars:
            var.set(False)

    def _filter_actions(self, event=None):
        q = self.action_filter.get().lower()
        for var, cb, action in self._action_vars:
            if q in action["label"].lower():
                cb.pack(anchor="w", padx=8, pady=2)
            else:
                cb.pack_forget()

    def _show_category(self, cat_id: str):
        charges = [c for c in CHARGES if c["category"] == cat_id]
        self.cat_results.show_charges(
            charges,
            on_toggle=self._toggle_charge,
            selected_ids=set(self.selected.keys())
        )

    def _clear_all(self):
        self.selected.clear()
        self._refresh_right()

    def _copy_summary(self):
        text = self.selected_panel.get_summary(list(self.selected.values()))
        self.clipboard_clear()
        self.clipboard_append(text)
        # Flash feedback
        orig = self.summary_box.cget("text_color")
        self.summary_box.configure(state="normal")
        self.summary_box.insert("end", "\n✅ Copiado al portapapeles!")
        self.summary_box.configure(state="disabled")
        self.after(1500, lambda: self._refresh_summary())

    def _refresh_right(self):
        charges = list(self.selected.values())
        self.selected_panel.refresh(charges)
        self._refresh_summary()

    def _refresh_summary(self):
        charges = list(self.selected.values())
        text = self.selected_panel.get_summary(charges)
        self.summary_box.configure(state="normal")
        self.summary_box.delete("1.0", "end")
        self.summary_box.insert("1.0", text)
        self.summary_box.configure(state="disabled")


# ── Entry ────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app = SAPDApp()
    app.mainloop()
