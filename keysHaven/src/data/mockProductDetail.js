
export const MOCK_PRODUCT_DETAIL = {
  id: 2,
  sellerId: 10,
  sku: "GTA-V-001",
  sellerDisplayName: "CarlosR",
  title: "Grand Theft Auto V",
  description: "Gran mundo abierto con misiones épicas. Edición completa con DLCs.",
  price: 29.99,
  active: true,
  platform: "PC",
  region: "GLOBAL",
  minPurchaseQuantity: 1,
  maxPurchaseQuantity: 10,
  releaseDate: "2013-09-17",
  developer: "Rockstar North",
  publisher: "Rockstar Games",
  metacriticScore: 96,
  featured: false,
  categories: [
    { id: 1, description: "Acción" },
    { id: 5, description: "Mundo abierto" }
  ],
  bestDiscount: null,
  images: [
    { id: 11, productId: 2, name: "cover", isPrimary: true, file: "/src/assets/doppyKnight/homeImage.png", contentType: "image/png", dataUrl: "/src/assets/doppyKnight/homeImage.png" },
    { id: 12, productId: 2, name: "screenshot-1", isPrimary: false, file: "/src/assets/doppyKnight/homeImage.png", contentType: "image/png", dataUrl: "/src/assets/doppyKnight/homeImage.png" },
    { id: 13, productId: 2, name: "screenshot-2", isPrimary: false, file: "/src/assets/doppyKnight/homeImage.png", contentType: "image/png", dataUrl: "/src/assets/doppyKnight/homeImage.png" }
  ],

  reviews: [
    { id: 201, productId: 2, buyerId: 21, rating: 3, title: "Buen juego", comment: "La clave funcionó perfecto, muy divertido.", visible: true, createdAt: "2025-09-30T08:00:00Z" },
    { id: 202, productId: 2, buyerId: 34, rating: 1, title: "Excelente", comment: "Horas de diversión.", visible: true, createdAt: "2025-09-29T15:30:00Z" },
    { id: 203, productId: 2, buyerId: 55, rating: 7, title: "Bien", comment: "Buen juego aunque un poco pesado.", visible: true, createdAt: "2025-09-20T11:00:00Z" },
    { id: 204, productId: 2, buyerId: 12, rating: 1, title: "aaaa", comment: "Todo OK", visible: true, createdAt: "2025-09-15T10:00:00Z" },
    { id: 205, productId: 2, buyerId: 77, rating: 6, title: "Regular", comment: "Tuvo problemas al instalar.", visible: true, createdAt: "2025-09-12T09:00:00Z" },
    { id: 206, productId: 2, buyerId: 88, rating: 9, title: "Top", comment: "Muy recomendable.", visible: true, createdAt: "2025-09-10T18:00:00Z" }
  ],
  avgRating: 8.2,
  ratingCount: 6,
  stock: 12,
  sold: 120,
  amountSold: 140
};
