import React from "react";


export default function ImageCarousel({ images = [], activeIndex = 0, setActiveIndex = () => {} }) {
  if (!images || images.length === 0) return null;

  const active = images[activeIndex];

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div>
      <div className="image-hero card shadow-sm" style={{ backgroundImage: `url(${active.dataUrl || active.file})` }}>
        <button className="carousel-arrow left" onClick={prev} aria-label="Anterior">‹</button>
        <button className="carousel-arrow right" onClick={next} aria-label="Siguiente">›</button>

        <div className="dots">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`dot ${idx === activeIndex ? "active" : ""}`}
              onClick={() => setActiveIndex(idx)}
              title={`Ver imagen ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="thumb-strip mt-2">
          {images.map((img, idx) => (
            <img
              key={img.id}
              className={`thumb ${idx === activeIndex ? "active" : ""}`}
              src={img.dataUrl || img.file}
              alt={img.name}
              onClick={() => setActiveIndex(idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
