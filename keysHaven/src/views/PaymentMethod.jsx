import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  
import { validations, validationMessages } from "../utils/validations.js";

function PaymentDetails({ method, onChange, values, errors }) {
  if (!method) return null;

  const commonRowStyle = { gap: 8 };
  const onInput = (field) => (e) =>
    onChange({ ...values, [field]: e.target.value });

  switch (method) {
    case "credit":
      return (
        <div className="mt-4 p-3 border rounded bg-dark">
          <h6 className="text-white">Pago con Tarjeta de Crédito</h6>

          <div className="mb-2">
            <label className="form-label text-muted">Nombre en la tarjeta *</label>
            <input
              value={values.cardName || ""}
              onChange={onInput("cardName")}
              className={`form-control ${errors.cardName ? 'is-invalid' : ''}`}
              placeholder="Juan Pérez"
            />
            {errors.cardName && <div className="invalid-feedback">{errors.cardName}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label text-muted">Número de tarjeta *</label>
            <input
              value={values.cardNumber || ""}
              onChange={onInput("cardNumber")}
              className={`form-control ${errors.cardNumber ? 'is-invalid' : ''}`}
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
            {errors.cardNumber && <div className="invalid-feedback">{errors.cardNumber}</div>}
          </div>

          <div className="d-flex" style={commonRowStyle}>
            <div className="me-2 flex-fill">
              <label className="form-label text-muted">Expiración (MM/AA) *</label>
              <input
                value={values.cardExp || ""}
                onChange={onInput("cardExp")}
                className={`form-control ${errors.cardExp ? 'is-invalid' : ''}`}
                placeholder="08/28"
                maxLength={5}
              />
              {errors.cardExp && <div className="invalid-feedback">{errors.cardExp}</div>}
            </div>
            <div style={{ width: 120 }}>
              <label className="form-label text-muted">CVV *</label>
              <input
                value={values.cardCvv || ""}
                onChange={onInput("cardCvv")}
                className={`form-control ${errors.cardCvv ? 'is-invalid' : ''}`}
                placeholder="123"
                maxLength={4}
              />
              {errors.cardCvv && <div className="invalid-feedback">{errors.cardCvv}</div>}
            </div>
          </div>
        </div>
      );

    case "mercado-pago":
      return (
        <div className="mt-4 p-3 border rounded bg-dark">
          <h6 className="text-white">Mercado Pago</h6>

          <div className="mb-2">
            <label className="form-label text-muted">Email *</label>
            <input
              value={values.mpEmail || ""}
              onChange={onInput("mpEmail")}
              className={`form-control ${errors.mpEmail ? 'is-invalid' : ''}`}
              placeholder="mail@ejemplo.com"
            />
            {errors.mpEmail && <div className="invalid-feedback">{errors.mpEmail}</div>}
          </div>

          <div className="mb-2">
            <label className="form-label text-muted">Número de teléfono (opcional)</label>
            <input
              value={values.mpPhone || ""}
              onChange={onInput("mpPhone")}
              className={`form-control ${errors.mpPhone ? 'is-invalid' : ''}`}
              placeholder="+54 9 11 1234-5678"
            />
            {errors.mpPhone && <div className="invalid-feedback">{errors.mpPhone}</div>}
          </div>

          <div className="form-text text-muted">
            Serás redirigido a Mercado Pago para completar la compra.
          </div>
        </div>
      );

    case "paypal":
      return (
        <div className="mt-4 p-3 border rounded bg-dark">
          <h6 className="text-white">PayPal</h6>

          <div className="mb-2">
            <label className="form-label text-muted">Email de PayPal *</label>
            <input
              value={values.ppEmail || ""}
              onChange={onInput("ppEmail")}
              className={`form-control ${errors.ppEmail ? 'is-invalid' : ''}`}
              placeholder="paypal@ejemplo.com"
            />
            {errors.ppEmail && <div className="invalid-feedback">{errors.ppEmail}</div>}
          </div>

          <div className="form-text text-muted">
            Al continuar serás redirigido a PayPal para autorizar el pago.
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function PaymentMethods() {
  const navigate = useNavigate();

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const paymentMethods = [
    { id: "credit", label: "Tarjeta de Crédito", icon: "fas fa-credit-card" },
    { id: "mercado-pago", label: "Mercado Pago", icon: "fas fa-wallet" },
    { id: "paypal", label: "PayPal", icon: "fab fa-paypal" },
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedMethod) {
      newErrors.method = "Selecciona un método de pago";
      return false;
    }

    switch (selectedMethod) {
      case "credit":
        if (!formValues.cardName?.trim()) {
          newErrors.cardName = "El nombre en la tarjeta es requerido";
        }
        
        if (!formValues.cardNumber) {
          newErrors.cardNumber = "El número de tarjeta es requerido";
        } else if (!validations.creditCard(formValues.cardNumber)) {
          newErrors.cardNumber = validationMessages.creditCard;
        }
        
        if (!formValues.cardExp) {
          newErrors.cardExp = "La fecha de expiración es requerida";
        } else if (!validations.cardExpiry(formValues.cardExp)) {
          newErrors.cardExp = validationMessages.cardExpiry;
        }
        
        if (!formValues.cardCvv) {
          newErrors.cardCvv = "El CVV es requerido";
        } else if (!validations.cvv(formValues.cardCvv)) {
          newErrors.cardCvv = validationMessages.cvv;
        }
        break;
        
      case "mercado-pago":
        if (!formValues.mpEmail) {
          newErrors.mpEmail = "El email es requerido";
        } else if (!validations.email(formValues.mpEmail)) {
          newErrors.mpEmail = validationMessages.email;
        }
        
        if (formValues.mpPhone && !validations.phone(formValues.mpPhone)) {
          newErrors.mpPhone = validationMessages.phone;
        }
        break;
        
      case "paypal":
        if (!formValues.ppEmail) {
          newErrors.ppEmail = "El email de PayPal es requerido";
        } else if (!validations.email(formValues.ppEmail)) {
          newErrors.ppEmail = validationMessages.email;
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelect = (id) => {
    setSelectedMethod(id);
    setFormValues({});
    setErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      alert(`Redireccionando a ${selectedMethod.replace("-", " ")}`);
      await new Promise((r) => setTimeout(r, 700));
      navigate("/checkout");
    } catch (err) {
      console.error(err);
      alert("Ocurrió un error al procesar el pago");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5" data-bs-theme="dark">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card shadow-lg p-4 bg-dark text-white">
            <h4 className="fw-bold text-primary text-center mb-3">Métodos de Pago</h4>
            <p className="text-center text-muted">¡Ya casi terminamos!</p>

            {errors.method && <div className="alert alert-danger">{errors.method}</div>}

            <div className="list-group">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handleSelect(method.id)}
                  className={`list-group-item list-group-item-action d-flex align-items-center gap-3 py-3 fw-semibold ${
                    selectedMethod === method.id ? "active" : ""
                  }`}
                >
                  <i className={`${method.icon} fs-4`} />
                  {method.label}
                </button>
              ))}
            </div>

            <PaymentDetails
              method={selectedMethod}
              values={formValues}
              errors={errors}
              onChange={(newVals) => setFormValues(newVals)}
            />

            <div className="d-grid gap-2 mt-3">
              <button
                className="btn btn-primary py-2 fw-bold"
                disabled={!selectedMethod || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Procesando..." : "Continuar compra"}
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedMethod(null);
                  setFormValues({});
                  setErrors({});
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}