// Narxni formatlash: 12850000 -> "12 850 000"
export const fmt = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
