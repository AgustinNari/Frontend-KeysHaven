import React, { useEffect, useState } from "react";
import "../components/estilos/profile.css";

import AvatarUploader from "../components/profile/AvatarUploader";
import AccountSettings from "../components/profile/AccountSettings";
import OrdersTab from "../components/profile/OrdersTab";
import ConfirmModal from "../components/profile/ConfirmModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";

import ProfileCoupons from "../components/profile/ProfileCoupons";

import { useAuth } from "../context/AuthContext";
import * as usersApi from "../services/users";
import * as ordersApi from "../services/orders";
import * as reviewsApi from "../services/reviews";
import * as authApi from "../services/auth";
import apiClient from "../api/apiClient";

export default function Profile() {
  const { user: ctxUser, refreshProfile, logout } = useAuth();
  const [profile, setProfile] = useState(ctxUser ?? null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [ordersPage, setOrdersPage] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [userReviews, setUserReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState("account");
  const [showProfileDeleteConfirm, setShowProfileDeleteConfirm] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);

  const [message, setMessage] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const p = await usersApi.getMyProfile();
        setProfile(p);
      } catch (err) {
        console.error("No se pudo cargar perfil:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (!profile) {
      loadProfile();
    }
  }, []);

  useEffect(() => {
    loadOrders(0, 10);
    loadMyReviews(0, 100);
  }, []);

  async function loadOrders(page = 0, size = 10) {
    setOrdersLoading(true);
    try {
      const pageRes = await ordersApi.getMyOrders(page, size);
      setOrdersPage(pageRes);
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      setMessage({ type: "error", text: "No se pudieron cargar las órdenes." });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setOrdersLoading(false);
    }
  }

  async function loadMyReviews(page = 0, size = 100) {
    setReviewsLoading(true);
    try {
      const resp = await apiClient.apiFetch(`/reviews/me?page=${page}&size=${size}`, { method: "GET" });
      const list = resp?.content ?? resp ?? [];
      setUserReviews(list);
    } catch (err) {
      console.error("Error cargando reseñas del usuario:", err);
      setMessage({ type: "error", text: "No se pudieron cargar tus reseñas." });
      setTimeout(() => setMessage(null), 3500);
    } finally {
      setReviewsLoading(false);
    }
  }

  async function handleSaveAccount(updated) {
    if (!profile) return;
    try {
      await usersApi.updateUser(profile.id, updated);
      await refreshProfile();
      const p = await usersApi.getMyProfile();
      setProfile(p);
      setMessage({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      setMessage({ type: "error", text: err?.message || "Error al actualizar perfil." });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  }

  async function handleUploadAvatar(file) {
    if (!profile) return;
    try {
      await usersApi.uploadAvatar(profile.id, file);
      await refreshProfile();
      const p = await usersApi.getMyProfile();
      setProfile(p);
      setMessage({ type: "success", text: "Avatar subido." });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      setMessage({ type: "error", text: "Error subiendo avatar." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleReplaceAvatar(file) {
    if (!profile) return;
    try {
      await usersApi.replaceAvatar(profile.id, file);
      await refreshProfile();
      const p = await usersApi.getMyProfile();
      setProfile(p);
      setMessage({ type: "success", text: "Avatar reemplazado." });
    } catch (err) {
      console.error("Error reemplazando avatar:", err);
      setMessage({ type: "error", text: "Error reemplazando avatar." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleDeleteAvatar() {
    if (!profile) return;
    try {
      await usersApi.deleteAvatar(profile.id);
      await refreshProfile();
      const p = await usersApi.getMyProfile();
      setProfile(p);
      setMessage({ type: "success", text: "Avatar eliminado." });
    } catch (err) {
      console.error("Error eliminando avatar:", err);
      setMessage({ type: "error", text: "Error eliminando avatar." });
    } finally {
      setTimeout(() => setMessage(null), 3000);
    }
  }

  async function handleChangePassword(dto) {
    try {
      await authApi.changePassword(dto);
      setMessage({ type: "success", text: "Contraseña cambiada correctamente." });
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      setMessage({ type: "error", text: err?.message || "Error cambiando contraseña." });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  }

  async function resolveProductIdFromOrder(orderId, orderItemId) {
    const searchIn = (orders) => {
      if (!orders || !Array.isArray(orders)) return null;
      for (const ord of orders) {
        if (String(ord.id) === String(orderId)) {
          const items = ord.items ?? ord.orderItems ?? ord.order_items ?? ord.lines ?? [];
          if (!Array.isArray(items)) continue;
          for (const it of items) {
            if (String(it.id) === String(orderItemId) || String(it.orderItemId) === String(orderItemId) || String(it.order_item_id) === String(orderItemId)) {
              return it.productId ?? it.product?.id ?? it.product_id ?? it.product?.productId ?? null;
            }
          }
        }
      }
      return null;
    };

    const ordersArray = ordersPage?.content ?? (Array.isArray(ordersPage) ? ordersPage : null);
    let found = searchIn(ordersArray);
    if (found) return found;

    try {
      const refreshed = await ordersApi.getMyOrders(0, 200);
      const refreshedArray = refreshed?.content ?? (Array.isArray(refreshed) ? refreshed : []);
      setOrdersPage(refreshed);
      found = searchIn(refreshedArray);
      if (found) return found;
    } catch (err) {
      console.warn("No se pudo recargar órdenes para resolver productId:", err);
    }

    return null;
  }

  async function handleSaveReview(orderId, orderItemId, data, existingReview = null) {
    try {
      if (existingReview) {
        await reviewsApi.updateReview(existingReview.id, {
          rating: data.rating,
          title: data.title,
          comment: data.comment
        });
        setMessage({ type: "success", text: "Reseña actualizada." });
      } else {
        let productId = data.productId ?? null;

        if (!productId) {
          productId = await resolveProductIdFromOrder(orderId, orderItemId);
          if (productId) {
            console.debug("Resolved productId from order:", productId);
          }
        }

        if (!productId) {
          throw new Error("No se pudo determinar el producto asociado a esta reseña (productId faltante). Intenta recargar la página o contacta soporte.");
        }

        const payload = {
          productId: productId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
          orderItemId: orderItemId
        };

        const created = await reviewsApi.createReview(payload);

        console.debug("Created review:", created);
        setMessage({ type: "success", text: "Reseña publicada." });
      }

      await loadMyReviews(0, 200);
    } catch (err) {
      console.error("Error guardando reseña:", err);
      setMessage({ type: "error", text: err?.message || "Error guardando reseña." });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      await reviewsApi.deleteReview(reviewId);
      await loadMyReviews(0, 200);
      setMessage({ type: "success", text: "Reseña eliminada." });
    } catch (err) {
      console.error("Error eliminando reseña:", err);
      setMessage({ type: "error", text: "Error eliminando reseña." });
    } finally {
      setTimeout(() => setMessage(null), 3500);
    }
  }

  function handleConfirmDeleteProfile() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userProfile");
    setShowProfileDeleteConfirm(false);
    setProfile(null);
    setOrdersPage(null);
    setUserReviews([]);
    logout();
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString();
    } catch {
      return "-";
    }
  }

  if (!profile) {
    return (
      <div className="full-center">
        <div className="card p-4">
          <h3>Perfil no disponible</h3>
          <p style={{ color : "#7f13ec"}}>No se encontró tu perfil. Asegurate de haber iniciado sesión.</p>
          <div>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>Recargar</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <main className="app-container">
        <h1>Mi perfil</h1>

        {message && (
          <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`}>
            {message.text}
          </div>
        )}

        <div className="profile-layout">

          <aside className="profile-sidebar">
            <div className="sidebar-avatar card">
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div className="avatar-box">
                  <div className="avatar-preview">
                    <img
                      src={profile.avatarDataUrl ?? "/src/assets/doppyKnight/doppyThumbsUp.png"}
                      alt="avatar"
                      style={{ width: 120, height: 120, borderRadius: 8 }}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontWeight: 700 }}>{profile.displayName}</div>
                  <div className="text small">{profile.email}</div>
                </div>
              </div>

              <div style={{ marginTop: 10, display: "flex", gap: 8, justifyContent: "center" }}>
                <button className="btn btn-outline-primary btn-sm" onClick={() => setActiveTab("account")}>Editar</button>
              </div>

              <div style={{ marginTop: 10, fontSize: 13 }}>
                <div className="small">Miembro desde: <span style={{ color: "#e6dbff" }}>{formatDate(profile.createdAt)}</span></div>
                <div className="small">Último login: <span style={{ color: "#e6dbff" }}>{new Date(profile.lastLogin).toLocaleString()}</span></div>
                <div className="small">Saldo: <span style={{ color: "#e6dbff" }}>${profile.buyerBalance ?? 0}</span></div>
              </div>
            </div>

            <nav className="profile-menu">
              <button className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}>Configuración de cuenta</button>
              <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Mis órdenes</button>
              <button className={activeTab === "coupons" ? "active" : ""} onClick={() => setActiveTab("coupons")}>Mis cupones</button>
              <button onClick={() => setShowChangePwdModal(true)} style={{ marginTop: 6 }}>Cambiar contraseña</button>
            </nav>

            <div>
              <div className="card p-2">
                <div className="small">Rol: <span style={{ color: "#e6dbff" }}>{profile.role}</span></div>
              </div>
            </div>
          </aside>

          <section className="profile-content">
            {activeTab === "account" && (
              <>
                <div className="card p-3 mb-3">
                  <h3>Avatar</h3>
                  <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
                    <AvatarUploader
                      avatarDataUrl={profile.avatarDataUrl ?? "/src/assets/doppyKnight/doppyThumbsUp.png"}
                      onUpload={handleUploadAvatar}
                      onReplace={handleReplaceAvatar}
                      onDelete={handleDeleteAvatar}
                    />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: "#e6dbff" }}>Subí o reemplazá tu avatar. El archivo debe ser imagen y preferentemente cuadrado para mejor visual.</p>
                    </div>
                  </div>
                </div>

                <AccountSettings user={profile} onSave={handleSaveAccount} />
              </>
            )}

            {activeTab === "orders" && (
              <>
                {ordersLoading && <div className="text-muted">Cargando órdenes...</div>}
                {!ordersLoading && ordersPage && (
                  <OrdersTab
                    ordersPage={ordersPage}
                    onPageChange={(newPage) => loadOrders(newPage - 1, 10)}
                    userReviews={userReviews}
                    onSaveReview={handleSaveReview}
                    onDeleteReview={handleDeleteReview}
                  />
                )}
                {!ordersLoading && !ordersPage && <div className="text-muted">No se encontraron órdenes.</div>}
              </>
            )}

            {activeTab === "coupons" && (
              <div>
                <ProfileCoupons profile={profile} />
              </div>
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
