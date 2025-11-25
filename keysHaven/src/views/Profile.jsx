import React, { useEffect, useState, useRef } from "react";
import "../components/estilos/profile.css";

import AvatarUploader from "../components/profile/AvatarUploader";
import AccountSettings from "../components/profile/AccountSettings";
import OrdersTab from "../components/profile/OrdersTab";
import ConfirmModal from "../components/profile/ConfirmModal";
import ChangePasswordModal from "../components/profile/ChangePasswordModal";
import ProfileCoupons from "../components/profile/ProfileCoupons";

import { useAppSelector, useAppDispatch } from "../redux/hooks";
import { selectUser, refreshProfile, logout as logoutAction, setUser } from "../redux/slices/authSlice";
import { fetchMyProfile, updateMyUser, uploadAvatar, replaceAvatar, deleteAvatar, fetchMyCoupons, changePasswordThunk } from "../redux/slices/profileSlice";
import { fetchMyOrders } from "../redux/slices/ordersSlice";

export default function Profile() {
  const ctxUser = useAppSelector(selectUser);
  const profileFromStore = useAppSelector(state => state.profile.me);
  const dispatch = useAppDispatch();

  const [profile, setProfile] = useState(profileFromStore ?? null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [ordersPage, setOrdersPage] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPageIndex, setOrdersPageIndex] = useState(0);

  const [activeTab, setActiveTab] = useState("account");
  const [showProfileDeleteConfirm, setShowProfileDeleteConfirm] = useState(false);
  const [showChangePwdModal, setShowChangePwdModal] = useState(false);


  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const role = (profile && profile.role) ? profile.role : (ctxUser && ctxUser.role ? ctxUser.role : null);
  const isAdmin = role === "ADMIN";


  useEffect(() => {
    if (profileFromStore) setProfile(profileFromStore);
  }, [profileFromStore]);

  useEffect(() => {
    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const p = await dispatch(fetchMyProfile()).unwrap();

        if (p) dispatch(setUser(p));
        try { await dispatch(refreshProfile()).unwrap(); } catch {}
      } catch (err) {
        console.error("No se pudo cargar perfil:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    if (!profileFromStore) loadProfile();
  }, [dispatch, profileFromStore]);

  useEffect(() => {
    if (!isAdmin) {
      loadOrders(0, 10);
    } else {
      setOrdersPage(null);
    }

    dispatch(fetchMyCoupons());

  }, [profile, isAdmin, dispatch]);


  async function loadOrders(page = 0, size = 10) {
    setOrdersLoading(true);
    try {
      const pageRes = await dispatch(fetchMyOrders({ page, size })).unwrap();
      setOrdersPage(pageRes);
      setOrdersPageIndex(Math.max(0, Number(page) || 0));
    } catch (err) {
      console.error("Error cargando órdenes:", err);
      showToast({ type: "error", text: "No se pudieron cargar las órdenes." });
    } finally {
      setOrdersLoading(false);
    }
  }


  function showToast({ type = "success", text = "" } = {}) {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
    setToast({ type, text });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3500);
  }


  async function handleSaveAccount(updated) {
    if (!profile) return;
    try {
      const resp = await dispatch(updateMyUser({ userId: profile.id, dto: updated })).unwrap();

      const p = await dispatch(fetchMyProfile()).unwrap();
      if (p) dispatch(setUser(p));
      showToast({ type: "success", text: "Perfil actualizado correctamente." });
    } catch (err) {
      console.error("Error actualizando perfil:", err);
      showToast({ type: "error", text: err?.message || "Error al actualizar perfil." });
    }
  }

  async function handleUploadAvatar(file) {
    if (!profile) return;
    try {
      await dispatch(uploadAvatar({ userId: profile.id, file })).unwrap();
      const p = await dispatch(fetchMyProfile()).unwrap();
      if (p) dispatch(setUser(p));
      showToast({ type: "success", text: "Avatar subido." });
    } catch (err) {
      console.error("Error subiendo avatar:", err);
      showToast({ type: "error", text: "Error subiendo avatar." });
    }
  }

  async function handleReplaceAvatar(file) {
    if (!profile) return;
    try {
      await dispatch(replaceAvatar({ userId: profile.id, file })).unwrap();
      const p = await dispatch(fetchMyProfile()).unwrap();
      if (p) dispatch(setUser(p));
      showToast({ type: "success", text: "Avatar reemplazado." });
    } catch (err) {
      console.error("Error reemplazando avatar:", err);
      showToast({ type: "error", text: "Error reemplazando avatar." });
    }
  }

  async function handleDeleteAvatar() {
    if (!profile) return;
    try {
      await dispatch(deleteAvatar(profile.id)).unwrap();
      const p = await dispatch(fetchMyProfile()).unwrap();
      if (p) dispatch(setUser(p));
      showToast({ type: "success", text: "Avatar eliminado." });
    } catch (err) {
      console.error("Error eliminando avatar:", err);
      showToast({ type: "error", text: "Error eliminando avatar." });
    }
  }

  async function handleChangePassword(dto) {
    try {
      await dispatch(changePasswordThunk(dto)).unwrap();
      showToast({ type: "success", text: "Contraseña cambiada correctamente." });
    } catch (err) {
      console.error("Error al cambiar contraseña:", err);
      showToast({ type: "error", text: err?.message || "Error cambiando contraseña." });
    }
  }

  async function handleSaveReview(orderId, orderItemId, data, existingReview = null) {
    try {
      showToast({ type: "success", text: existingReview ? "Reseña actualizada." : "Reseña publicada." });

      await loadOrders(ordersPageIndex, 10);
    } catch (err) {
      console.warn("handleSaveReview: error refreshing orders", err);
    }
  }

  async function handleDeleteReview(reviewId) {
    try {
      showToast({ type: "success", text: "Reseña eliminada." });
      await loadOrders(ordersPageIndex, 10);
    } catch (err) {
      console.warn("handleDeleteReview: error refreshing orders", err);
    }
  }

  function handleConfirmDeleteProfile() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userProfile");
    setShowProfileDeleteConfirm(false);
    setProfile(null);
    setOrdersPage(null);
    try { dispatch(logoutAction()); } catch { window.location.reload(); }
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

  const toastContainerStyle = {
    position: "fixed",
    top: 16,
    right: 16,
    zIndex: 9999,
    minWidth: 220,
    maxWidth: 360
  };
  const toastBase = {
    padding: "10px 14px",
    borderRadius: 8,
    color: "#fff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    fontSize: 14
  };

  return (
    <div className="profile-page">
      <main className="app-container">
        <h1>Mi perfil</h1>

        {toast && (
          <div style={toastContainerStyle} aria-live="polite" aria-atomic="true">
            <div style={{
              ...toastBase,
              background: toast.type === "success" ? "#28a745" : "#dc3545"
            }}>
              {toast.text}
            </div>
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
                {!isAdmin && (
                  <div className="small">Saldo: <span style={{ color: "#e6dbff" }}>${profile.buyerBalance ?? 0}</span></div>
                )}
              </div>
            </div>

            <nav className="profile-menu">
              <button className={activeTab === "account" ? "active" : ""} onClick={() => setActiveTab("account")}>Configuración de cuenta</button>
              {!isAdmin && (
                <button className={activeTab === "orders" ? "active" : ""} onClick={() => setActiveTab("orders")}>Mis órdenes</button>
              )}
              {!isAdmin && (
                <button className={activeTab === "coupons" ? "active" : ""} onClick={() => setActiveTab("coupons")}>Mis cupones</button>
              )}
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

            {activeTab === "orders" && !isAdmin && (
              <>
                {ordersLoading && <div className="text-muted">Cargando órdenes...</div>}
                {!ordersLoading && ordersPage && (
                  <OrdersTab
                    ordersPage={ordersPage}
                    onPageChange={(newPage) => loadOrders(newPage - 1, 10)}
                    onSaveReview={handleSaveReview}
                    onDeleteReview={handleDeleteReview}
                  />
                )}
                {!ordersLoading && !ordersPage && <div className="text-muted">No se encontraron órdenes.</div>}
              </>
            )}

            {activeTab === "coupons" && !isAdmin && (
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
