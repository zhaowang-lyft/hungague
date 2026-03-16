import { SELECTORS } from './selectors'
import {
  injectOrderRatingPanel,
  cleanupOrderRatingPanel,
  injectRestaurantBadges,
  injectDishBadges,
} from './injector'

const INJECTED_ATTR = 'data-hhr-injected'

function isOrdersPage(): boolean {
  return location.pathname.includes('/orders')
}

function isRestaurantPage(): boolean {
  return location.pathname === '/' || location.pathname.includes('/restaurant')
}

// --- Orders page: modal detection ---
function observeOrderModal() {
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector(SELECTORS.orderDetailModal)
    if (!overlay) return

    const modalBox = overlay.querySelector(SELECTORS.orderDetailModalBox) as HTMLElement | null
    if (!modalBox) return
    if (modalBox.getAttribute(INJECTED_ATTR) === 'true') return

    modalBox.setAttribute(INJECTED_ATTR, 'true')
    injectOrderRatingPanel(modalBox)

    // Watch for modal removal to clean up
    const removalObserver = new MutationObserver(() => {
      if (!document.contains(overlay)) {
        removalObserver.disconnect()
      }
    })
    removalObserver.observe(document.body, { childList: true, subtree: true })

    // Handle close button
    const closeBtn = modalBox.querySelector(SELECTORS.modalCloseButton)
    if (closeBtn) {
      closeBtn.addEventListener('click', () => cleanupOrderRatingPanel(modalBox), { once: true })
    }

    // Handle backdrop click
    const bgClick = overlay.querySelector('.v--modal-background-click')
    if (bgClick) {
      bgClick.addEventListener(
        'click',
        (e: Event) => {
          if (e.target === bgClick) {
            cleanupOrderRatingPanel(modalBox)
          }
        },
        { once: true },
      )
    }
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// --- Restaurant page: badge injection ---
function observeRestaurantPage() {
  // Initial injection
  injectRestaurantBadges()
  injectDishBadges()

  // Re-inject when #restaurantMenu changes (restaurant switch)
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (menuEl) {
    const menuObserver = new MutationObserver(() => {
      injectRestaurantBadges()
      injectDishBadges()
    })
    menuObserver.observe(menuEl, { childList: true, subtree: true })
  }

  // Also observe the cards container for late-loading cards
  const cardsContainer = document.querySelector('#all-cards-container')
  if (cardsContainer) {
    const cardsObserver = new MutationObserver(() => {
      injectRestaurantBadges()
    })
    cardsObserver.observe(cardsContainer, { childList: true, subtree: true })
  }
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
    observeOrderModal()
  }
  if (isRestaurantPage()) {
    observeRestaurantPage()
  }
}

// Start
init()
observeRouteChanges()
