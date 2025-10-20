// Datos falsos para desarrollo - Simulan la respuesta del backend

export const mockUsers = [
  {
    id: 1,
    displayName: "Carlos Mendoza",
    firstName: "Carlos",
    lastName: "Mendoza",
    email: "carlos.mendoza@example.com",
    role: "BUYER",
    phone: "+54 11 1234-5678",
    country: "Argentina",
    active: true,
    createdAt: "2023-01-15T10:30:00Z",
    lastLogin: "2024-01-10T14:20:00Z",
    buyerBalance: 150.75,
    avatarDataUrl: null
  },
  {
    id: 2,
    displayName: "Sofía Ramírez",
    firstName: "Sofía",
    lastName: "Ramírez",
    email: "sofia.ramirez@example.com",
    role: "SELLER",
    sellerDescription: "Vendedor de juegos digitales con 5 años de experiencia",
    phone: "+54 11 8765-4321",
    country: "Argentina",
    active: true,
    createdAt: "2023-02-20T09:15:00Z",
    lastLogin: "2024-01-09T16:45:00Z",
    sellerRating: 4.8,
    avatarDataUrl: null
  },
  {
    id: 3,
    displayName: "Admin Principal",
    firstName: "Diego",
    lastName: "Herrera",
    email: "admin@keyshaven.com",
    role: "ADMIN",
    phone: "+54 11 5555-5555",
    country: "Argentina",
    active: true,
    createdAt: "2022-11-05T08:00:00Z",
    lastLogin: "2024-01-11T10:15:00Z",
    avatarDataUrl: null
  },
  {
    id: 4,
    displayName: "Isabella Torres",
    firstName: "Isabella",
    lastName: "Torres",
    email: "isabella.torres@example.com",
    role: "BUYER",
    phone: "+54 11 9999-8888",
    country: "Argentina",
    active: false,
    createdAt: "2023-03-10T11:20:00Z",
    lastLogin: "2023-12-15T09:30:00Z",
    buyerBalance: 75.50,
    avatarDataUrl: null
  }
];

export const mockProducts = [
  {
    id: 1,
    sellerId: 2,
    sellerDisplayName: "Sofía Ramírez",
    sku: "CP2077-PC-GLOBAL",
    title: "Cyberpunk 2077",
    description: "Un RPG de acción y aventura en un mundo abierto futurista",
    price: 49.99,
    currency: "USD",
    categories: [
      { id: 1, description: "RPG", productCount: 45, featured: true },
      { id: 4, description: "Aventura", productCount: 22, featured: false }
    ],
    active: true,
    createdAt: "2023-05-10T08:00:00Z",
    updatedAt: "2024-01-10T14:30:00Z",
    platform: "PC",
    region: "Global",
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 5,
    releaseDate: "2020-12-10",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    metacriticScore: 86,
    availableStock: 45,
    imageUrls: [
      "https://images.ctfassets.net/rporu91m20dc/2m1K8n8FnYdksbWnTK96AV/1c59bb4d2c16b5c664ad0d6e8381e15f/Cyberpunk_2077_Key_Art.jpg"
    ],
    featured: true
  },
  {
    id: 2,
    sellerId: 2,
    sellerDisplayName: "Sofía Ramírez",
    sku: "WITCHER3-PC-GLOBAL",
    title: "The Witcher 3: Wild Hunt",
    description: "RPG de mundo abierto en un universo de fantasía oscura",
    price: 39.99,
    currency: "USD",
    categories: [
      { id: 1, description: "RPG", productCount: 45, featured: true }
    ],
    active: true,
    createdAt: "2023-04-15T10:20:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    platform: "PC",
    region: "Global",
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 3,
    releaseDate: "2015-05-19",
    developer: "CD Projekt Red",
    publisher: "CD Projekt",
    metacriticScore: 93,
    availableStock: 32,
    imageUrls: [
      "https://images.ctfassets.net/rporu91m20dc/3c6lq4QKkkuMy4y2cG2qIo/4f1c8916c56e0c0f0738fd55b8c86b5d/Witcher_3_Key_Art.jpg"
    ],
    featured: true
  },
  {
    id: 3,
    sellerId: 5,
    sellerDisplayName: "Gamer Shop",
    sku: "RDR2-PC-GLOBAL",
    title: "Red Dead Redemption 2",
    description: "Historia épica del Salvaje Oeste americano",
    price: 59.99,
    currency: "USD",
    categories: [
      { id: 4, description: "Aventura", productCount: 22, featured: false },
      { id: 1, description: "RPG", productCount: 45, featured: true }
    ],
    active: true,
    createdAt: "2023-06-20T09:15:00Z",
    updatedAt: "2024-01-05T11:30:00Z",
    platform: "PC",
    region: "Global",
    minPurchaseQuantity: 1,
    maxPurchaseQuantity: 2,
    releaseDate: "2019-11-05",
    developer: "Rockstar Games",
    publisher: "Rockstar Games",
    metacriticScore: 93,
    availableStock: 28,
    imageUrls: [],
    featured: false
  }
];

export const mockCategories = [
  { id: 1, description: "RPG", productCount: 45, featured: true },
  { id: 2, description: "FPS", productCount: 32, featured: true },
  { id: 3, description: "Estrategia", productCount: 28, featured: false },
  { id: 4, description: "Aventura", productCount: 22, featured: false },
  { id: 5, description: "Deportes", productCount: 18, featured: false },
  { id: 6, description: "Indie", productCount: 15, featured: true }
];

export const mockDiscounts = [
  {
    id: 1,
    code: "VERANO20",
    type: "PERCENTAGE",
    value: 20,
    scope: "CATEGORY",
    targetProductId: null,
    targetCategoryId: 1,
    targetSellerId: null,
    minQuantity: null,
    maxQuantity: null,
    startsAt: "2024-01-01T00:00:00Z",
    endsAt: "2024-02-01T23:59:59Z",
    minPrice: null,
    maxPrice: null,
    active: true,
    createdAt: "2024-01-01T10:00:00Z",
    expiresAt: null,
    targetBuyerId: null
  },
  {
    id: 2,
    code: "FPS15",
    type: "PERCENTAGE",
    value: 15,
    scope: "CATEGORY",
    targetProductId: null,
    targetCategoryId: 2,
    targetSellerId: null,
    minQuantity: 1,
    maxQuantity: 5,
    startsAt: "2024-01-15T00:00:00Z",
    endsAt: "2024-03-15T23:59:59Z",
    minPrice: 20.00,
    maxPrice: 100.00,
    active: true,
    createdAt: "2024-01-10T14:30:00Z",
    expiresAt: null,
    targetBuyerId: null
  }
];

export const mockDigitalKeys = [
  {
    id: 1,
    productId: 1,
    keyCode: "CP2077-ABC123-DEF456",
    keyMask: "XXXXXX-XXXXXX-XXXXXX",
    used: false,
    createdAt: "2024-01-10T10:30:00Z",
    usedAt: null
  },
  {
    id: 2,
    productId: 1,
    keyCode: "CP2077-GHI789-JKL012",
    keyMask: "XXXXXX-XXXXXX-XXXXXX",
    used: true,
    createdAt: "2024-01-09T15:45:00Z",
    usedAt: "2024-01-11T14:20:00Z"
  },
  {
    id: 3,
    productId: 2,
    keyCode: "WITCHER3-MNO345-PQR678",
    keyMask: "XXXXXXXX-XXXXXXXX-XXXXXXXX",
    used: false,
    createdAt: "2024-01-08T09:15:00Z",
    usedAt: null
  }
];

export const mockSellerDiscounts = [
  {
    id: 1,
    code: "SELLER10",
    type: "PERCENTAGE",
    value: 10,
    scope: "SELLER",
    targetProductId: null,
    targetCategoryId: null,
    targetSellerId: 2,
    minQuantity: null,
    maxQuantity: null,
    startsAt: "2024-01-01T00:00:00Z",
    endsAt: "2024-12-31T23:59:59Z",
    minPrice: null,
    maxPrice: null,
    active: true,
    createdAt: "2024-01-01T09:00:00Z",
    expiresAt: null,
    targetBuyerId: null
  },
  {
    id: 2,
    code: "CYBERPUNK15",
    type: "PERCENTAGE",
    value: 15,
    scope: "PRODUCT",
    targetProductId: 1,
    targetCategoryId: null,
    targetSellerId: 2,
    minQuantity: 1,
    maxQuantity: 1,
    startsAt: "2024-01-15T00:00:00Z",
    endsAt: "2024-02-15T23:59:59Z",
    minPrice: null,
    maxPrice: null,
    active: true,
    createdAt: "2024-01-14T14:30:00Z",
    expiresAt: null,
    targetBuyerId: null
  }
];

export const mockOrders = [
  {
    id: 1001,
    customerName: "Juan Pérez",
    productName: "Cyberpunk 2077",
    amount: 49.99,
    date: "2024-01-10T14:30:00Z",
    status: "completed"
  },
  {
    id: 1002,
    customerName: "María García",
    productName: "The Witcher 3",
    amount: 39.99,
    date: "2024-01-09T16:45:00Z",
    status: "completed"
  },
  {
    id: 1003,
    customerName: "Carlos López",
    productName: "Cyberpunk 2077",
    amount: 49.99,
    date: "2024-01-08T11:20:00Z",
    status: "completed"
  }
];

export const mockPlatformMetrics = {
  uptime: 96.8,
  responseTime: 1.2,
  dailyVisits: 1245,
  platformRating: 4.8,
  activeSupport: 8,
  incidents: 0
};

export const mockRecentActivity = [
  {
    id: 1,
    type: 'user',
    action: 'Nuevo usuario registrado',
    user: 'usuario123',
    time: new Date(Date.now() - 2 * 60 * 1000).toISOString()
  },
  {
    id: 2,
    type: 'order',
    action: 'Orden completada',
    user: 'cliente456',
    amount: '$49.99',
    time: new Date(Date.now() - 5 * 60 * 1000).toISOString()
  },
  {
    id: 3,
    type: 'product',
    action: 'Producto agregado',
    user: 'vendedor789',
    product: 'Cyberpunk 2077',
    time: new Date(Date.now() - 10 * 60 * 1000).toISOString()
  }
];