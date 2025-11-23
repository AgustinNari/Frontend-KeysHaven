import React, { useMemo } from "react";

const PLATFORM_MAP = [
  {
    match: ["STEAM"],
    key: "pc-steam",
    iconClass: "fab fa-steam",
    title: "PC — Steam",
    subtitle: "Activación en Steam",
    steps: [
      "Abre la aplicación Steam en tu PC e inicia sesión en tu cuenta.",
      "En la esquina inferior izquierda haz clic en 'Añadir un juego' → 'Activar un producto en Steam'.",
      "Copia y pega la clave que recibiste cuando se te solicite y confirma.",
      "Una vez activada, el juego aparecerá en tu biblioteca y podrás descargarlo."
    ],
    note: "Si la clave no funciona, verifica la región y asegúrate de que la cuenta coincide con la región requerida."
  },
  {
    match: ["EPIC", "EPIC GAMES", "EPIC GAMES STORE"],
    key: "pc-epic",
    iconClass: "fab fa-epic-games",
    title: "PC — Epic Games Store",
    subtitle: "Activación en Epic Games",
    steps: [
      "Abre el lanzador de Epic Games e inicia sesión con tu cuenta.",
      "Haz clic en tu nombre de usuario → 'Canjear clave' (o usa la opción en la tienda).",
      "Introduce la clave y confirma. El producto aparecerá en tu biblioteca de Epic.",
      "Desde la biblioteca puedes instalar el juego."
    ],
    note: "Algunas claves para Epic son globales; otras pueden tener restricciones regionales."
  },
  {
    match: ["GOG"],
    key: "pc-gog",
    iconClass: "fab fa-gg",
    title: "PC — GOG.com",
    subtitle: "Activación en GOG",
    steps: [
      "Entra a tu cuenta en GOG.com (o abre GOG Galaxy) e inicia sesión.",
      "Ve a tu perfil → 'Redeem code' o en GOG Galaxy 'Add game by code'.",
      "Introduce la clave y confirma para añadir el juego a tu cuenta.",
      "Podrás descargar el instalador desde tu biblioteca."
    ],
    note: "GOG ofrece versiones DRM-free en la mayoría de los casos."
  },
  {
    match: ["ORIGIN", "EA APP", "EA APP"],
    key: "pc-origin-ea",
    iconClass: "fab fa-autoprefixer",
    title: "PC — Origin / EA App",
    subtitle: "Activación en Origin / EA App",
    steps: [
      "Abre la EA App (o Origin, según corresponda) e inicia sesión.",
      "En la aplicación ve al menú y selecciona 'Canjear código' o 'Redeem product code'.",
      "Introduce la clave y acepta. El juego se añadirá a tu biblioteca de EA.",
      "Desde la biblioteca podrás descargarlo e instalarlo."
    ],
    note: "Algunas claves de EA pueden estar asociadas a promociones o bundles, revisa los detalles."
  },
  {
    match: ["UBISOFT", "UBISOFT CONNECT"],
    key: "pc-ubisoft",
    iconClass: "fas fa-shield-alt",
    title: "PC — Ubisoft Connect",
    subtitle: "Activación en Ubisoft Connect",
    steps: [
      "Abre Ubisoft Connect en PC e inicia sesión con tu cuenta Ubisoft.",
      "Ve a 'Activar código' o 'Redeem code' desde el menú principal.",
      "Introduce la clave y confirma para añadir el juego a tu cuenta.",
      "El juego aparecerá en tu biblioteca y podrás descargarlo desde ahí."
    ],
    note: "Si tienes problemas, revisa que la clave sea para la plataforma PC y no para consolas."
  },
  {
    match: ["BATTLE.NET", "BATTLE.NET", "BLIZZARD"],
    key: "pc-battlenet",
    iconClass: "fab fa-blizzard",
    title: "PC — Battle.net",
    subtitle: "Activación en Battle.net",
    steps: [
      "Abre la aplicación Battle.net e inicia sesión con tu Blizzard/Activision ID.",
      "Haz clic en tu nombre en la esquina superior derecha → 'Canjear código'.",
      "Introduce la clave y confirma. El juego se añadirá a tu cuenta de Battle.net.",
      "Desde la app podrás instalar o gestionar el juego."
    ],
    note: "Battle.net exige que la clave sea compatible con la región de tu cuenta."
  },
  {
    match: ["MICROSOFT STORE", "MICROSOFT", "WINDOWS STORE"],
    key: "pc-msstore",
    iconClass: "fab fa-windows",
    title: "PC — Microsoft Store / Xbox (PC)",
    subtitle: "Activación en Microsoft Store",
    steps: [
      "Abre Microsoft Store e inicia sesión con tu cuenta Microsoft.",
      "En el menú selecciona 'Canjear código' (o visita account.microsoft.com/redeem).",
      "Introduce la clave y sigue las instrucciones; el título se añadirá a tu cuenta.",
      "Descarga el juego desde Microsoft Store o desde tu librería de Xbox para PC."
    ],
    note: "Algunos títulos usan la infraestructura Xbox (Game Pass / Xbox App)."
  },
  {
    match: ["PLAYSTATION", "PS4", "PS5"],
    key: "ps",
    iconClass: "fab fa-playstation",
    title: "PlayStation (PS4 / PS5)",
    subtitle: "Canjear en la PlayStation Store",
    steps: [
      "En tu consola PlayStation abre PlayStation Store e inicia sesión con tu PSN.",
      "Navega a 'Canjear códigos' (Redeem Codes) desde el menú.",
      "Introduce la clave y acepta. El contenido se añadirá a tu biblioteca.",
      "Descarga o inicia el juego desde 'Biblioteca' en tu consola."
    ],
    note: "Si la clave es de otra región, tu cuenta debe ser de la región correspondiente."
  },
  {
    match: ["XBOX", "XBOX ONE", "XBOX SERIES"],
    key: "xbox",
    iconClass: "fab fa-xbox",
    title: "Xbox (One / Series X|S)",
    subtitle: "Canjear en Microsoft / Xbox",
    steps: [
      "En la consola Xbox, ve a Microsoft Store e inicia sesión con tu cuenta Microsoft.",
      "Selecciona 'Canjear código' (Use code) e introduce la clave.",
      "Confirma y el juego se añadirá a tu cuenta o a 'Mis juegos y aplicaciones'.",
      "Desde ahí podrás descargarlo o instalarlo en tu consola."
    ],
    note: "También puedes canjear desde account.microsoft.com/redeem en la web."
  },
  {
    match: ["NINTENDO SWITCH 2", "NINTENDO SWITCH 2", "SWITCH 2"],
    key: "switch2",
    iconClass: "fas fa-gamepad",
    title: "Nintendo Switch 2",
    subtitle: "Canjear en eShop (Switch 2)",
    steps: [
      "Enciende tu consola Switch 2 e inicia sesión en Nintendo eShop.",
      "Selecciona 'Canjear código' y escribe la clave que recibiste.",
      "Acepta y la compra se añadirá a tu cuenta; podrás descargarla desde la eShop.",
      "Si la consola tiene región distinta, revisa la compatibilidad del código."
    ],
    note: "Instrucciones basadas en el flujo típico de eShop; pequeñas variaciones según la consola."
  },
  {
    match: ["NINTENDO SWITCH", "SWITCH"],
    key: "switch",
    iconClass: "fas fa-gamepad",
    title: "Nintendo Switch",
    subtitle: "Activación en Nintendo eShop",
    steps: [
      "En tu Nintendo Switch abre Nintendo eShop con tu usuario y región correcta.",
      "En el menú lateral selecciona 'Canjear código'.",
      "Introduce la clave en pantalla y acepta. El juego se añadirá a tu cuenta.",
      "Descarga el juego desde 'Descargas' o 'Lista de descargas' en la eShop."
    ],
    note: "Asegúrate de que la clave coincide con la región de tu cuenta Nintendo."
  }
];


function findPlatformEntry(platformText) {
  if (!platformText || typeof platformText !== "string") return null;
  const up = platformText.toUpperCase();
  for (const entry of PLATFORM_MAP) {
    for (const token of entry.match) {
      if (up.includes(token)) return entry;
    }
  }
  return null;
}

export default function ActivationSteps({ platform = "", region = "" }) {
  const entry = useMemo(() => findPlatformEntry(platform), [platform]);

  const fallback = {
    key: "generic",
    iconClass: "fas fa-info-circle",
    title: platform || "Plataforma",
    subtitle: region ? `Región: ${region}` : undefined,
    steps: [
      "Consulta las instrucciones de activación específicas del servicio donde se use la clave.",
      "Normalmente deberás iniciar sesión en la tienda/lanzador correspondiente (Steam, Epic, PSN, Xbox, eShop, etc.).",
      "Busca 'Canjear código' o 'Redeem code' y pega la clave cuando te la soliciten.",
      "Si la clave falla, verifica la región y contacta al soporte del vendedor o de la plataforma."
    ],
    note: "Si sabés la tienda exacta (Steam, Epic, PSN, Xbox, Switch, etc.), abrila y buscá 'Canjear código'."
  };

  const used = entry || fallback;

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-body">
        <h5 className="card-title text-primary">¿Cómo activar?</h5>

        <div className="row g-3 mt-2">
          <div className="col-12 d-flex">
            <div className="activation-card p-3 d-flex" style={{ flex: 1 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.00))",
                color: "var(--accent)", fontSize: 20, flex: "0 0 56px"
              }}>
                <i className={used.iconClass} aria-hidden style={{ fontSize: 22 }} />
              </div>

              <div className="activation-content" style={{ marginLeft: 12, display: "flex", flexDirection: "column", flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)" }}>{used.title}</div>
                    {used.subtitle && <div style={{ color: "var(--muted)", fontSize: 13 }}>{used.subtitle}</div>}
                  </div>
                </div>

                <div className="activation-steps" style={{ marginTop: 8, flex: 1, minHeight: 1 }}>
                  <ol className="muted" style={{ margin: 0, paddingLeft: 18 }}>
                    {used.steps.map((s, i) => (
                      <li key={i} style={{ marginBottom: 8 }}>{s}</li>
                    ))}
                  </ol>

                  {used.note && (
                    <div className="mt-2 small" style={{ color: "var(--muted)" }}>
                      <strong>Nota:</strong> {used.note} {region ? `(Región detectada: ${region})` : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {entry && entry.key && entry.key.startsWith("pc") && (
            <div className="col-12">
              <div className="card p-3 bg-dark border-secondary">
                <div style={{ color: "var(--text)", fontWeight: 700 }}>Consejos extra para PC</div>
                <ul className="muted" style={{ paddingLeft: 18, marginTop: 8 }}>
                  <li>Revisa que tu cliente (Steam/Epic/GOG/EA/Ubisoft) esté actualizado antes de canjear.</li>
                  <li>Si el juego no aparece inmediatamente en la biblioteca, intenta cerrar y reabrir el cliente o verificar la sección 'Agregar juego' / 'Mi biblioteca'.</li>
                  <li>Guarda la clave en un lugar seguro por si necesitas contactar soporte.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
