import type { DishRating, OrderRecord } from './schema'

export function getOrderAvgRating(order: OrderRecord): number {
  const ratings = Object.values(order.items).map(d => d.rating).filter(r => r > 0)
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r, 0) / ratings.length
}

export function getRestaurantAvgRating(
  restaurantName: string,
  allOrders: Record<string, OrderRecord>,
): number {
  const allRatings: number[] = []
  for (const order of Object.values(allOrders)) {
    if (order.restaurantName !== restaurantName) continue
    for (const dish of Object.values(order.items)) {
      if (dish.rating > 0) allRatings.push(dish.rating)
    }
  }
  if (allRatings.length === 0) return 0
  return allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
}

export function getRestaurantOrderCount(
  restaurantName: string,
  allOrders: Record<string, OrderRecord>,
): number {
  return Object.values(allOrders).filter(o => o.restaurantName === restaurantName).length
}

export function getDishRatings(
  restaurantName: string,
  allOrders: Record<string, OrderRecord>,
): Record<string, DishRating[]> {
  const result: Record<string, DishRating[]> = {}
  for (const order of Object.values(allOrders)) {
    if (order.restaurantName !== restaurantName) continue
    for (const [dishName, rating] of Object.entries(order.items)) {
      if (rating.rating > 0) {
        ;(result[dishName] ??= []).push(rating)
      }
    }
  }
  return result
}

export function getAllDishRatings(
  allOrders: Record<string, OrderRecord>,
): Record<string, DishRating[]> {
  const result: Record<string, DishRating[]> = {}
  for (const order of Object.values(allOrders)) {
    for (const [dishName, rating] of Object.entries(order.items)) {
      if (rating.rating > 0) {
        ;(result[dishName] ??= []).push(rating)
      }
    }
  }
  return result
}

export function getOrderRatedDishSummary(order: OrderRecord): { name: string; rating: number; comment: string }[] {
  return Object.entries(order.items)
    .filter(([, d]) => d.rating > 0)
    .map(([name, d]) => ({ name, rating: d.rating, comment: d.comment }))
}

export function getDishAvgRating(ratings: DishRating[]): number {
  if (ratings.length === 0) return 0
  return ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
}

export function getDishLatestComment(ratings: DishRating[]): string {
  for (let i = ratings.length - 1; i >= 0; i--) {
    if (ratings[i].comment.trim()) return ratings[i].comment
  }
  return ''
}
