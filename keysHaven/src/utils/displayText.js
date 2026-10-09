const errorMessages = {
  'unauthorized': 'Debes iniciar sesión.',
  'forbidden': 'No tienes permisos para realizar esta acción.',
  'access denied': 'No tienes permisos para realizar esta acción.',
  'bad request': 'Solicitud inválida.',
  'not found': 'Recurso no encontrado.',
  'internal server error': 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.',
  'unexpected error': 'Ocurrió un error inesperado.',
  'unknown error': 'Ocurrió un error desconocido.',
  'failed to fetch': 'No se pudo conectar con el servidor. Revisa tu conexión.',
  'network error': 'No se pudo conectar con el servidor. Revisa tu conexión.',
  'networkerror when attempting to fetch resource.': 'No se pudo conectar con el servidor. Revisa tu conexión.',
  'load failed': 'No se pudo conectar con el servidor. Revisa tu conexión.',
  'bad credentials': 'Correo electrónico o contraseña inválidos.',
  'invalid credentials': 'Correo electrónico o contraseña inválidos.',
  'invalid email or password': 'Correo electrónico o contraseña inválidos.',
  'user not found': 'No se encontró el usuario.',
  'product not found': 'No se encontró el producto.',
  'email already exists': 'El correo electrónico ya está registrado.',
  'email already in use': 'El correo electrónico ya está registrado.',
  'insufficient stock': 'No hay suficientes unidades disponibles.',
  'insufficient balance': 'El saldo disponible es insuficiente.',
  'invalid coupon': 'El cupón no es válido.',
  'coupon expired': 'El cupón venció.'
};

const fieldLabels = {
  email: 'El correo electrónico', password: 'La contraseña', displayName: 'El nombre de usuario',
  firstName: 'El nombre', lastName: 'El apellido', phone: 'El teléfono',
  title: 'El título', price: 'El precio', rating: 'La puntuación', quantity: 'La cantidad'
};

// Presentation only: retain API bodies, status codes and validation values.
export function localizeErrorMessage(value) {
  const message = String(value ?? '');
  const normalized = message.trim().toLowerCase();
  if (Object.hasOwn(errorMessages, normalized)) return errorMessages[normalized];
  const validation = message.match(/^(\w+):\s*(.+)$/);
  if (validation && Object.hasOwn(fieldLabels, validation[1])) {
    const field = fieldLabels[validation[1]];
    const rule = validation[2];
    if (/^must not be (?:blank|null|empty)$/i.test(rule)) return `${field} es obligatorio.`;
    if (/^must be a well-formed email address$/i.test(rule)) return `${field} debe tener un formato válido.`;
    const range = rule.match(/^size must be between (\d+) and (\d+)$/i);
    if (range) return `${field} debe tener entre ${range[1]} y ${range[2]} caracteres.`;
    const bound = rule.match(/^must be (greater than or equal to|less than or equal to) (\d+(?:\.\d+)?)$/i);
    if (bound) return `${field} debe ser ${bound[1].toLowerCase().startsWith('greater') ? 'mayor o igual' : 'menor o igual'} que ${bound[2]}.`;
  }
  if (/^fetch failed:\s*\d+$/i.test(message)) return `No se pudo completar la solicitud (${message.match(/\d+$/)[0]}).`;
  return message;
}

const valueLabels = {
  BUYER: 'Comprador', SELLER: 'Vendedor', ADMIN: 'Administrador',
  PENDING: 'Pendiente', COMPLETED: 'Completado', CANCELLED: 'Cancelado', CANCELED: 'Cancelado',
  PAID: 'Pagado', FAILED: 'Fallido', AVAILABLE: 'Disponible', USED: 'Usada',
  PRODUCT: 'Producto', CATEGORY: 'Categoría'
};

export function displayValue(value) {
  return Object.hasOwn(valueLabels, value) ? valueLabels[value] : value;
}
