import React, { useState, useEffect } from "react";
import "../components/estilos/profile.css";
import AvatarUploader from "../components/profile/AvatarUploader";
import AccountSettings from "../components/profile/AccountSettings";
import OrdersTab from "../components/profile/OrdersTab";
import ConfirmModal from "../components/profile/ConfirmModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";

import { MOCK_USER } from "../data/mockUser";
import { MOCK_ORDERS } from "../data/mockOrders";
import { MOCK_REVIEWS } from "../data/mockReviews";

export default function Profile() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("profile_user");
    return saved ? JSON.parse(saved) : MOCK_USER;
  });
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("profile_orders");
    return saved ? JSON.parse(saved) : MOCK_ORDERS;
  });
  const [reviews, setReviews] = useState(() => {
    const saved = localStorage.getItem("profile_reviews");
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });


  const [activeTab, setActiveTab] = useState("account");

  const [showProfileDeleteConfirm, setShowProfileDeleteConfirm] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);

  useEffect(() => { localStorage.setItem("profile_user", JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem("profile_orders", JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem("profile_reviews", JSON.stringify(reviews)); }, [reviews]);


  function handleUploadAvatar(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUser(prev => ({ ...prev, avatarContentType: file.type, avatarDataUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }
  function handleReplaceAvatar(file) { handleUploadAvatar(file); }
  function handleDeleteAvatar() { setUser(prev => ({ ...prev, avatarContentType: null, avatarDataUrl: null })); }


  function handleSaveAccount(updated) {
    setUser(prev => ({ ...prev, ...updated }));
    alert("Perfil actualizado (simulado).");
  }


  function handleChangePassword(dto) {

    console.log("Change password DTO", dto);
    alert("Contraseña cambiada (simulado).");
  }


  function handleSaveReview(orderId, orderItemId, data, existingReview = null) {
    if (existingReview) {
      setReviews(prev => prev.map(r => r.id === existingReview.id ? { ...r, ...data, createdAt: new Date().toISOString() } : r));
      alert("Reseña actualizada (simulado).");
    } else {
      const newReview = {
        id: Date.now(),
        productId: null,
        buyerId: user.id,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        visible: true,
        createdAt: new Date().toISOString(),
        orderItemId
      };
      setReviews(prev => [newReview, ...prev]);
      alert("Reseña publicada (simulado).");
    }
  }

  function handleDeleteReview(reviewId) {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    alert("Reseña eliminada (simulado).");
  }

  function getUserReviewsForUI() { return reviews; }


  function handleConfirmDeleteProfile() {
    localStorage.removeItem("profile_user");
    localStorage.removeItem("profile_orders");
    localStorage.removeItem("profile_reviews");
    setUser(null);
    setOrders([]);
    setReviews([]);
    setShowProfileDeleteConfirm(false);
    alert("Perfil eliminado (simulado).");
  }

  if (!user) {
    return (
      <div className="full-center">
        <div className="card p-4">
          <h3>Perfil eliminado / no disponible</h3>
          <p className="text-muted">En la demo el perfil fue eliminado. Recarga la página para restaurar mocks.</p>
          <div>
            <button className="btn btn-primary" onClick={() => { localStorage.removeItem("profile_user"); location.reload(); }}>Restaurar mocks</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="app-container">
        <h1>Mi perfil</h1>

        <div className="profile-layout">
          {}
          <aside className="profile-sidebar">
            <div className="sidebar-avatar card">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="avatar-box">
                  <div className="avatar-preview">
                    <img src={user.avatarDataUrl ?? "/src/assets/doppyKnight/homeImage.png"} alt="avatar" style={{ width: 120, height: 120, borderRadius: 8 }} />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 700 }}>{user.displayName}</div>
                  <div className="text small">{user.email}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab("account")}>Editar</button>
                <button className="btn btn-outline-secondary btn-sm" onClick={() => setShowProfileDeleteConfirm(true)}>Eliminar demo</button>
              </div>

              <div style={{ marginTop: 10, fontSize: 13 }}>
                <div className="small">Miembro desde: <span style = {{ color: "#e6dbff" }}>{new Date(user.createdAt).toLocaleDateString()}</span></div>
                <div className="small">Último login: <span style = {{ color: "#e6dbff" }}>{new Date(user.lastLogin).toLocaleString()}</span></div>
                <div className="small">Saldo: <span style = {{ color: "#e6dbff" }}>${user.buyerBalance}</span></div>
              </div>
            </div>

            <nav className="profile-menu">
              <button className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}>Configuración de cuenta</button>
              <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Mis órdenes</button>
              <button onClick={() => setShowChangePwdModal(true)} style={{ marginTop: 6 }}>Cambiar contraseña</button>
            </nav>

            <div>
              <div className="card p-2">
                <div className="small">Rol: <span style = {{ color: "#e6dbff" }}>{user.role}</span></div>
              </div>
            </div>
          </aside>

          {}
          <section className="profile-content">
            {}
            {activeTab === "account" && (
              <>
                <div className="card p-3 mb-3">
                  <h3>Avatar</h3>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <AvatarUploader
                      avatarDataUrl={user.avatarDataUrl}
                      onUpload={handleUploadAvatar}
                      onReplace={handleReplaceAvatar}
                      onDelete={handleDeleteAvatar}
                    />
                    <div style={{ flex: 1 }}>
                      <p style = {{ color: "#e6dbff" }}>Subí o reemplazá tu avatar. El archivo debe ser imagen y preferentemente cuadrado para mejor visual.</p>
                    </div>
                  </div>
                </div>

                <AccountSettings user={user} onSave={handleSaveAccount} />
              </>
            )}

            {}
            {activeTab === "orders" && (
              <OrdersTab
                orders={orders}
                userReviews={getUserReviewsForUI()}
                onSaveReview={handleSaveReview}
                onDeleteReview={handleDeleteReview}
              />
            )}
          </section>
        </div>

        <ConfirmModal
          show={showProfileDeleteConfirm}
          title="Eliminar perfil"
          message="¿Estás seguro que querés eliminar tu perfil (demo)? Esta acción eliminará todos los datos locales de demostración."
          onCancel={() => setShowProfileDeleteConfirm(false)}
          onConfirm={handleConfirmDeleteProfile}
          confirmText="Sí, eliminar"
        />

        <ChangePasswordModal
          show={showChangePwdModal}
          onClose={() => setShowChangePwdModal(false)}
          onChangePassword={(dto) => handleChangePassword(dto)}
        />
      </main>
    </div>
  );
}
