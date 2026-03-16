import { SELECTORS } from './selectors'
import {
  injectOrderRatingPanel,
  cleanupOrderRatingPanel,
  injectRestaurantBadges,
  injectDishBadges,
  injectOrderCardRatings,
} from './injector'

const INJECTED_ATTR = 'data-hhr-injected'

function refreshOrderCardRatings() {
  // Remove existing summaries so they get re-rendered with fresh data
  document.querySelectorAll('[data-hhr-card-summary]').forEach(el => {
    render(null, el)
    el.remove()
  })
  injectOrderCardRatings()
}

// Need render for cleanup
import { render } from 'preact'

function isOrdersPage(): boolean {
  return location.pathname.includes('/orders')
}

function isRestaurantPage(): boolean {
  return location.pathname === '/' || location.pathname.includes('/restaurant')
}

// --- Orders page: card ratings + modal detection ---
function observeOrdersPage() {
  injectOrderCardRatings()

  // Re-inject when order list changes (pagination, filtering)
  const orderList = document.querySelector('[data-v-435ac1cc]')
  if (orderList) {
    const listObserver = new MutationObserver(() => {
      injectOrderCardRatings()
    })
    listObserver.observe(orderList, { childList: true, subtree: true })
  }

  observeOrderModal()
}

function observeOrderModal() {
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector(SELECTORS.orderDetailModal)
    if (!overlay) return

    const modalBoxEl = overlay.querySelector(SELECTORS.orderDetailModalBox) as HTMLElement | null
    if (!modalBoxEl) return
    if (modalBoxEl.getAttribute(INJECTED_ATTR) === 'true') return
    const modalBox = modalBoxEl

    modalBox.setAttribute(INJECTED_ATTR, 'true')
    injectOrderRatingPanel(modalBox)

    // Watch for modal removal to clean up
    const removalObserver = new MutationObserver(() => {
      if (!document.contains(overlay)) {
        removalObserver.disconnect()
      }
    })
    removalObserver.observe(document.body, { childList: true, subtree: true })

    function onModalClose() {
      cleanupOrderRatingPanel(modalBox)
      // Re-inject order card ratings to reflect any new/updated ratings
      refreshOrderCardRatings()
    }

    // Handle close button
    const closeBtn = modalBox.querySelector(SELECTORS.modalCloseButton)
    if (closeBtn) {
      closeBtn.addEventListener('click', onModalClose, { once: true })
    }

    // Handle backdrop click
    const bgClick = overlay.querySelector('.v--modal-background-click')
    if (bgClick) {
      bgClick.addEventListener(
        'click',
        (e: Event) => {
          if (e.target === bgClick) {
            onModalClose()
          }
        },
        { once: true },
      )
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// --- Restaurant page: badge injection ---
let menuObserverAttached = false

function attachMenuObserver() {
  if (menuObserverAttached) return
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (!menuEl) return

  menuObserverAttached = true
  const menuObserver = new MutationObserver(() => {
    injectRestaurantBadges()
    injectDishBadges()
  })
  menuObserver.observe(menuEl, { childList: true, subtree: true })

  // Inject immediately for the current menu content
  injectDishBadges()
}

function observeRestaurantPage() {
  // Initial injection for cards (always visible)
  injectRestaurantBadges()

  // Try attaching menu observer if menu already exists
  attachMenuObserver()

  // Observe body for #restaurantMenu to appear (user clicks "Order Lunch")
  const bodyObserver = new MutationObserver(() => {
    injectRestaurantBadges()
    const menuEl = document.querySelector(SELECTORS.restaurantMenu)
    if (menuEl) {
      attachMenuObserver()
      // Also inject dish badges when menu content changes after initial load
      injectDishBadges()
    }
  })
  bodyObserver.observe(document.body, { childList: true, subtree: true })
}

// --- SPA route change detection ---
function observeRouteChanges() {
  let lastPath = location.pathname
  const routeObserver = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname
      init()
    }
  })
  routeObserver.observe(document.body, { childList: true, subtree: true })
}

function init() {
  if (isOrdersPage()) {
    observeOrdersPage()
  }
  if (isRestaurantPage()) {
    observeRestaurantPage()
  }
}

// Start
init()
observeRouteChanges()
