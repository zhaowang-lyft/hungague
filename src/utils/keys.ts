export function makeOrderKey(restaurantName: string, date: string): string {
  const slug = restaurantName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '')
  return `${slug}_${date}`
}
