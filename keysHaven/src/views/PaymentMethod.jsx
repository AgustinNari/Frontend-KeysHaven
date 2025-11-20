import React, { useState } from "react";
import { useNavigate } from "react-router-dom";  

function PaymentDetails({ method, onChange, values }) {
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
            <label className="form-label text-muted">Nombre en la tarjeta</label>
            <input
              value={values.cardName || ""}
              onChange={onInput("cardName")}
              className="form-control"
              placeholder="Juan Pérez"
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-muted">Número de tarjeta</label>
            <input
              value={values.cardNumber || ""}
              onChange={onInput("cardNumber")}
              className="form-control"
              placeholder="4242 4242 4242 4242"
              maxLength={19}
            />
          </div>

          <div className="d-flex" style={commonRowStyle}>
            <div className="me-2 flex-fill">
              <label className="form-label text-muted">Expiración (MM/AA)</label>
              <input
                value={values.cardExp || ""}
                onChange={onInput("cardExp")}
                className="form-control"
                placeholder="08/28"
                maxLength={5}
              />
            </div>
            <div style={{ width: 120 }}>
              <label className="form-label text-muted">CVV</label>
              <input
                value={values.cardCvv || ""}
                onChange={onInput("cardCvv")}
                className="form-control"
                placeholder="123"
                maxLength={4}
              />
            </div>
          </div>
        </div>
      );

    case "mercado-pago":
      return (
        <div className="mt-4 p-3 border rounded bg-dark">
          <h6 className="text-white">Mercado Pago</h6>

          <div className="mb-2">
            <label className="form-label text-muted">Email</label>
            <input
              value={values.mpEmail || ""}
              onChange={onInput("mpEmail")}
              className="form-control"
              placeholder="mail@ejemplo.com"
            />
          </div>

          <div className="mb-2">
            <label className="form-label text-muted">Número de teléfono (opcional)</label>
            <input
              value={values.mpPhone || ""}
              onChange={onInput("mpPhone")}
              className="form-control"
              placeholder="+54 9 11 1234-5678"
            />
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
            <label className="form-label text-muted">Email de PayPal</label>
            <input
              value={values.ppEmail || ""}
              onChange={onInput("ppEmail")}
              className="form-control"
              placeholder="paypal@ejemplo.com"
            />
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

  const paymentMethods = [
    { id: "credit", label: "Tarjeta de Crédito", icon: "fas fa-credit-card" },
    { id: "mercado-pago", label: "Mercado Pago", icon: "fas fa-wallet" },
    { id: "paypal", label: "PayPal", icon: "fab fa-paypal" },
  ];

  const isFormValid = () => {
    if (!selectedMethod) return false;

    switch (selectedMethod) {
      case "credit":
        return (
          (formValues.cardName || "").trim().length > 2 &&
          (formValues.cardNumber || "").replace(/\s/g, "").length >= 12 &&
          (formValues.cardExp || "").length >= 4 &&
          (formValues.cardCvv || "").length >= 3
        );
      case "mercado-pago":
        return (formValues.mpEmail || "").includes("@");
      case "paypal":
        return (formValues.ppEmail || "").includes("@");
      default:
        return false;
    }
  };

  const handleSelect = (id) => {
    setSelectedMethod(id);
    setFormValues({});
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setSubmitting(true);

    try {
      // Pop-up de redirección
      alert(`Redireccionando a ${selectedMethod.replace("-", " ")}`);

      // Simulación de espera
      await new Promise((r) => setTimeout(r, 700));

      // Redirigir a la ruta /checkout
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
              onChange={(newVals) => setFormValues(newVals)}
            />

            <div className="d-grid gap-2 mt-3">
              <button
                className="btn btn-primary py-2 fw-bold"
                disabled={!isFormValid() || submitting}
                onClick={handleSubmit}
              >
                {submitting ? "Procesando..." : "Continuar compra"}
              </button>

              <button
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSelectedMethod(null);
                  setFormValues({});
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
