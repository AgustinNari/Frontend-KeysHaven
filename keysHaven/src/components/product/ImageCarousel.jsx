import React from "react";


export default function ImageCarousel({ images = [], activeIndex = 0, setActiveIndex = () => {} }) {
  if (!images || images.length === 0) return null;

  const selectedIndex = Math.max(0, Math.min(activeIndex, images.length - 1));
  const active = images[selectedIndex];

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div className="product-gallery" role="region" aria-label="Galería del producto">
      <div className="image-hero card shadow-sm">
        <img className="gallery-image" src={active.dataUrl || active.file} alt={active.name || `Imagen ${selectedIndex + 1} del producto`} />
        {images.length > 1 && <>
        <button className="carousel-arrow left" onClick={prev} aria-label="Anterior">‹</button>
        <button className="carousel-arrow right" onClick={next} aria-label="Siguiente">›</button>

        <div className="dots">
          {images.map((_, idx) => (
            <button
              type="button"
              key={images[idx].id ?? idx}
              className={`dot ${idx === selectedIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Ver imagen ${idx + 1}`}
              aria-pressed={idx === selectedIndex}
              title={`Ver imagen ${idx + 1}`}
            />
          ))}
        </div>
        </>}
      </div>

      {images.length > 1 && (
        <div className="thumb-strip mt-2">
          {images.map((img, idx) => (
            <button
              type="button"
              key={img.id ?? idx}
              className={`gallery-thumb ${idx === selectedIndex ? "active" : ""}`}
              aria-label={`Seleccionar imagen ${idx + 1}: ${img.name || "Producto"}`}
              aria-pressed={idx === selectedIndex}
              onClick={() => setActiveIndex(idx)}
            ><img src={img.dataUrl || img.file} alt="" /></button>
          ))}
        </div>
      )}
    </div>
  );
}
