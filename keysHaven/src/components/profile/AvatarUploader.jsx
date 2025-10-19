import React, { useRef, useState } from "react";
import ConfirmModal from "./ConfirmModal";

export default function AvatarUploader({ avatarDataUrl, onUpload, onReplace, onDelete }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  function handleFileChange(e) {
    const f = e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setPreview(ev.target.result);
    };
    reader.readAsDataURL(f);
  }

  function triggerUpload() {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    onUpload(f);
    setPreview(null);
    fileRef.current.value = "";
  }

  function triggerReplace() {
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    onReplace(f);
    setPreview(null);
    fileRef.current.value = "";
  }

  return (
    <div>
      <div className="avatar-box">
        <div className="avatar-preview">
          <img src={preview ?? avatarDataUrl ?? "/src/assets/doppyKnight/homeImage.png"} alt="avatar" />
        </div>
      </div>

      <div className="mt-2 d-flex gap-2">
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} />
        {preview ? (
          <>
            <button className="btn btn-primary" onClick={triggerUpload}>Subir</button>
            <button className="btn btn-outline-primary" onClick={triggerReplace}>Reemplazar</button>
            <button className="btn btn-light" onClick={() => { setPreview(null); fileRef.current.value = ""; }}>Cancelar</button>
          </>
        ) : (
          <>
            <button className="btn btn-outline-primary" onClick={() => fileRef.current?.click()}>Seleccionar</button>
            <button className="btn btn-danger" onClick={() => setShowConfirmDelete(true)} disabled={!avatarDataUrl}>Eliminar</button>
          </>
        )}
      </div>

      <ConfirmModal
        show={showConfirmDelete}
        title="Eliminar avatar"
        message="¿Estás seguro? Esta acción eliminará tu foto de perfil."
        onCancel={() => setShowConfirmDelete(false)}
        onConfirm={() => { setShowConfirmDelete(false); onDelete(); }}
        confirmText="Sí, eliminar"
      />
    </div>
  );
}
