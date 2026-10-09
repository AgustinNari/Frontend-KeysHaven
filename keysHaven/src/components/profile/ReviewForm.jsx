import React, { useState, useEffect } from "react";

export default function ReviewForm({ initial, onSave, onCancel, onDelete }) {
  const [form, setForm] = useState({
    rating: initial?.rating ?? 10,
    title: initial?.title ?? "",
    comment: initial?.comment ?? ""
  });

  useEffect(() => {
    setForm({
      rating: initial?.rating ?? 10,
      title: initial?.title ?? "",
      comment: initial?.comment ?? ""
    });
  }, [initial]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  function submit() {
    if (!form.rating || form.rating < 1 || form.rating > 10) return alert("La puntuación debe estar entre 1 y 10");
    onSave(form);
  }

  return (
    <div className="card p-3">
      <h5>{initial ? "Editar reseña" : "Dejar reseña"}</h5>
      <div className="mt-2">
        <label className="form-label">Puntaje (1-10)</label>
        <input type="number" className="form-control" name="rating" value={form.rating} onChange={handleChange} min={1} max={10} />
      </div>
      <div className="mt-2">
        <label className="form-label">Título</label>
        <input className="form-control" name="title" value={form.title} onChange={handleChange} />
      </div>
      <div className="mt-2">
        <label className="form-label">Comentario</label>
        <textarea className="form-control" name="comment" rows={4} value={form.comment} onChange={handleChange}></textarea>
      </div>

      <div className="mt-3 d-flex gap-2 justify-content-end">
        <button className="btn btn-outline-secondary" onClick={onCancel}>Cerrar</button>
        {initial && <button className="btn btn-danger" onClick={onDelete}>Eliminar</button>}
        <button className="btn btn-primary" onClick={submit}>{initial ? "Guardar cambios" : "Publicar reseña"}</button>
      </div>
    </div>
  );
}
