import { render, h } from 'preact'
import { OrderRatingPanel } from '../components/OrderRatingPanel'
import { RestaurantBadge } from '../components/RestaurantBadge'
import { DishBadge } from '../components/DishBadge'
import { OrderCardSummary } from '../components/OrderCardSummary'
import { PriceFilter } from '../components/PriceFilter'
import { GoogleRatingBadge } from '../components/GoogleRatingBadge'
import googleData from '../data/restaurants.json'
import { getAllOrders } from '../storage/orders'
import {
  getRestaurantAvgRating,
  getRestaurantOrderCount,
  getAllDishRatings,
  getOrderAvgRating,
  getOrderRatedDishSummary,
} from '../storage/ratings'
import { makeOrderKey } from '../utils/keys'
import type { DishRating } from '../storage/schema'
import { SELECTORS } from './selectors'

function getCleanText(el: Element): string {
  const clone = el.cloneNode(true) as Element
  clone.querySelectorAll('[data-hhr-badge], [data-hhr-dish-badge], [data-hhr-google-badge]').forEach(b => b.remove())
  return clone.textContent?.trim() ?? ''
}

export function injectOrderRatingPanel(modalBox: HTMLElement) {
  const nameEl = modalBox.querySelector('h1')
  const restaurantName = nameEl?.textContent?.trim()
  if (!restaurantName) return

  let orderDate = ''
  const headings = modalBox.querySelectorAll('h2')
  for (const h2 of headings) {
    if (h2.textContent?.includes('Order Date')) {
      const sibling = h2.nextElementSibling
      if (sibling) {
        const rawDate = sibling.textContent?.trim() ?? ''
        // Normalize: extract YYYY-MM-DD from formats like "2026-03-27 ▪ 11:45 AM"
        const dateMatch = rawDate.match(/\d{4}-\d{2}-\d{2}/)
        orderDate = dateMatch ? dateMatch[0] : rawDate
      }
      break
    }
  }
  if (!orderDate) return

  const dishNames: string[] = []
  const itemCells = modalBox.querySelectorAll('table.no-border-table td div.col-12 p')
  for (const cell of itemCells) {
    const innerP = cell.querySelector('p')
    const name = (innerP ?? cell).textContent?.trim()
    if (name && !dishNames.includes(name)) {
      dishNames.push(name)
    }
  }
  if (dishNames.length === 0) return

  // Vue sets a fixed height + overflow:hidden on .v--modal-box — override both
  // so our rating panel isn't clipped
  modalBox.style.overflowY = 'auto'
  modalBox.style.height = 'auto'
  modalBox.style.maxHeight = '90vh'

  const container = document.createElement('div')
  container.setAttribute('data-hhr-panel', 'true')
  const modalContainer = modalBox.querySelector('.modal--container')
  if (modalContainer) {
    modalContainer.appendChild(container)
  } else {
    modalBox.appendChild(container)
  }

  render(
    h(OrderRatingPanel, { restaurantName, orderDate, dishNames }),
    container,
  )

  return container
}

export function cleanupOrderRatingPanel(modalBox: HTMLElement) {
  const container = modalBox.querySelector('[data-hhr-panel]')
  if (container) {
    render(null, container)
    container.remove()
  }
}

export async function injectRestaurantBadges() {
  const allOrders = await getAllOrders()
  const cards = document.querySelectorAll(SELECTORS.restaurantCards)

  for (const card of cards) {
    const titleEl = card.querySelector('h5.restaurant-title') as HTMLElement | null
    if (!titleEl) continue
    if (titleEl.querySelector('[data-hhr-badge]')) continue

    const name = getCleanText(titleEl)
    if (!name) continue

    const avg = getRestaurantAvgRating(name, allOrders)
    const count = getRestaurantOrderCount(name, allOrders)
    if (count === 0 || avg === 0) continue

    const badgeContainer = document.createElement('span')
    badgeContainer.setAttribute('data-hhr-badge', 'true')
    titleEl.appendChild(badgeContainer)

    render(h(RestaurantBadge, { avgRating: avg, orderCount: count }), badgeContainer)
  }
}

const googleRestaurants = googleData as Record<string, {
  googleRating: number | null
  reviewCount: number
  googleMapsUrl: string | null
  distanceKm: number | null
}>

// Build a case-insensitive lookup map
const googleLookup = new Map<string, (typeof googleRestaurants)[string]>()
for (const [key, val] of Object.entries(googleRestaurants)) {
  googleLookup.set(key.toLowerCase(), val)
}

export function injectGoogleBadges() {
  const cards = document.querySelectorAll(SELECTORS.restaurantCards)

  for (const card of cards) {
    const titleEl = card.querySelector('h5.restaurant-title') as HTMLElement | null
    if (!titleEl) continue
    if (titleEl.querySelector('[data-hhr-google-badge]')) continue

    const name = getCleanText(titleEl)
    if (!name) continue

    const info = googleLookup.get(name.toLowerCase())
    if (!info || !info.googleRating) continue

    const badgeContainer = document.createElement('span')
    badgeContainer.setAttribute('data-hhr-google-badge', 'true')
    titleEl.appendChild(badgeContainer)

    render(h(GoogleRatingBadge, {
      googleRating: info.googleRating,
      reviewCount: info.reviewCount,
      googleMapsUrl: info.googleMapsUrl,
      distanceKm: info.distanceKm,
    }), badgeContainer)
  }
}

export async function injectDishBadges() {
  const allOrders = await getAllOrders()
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (!menuEl) return

  // Build a map of ALL dish ratings across all restaurants
  const allDishRatings = getAllDishRatings(allOrders)

  const menuItems = document.querySelectorAll(SELECTORS.menuItemTitle)
  for (const item of menuItems) {
    if ((item as HTMLElement).querySelector('[data-hhr-dish-badge]')) continue

    const dishName = getCleanText(item)
    if (!dishName) continue

    const ratings: DishRating[] = allDishRatings[dishName] ?? []
    if (ratings.length === 0) continue

    const badgeContainer = document.createElement('span')
    badgeContainer.setAttribute('data-hhr-dish-badge', 'true')
    item.appendChild(badgeContainer)

    render(h(DishBadge, { ratings }), badgeContainer)
  }
}

function parsePrice(el: Element): number | null {
  const text = el.textContent?.trim() ?? ''
  const match = text.match(/\$(\d+(?:\.\d+)?)/)
  return match ? parseFloat(match[1]) : null
}

function applyPriceFilter(min: number | null, max: number | null) {
  const menuItems = document.querySelectorAll(SELECTORS.menuItem)
  for (const item of menuItems) {
    const priceEl = item.querySelector(SELECTORS.menuItemPrice)
    const li = item as HTMLElement
    if (!priceEl) {
      // No price (e.g. "Sold Out") — hide if any filter is active
      li.style.display = (min !== null || max !== null) ? 'none' : ''
      continue
    }
    const price = parsePrice(priceEl)
    if (price === null) {
      li.style.display = (min !== null || max !== null) ? 'none' : ''
      continue
    }
    const aboveMin = min === null || price >= min
    const belowMax = max === null || price <= max
    li.style.display = (aboveMin && belowMax) ? '' : 'none'
  }
}

export function injectPriceFilter() {
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (!menuEl) return
  if (menuEl.querySelector('[data-hhr-price-filter]')) return

  const container = document.createElement('div')
  container.setAttribute('data-hhr-price-filter', 'true')
  menuEl.insertBefore(container, menuEl.firstChild)

  render(
    h(PriceFilter, {
      onFilterChange: (min: number | null, max: number | null) => {
        applyPriceFilter(min, max)
      },
    }),
    container,
  )
}

export function cleanupPriceFilter() {
  document.querySelectorAll('[data-hhr-price-filter]').forEach(el => {
    render(null, el)
    el.remove()
  })
  // Restore visibility on all menu items
  const menuItems = document.querySelectorAll(SELECTORS.menuItem)
  for (const item of menuItems) {
    (item as HTMLElement).style.display = ''
  }
}

export async function injectOrderCardRatings() {
  const allOrders = await getAllOrders()
  const cards = document.querySelectorAll(SELECTORS.orderCard)

  for (const card of cards) {
    if (card.querySelector('[data-hhr-card-summary]')) continue

    const dateEl = card.querySelector(SELECTORS.orderCardDate)
    const nameEl = card.querySelector(SELECTORS.orderCardRestaurantName)
    if (!dateEl || !nameEl) continue

    const rawDate = dateEl.textContent?.trim() ?? ''
    const name = nameEl.textContent?.trim() ?? ''
    if (!rawDate || !name) continue

    // Date format may be "2026-03-27" or "2026-03-27 ▪ 11:45 AM" — extract YYYY-MM-DD
    const dateMatch = rawDate.match(/\d{4}-\d{2}-\d{2}/)
    const date = dateMatch ? dateMatch[0] : rawDate
    const key = makeOrderKey(name, date)
    const order = allOrders[key]
    if (!order) continue

    const dishes = getOrderRatedDishSummary(order)
    if (dishes.length === 0) continue

    const avg = getOrderAvgRating(order)

    const container = document.createElement('div')
    container.setAttribute('data-hhr-card-summary', 'true')

    // Insert after the row containing date/name/status
    const cardBody = card.querySelector('.card-body')
    if (cardBody) {
      cardBody.appendChild(container)
    } else {
      card.appendChild(container)
    }

    render(h(OrderCardSummary, { dishes, avgRating: avg }), container)
  }
}
