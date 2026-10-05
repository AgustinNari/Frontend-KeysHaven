# KeysHaven — Frontend

Frontend de KeysHaven, un marketplace de claves digitales desarrollado en equipo. Incluye catálogo, autenticación, carrito, descuentos y cupones, órdenes, perfiles, panel de vendedores y panel de administración. El flujo de pago es simulado y no procesa dinero ni transacciones reales.

React 19, Vite 7, Redux Toolkit, React Router y Bootstrap. La aplicación está en `keysHaven/`.

## Ejecución local

Requisitos: Node.js 20.19+ o 22.12+, npm y backend funcionando en `http://localhost:4002`.

```sh
cd keysHaven
npm ci
npm run dev
```

Abrir `http://localhost:5173`. Para cambiar el backend, copiar `.env.example` a `.env.local` y ajustar `VITE_API_BASE_URL`. Las variables Vite son públicas; nunca colocar secretos en ellas. La configuración de CORS del backend debe permitir el origen elegido.

```sh
npm test
npm run lint
npm run build
```

Redux mantiene la sesión y los datos globales. `useCart()` es una fachada sobre Redux. El token y los ítems del carrito se conservan en localStorage; el perfil se verifica con el backend al recargar. El carrito está asociado al usuario y se limpia al salir.

Backend en el repositorio hermano `Backend-KeysHaven/marketplace`.
