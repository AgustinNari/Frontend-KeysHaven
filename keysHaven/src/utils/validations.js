export const validations = {

  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-()]{8,20}$/;
    return phoneRegex.test(phone);
  },

  onlyText: (text) => {
    const textRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
    return textRegex.test(text);
  },

  onlyNumbers: (text) => {
    const numbersRegex = /^\d+$/;
    return numbersRegex.test(text);
  },

  creditCard: (cardNumber) => {
    const cardRegex = /^\d{12,19}$/;
    return cardRegex.test(cardNumber.replace(/\s/g, ''));
  },

  cardExpiry: (expiry) => {
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    if (!expiryRegex.test(expiry)) return false;

    const [month, year] = expiry.split('/');
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;

    if (parseInt(year) < currentYear) return false;
    if (parseInt(year) === currentYear && parseInt(month) < currentMonth) return false;

    return true;
  },

  cvv: (cvv) => {
    const cvvRegex = /^\d{3,4}$/;
    return cvvRegex.test(cvv);
  },

  password: (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }
};

export const validationMessages = {
  email: "Por favor ingresa un correo electrónico válido",
  phone: "Formato de teléfono inválido. Usa formato: +54 11 1234-5678",
  onlyText: "Este campo solo puede contener letras y espacios",
  onlyNumbers: "Este campo solo puede contener números",
  creditCard: "Número de tarjeta inválido",
  cardExpiry: "Fecha de expiración inválida o vencida",
  cvv: "CVV inválido (3 o 4 dígitos)",
  password: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número"
};
