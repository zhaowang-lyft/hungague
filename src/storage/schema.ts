export interface DishRating {
  rating: number       // 0-5, increments of 0.5
  comment: string
}

export interface OrderRecord {
  restaurantName: string
  orderedAt: string    // "YYYY-MM-DD"
  ratedAt: string      // ISO timestamp of last edit
  items: Record<string, DishRating>  // key = dish name
}

// chrome.storage.sync shape:
// { "orders": { [key: string]: OrderRecord } }
// key format: "BlackCamel_2026-03-13" or "BlackCamel_2026-03-13_2" for duplicates
