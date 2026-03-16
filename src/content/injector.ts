import { render, h } from 'preact'
import { OrderRatingPanel } from '../components/OrderRatingPanel'
import { RestaurantBadge } from '../components/RestaurantBadge'
import { DishBadge } from '../components/DishBadge'
import { getAllOrders } from '../storage/orders'
import {
  getRestaurantAvgRating,
  getRestaurantOrderCount,
  getDishRatings,
} from '../storage/ratings'
import type { DishRating } from '../storage/schema'
import { SELECTORS } from './selectors'

export function injectOrderRatingPanel(modalBox: HTMLElement) {
  // Extract restaurant name
  const nameEl = modalBox.querySelector('h1')
  const restaurantName = nameEl?.textContent?.trim()
  if (!restaurantName) return

  // Extract order date by finding the "Order Date:" label
  let orderDate = ''
  const headings = modalBox.querySelectorAll('h2')
  for (const h2 of headings) {
    if (h2.textContent?.includes('Order Date')) {
      const sibling = h2.nextElementSibling
      if (sibling) {
        orderDate = sibling.textContent?.trim() ?? ''
      }
      break
    }
  }
  if (!orderDate) return

  // Extract dish names from the nested table structure
  const dishNames: string[] = []
  const itemCells = modalBox.querySelectorAll('table.no-border-table td div.col-12 p')
  for (const cell of itemCells) {
    // The dish name is in a nested <p> inside the outer <p>
    const innerP = cell.querySelector('p')
    const name = (innerP ?? cell).textContent?.trim()
    if (name && !dishNames.includes(name)) {
      dishNames.push(name)
    }
  }
  if (dishNames.length === 0) return

  // Create mount point at the bottom of the modal
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

    // Skip if already injected
    if (titleEl.querySelector('.hhr-restaurant-badge')) continue

    const name = titleEl.textContent?.trim()
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

export async function injectDishBadges() {
  const allOrders = await getAllOrders()

  // Determine which restaurant is currently showing
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (!menuEl) return

  // Try to find the restaurant name from the active card or first card
  // The active restaurant is the one whose menu is currently loaded
  let restaurantName = ''
  const cards = document.querySelectorAll(SELECTORS.restaurantCards)
  for (const card of cards) {
    // Look for an active/selected state, or fall back to first card
    const titleEl = card.querySelector('h5.restaurant-title')
    if (titleEl) {
      restaurantName = titleEl.textContent?.trim() ?? ''
      break
    }
  }
  if (!restaurantName) return

  const dishRatingsMap = getDishRatings(restaurantName, allOrders)

  const menuItems = document.querySelectorAll(SELECTORS.menuItemTitle)
  for (const item of menuItems) {
    if ((item as HTMLElement).querySelector('.hhr-dish-badge')) continue

    const dishName = item.textContent?.trim()
    if (!dishName) continue

    const ratings: DishRating[] = dishRatingsMap[dishName] ?? []
    if (ratings.length === 0) continue

    const badgeContainer = document.createElement('span')
    badgeContainer.setAttribute('data-hhr-dish-badge', 'true')
    item.appendChild(badgeContainer)

    render(h(DishBadge, { ratings }), badgeContainer)
  }
}
