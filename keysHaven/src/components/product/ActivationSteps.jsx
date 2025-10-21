import React from "react";


const DEFAULT_ICONS = [
  { id: "pc", iconClass: "fab fa-windows", key: "steam", platform: "Steam", subtitle: "Activar en PC", steps: [
    "Abre la aplicación de Steam en tu PC e inicia sesión.",
    "En la esquina inferior izquierda haz clic en 'Agregar un juego' → 'Activar un producto en Steam'.",
    "Sigue las instrucciones y pega la clave cuando se te pida. La descarga comenzará automáticamente."
  ]},
  { id: "ps", iconClass: "fab fa-playstation", key: "ps", platform: "PlayStation", subtitle: "PS4 / PS5", steps: [
    "En tu consola PlayStation, abre PlayStation Store e inicia sesión.",
    "Selecciona 'Canjear códigos' en el menú.",
    "Introduce la clave y confirma. El contenido se añadirá a tu biblioteca."
  ]},
  { id: "xbox", iconClass: "fab fa-xbox", key: "xbox", platform: "Xbox", subtitle: "Xbox One / Series", steps: [
    "En tu Xbox ve a Microsoft Store e inicia sesión con tu cuenta.",
    "Selecciona 'Canjear código' (Use code) e ingresa la clave.",
    "Confirma y la compra se añadirá a tu cuenta o lista de descargas."
  ]},
  { id: "switch", iconClass: "fas fa-gamepad", key: "switch", platform: "Nintendo Switch", subtitle: "Switch eShop", steps: [
    "En tu Nintendo Switch entra a Nintendo eShop con tu usuario.",
    "Selecciona 'Canjear código' y escribe la clave en pantalla.",
    "La descarga se añadirá a tu cuenta o aparecerá en 'Descargas'."
  ]},
];

export default function ActivationSteps({ iconsList = DEFAULT_ICONS }) {
  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title text-primary">¿Cómo activar?</h5>

        <div className="row g-3 mt-2">
          {iconsList.map((it) => (
            <div key={it.key} className="col-12 col-md-6 d-flex">
              <div className="activation-card p-3 d-flex" style={{ flex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))",
                  color: "var(--accent)", fontSize: 20, flex: "0 0 56px"
                }}>
                  <i className={it.iconClass} aria-hidden style={{ fontSize: 22 }} />
                </div>

                <div className="activation-content" style={{ marginLeft: 12, display: "flex", flexDirection: "column", flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text)" }}>{it.platform}</div>
                      {it.subtitle && <div style={{ color: "var(--muted)", fontSize: 13 }}>{it.subtitle}</div>}
                    </div>
                  </div>

                  <div className="activation-steps" style={{ marginTop: 8, flex: 1, minHeight: 1 }}>
                    <ol className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                      {it.steps.map((s, i) => (
                        <li key={i} style={{ marginBottom: 6 }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
