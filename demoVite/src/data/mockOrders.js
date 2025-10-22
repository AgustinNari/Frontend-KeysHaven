export const MOCK_ORDERS = [
  {
    id: 1001,
    buyerId: 42,
    subtotal: 59.98,
    totalAmount: 59.98,
    discountAmount: 0,
    status: "COMPLETED",
    createdAt: "2025-09-30T10:15:00Z",
    completedAt: "2025-09-30T10:16:00Z",
    notes: "Entrega inmediata",
    items: [
      {
        id: 20011,
        productId: 2,
        productTitle: "Grand Theft Auto V",
        unitPrice: 29.99,
        quantity: 2,
        lineSubtotal: 59.98,
        discountAmount: 0,
        lineTotal: 59.98,

        digitalKeys: [
          { keyCode: "GTA5-AAAA-BBBB-0001", keyMask: "GTA5-****-****-0001" },
          { keyCode: "GTA5-CCCC-DDDD-0002", keyMask: "GTA5-****-****-0002" }
        ]
      }
    ]
  },
  {
    id: 1002,
    buyerId: 42,
    subtotal: 29.99,
    totalAmount: 29.99,
    discountAmount: 0,
    status: "FULFILLED",
    createdAt: "2025-08-01T09:00:00Z",
    completedAt: "2025-08-01T09:01:00Z",
    notes: null,
    items: [
      {
        id: 20021,
        productId: 5,
        productTitle: "Hades",
        unitPrice: 29.99,
        quantity: 1,
        lineSubtotal: 29.99,
        discountAmount: 0,
        lineTotal: 29.99,
        digitalKeys: [
          { keyCode: "HADES-1111-2222-3333", keyMask: "HADES-****-****-3333" }
        ]
      }
    ]
  }
];
