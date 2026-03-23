import 'webextension-polyfill'
import { SELECTORS } from './selectors'
import {
  injectOrderRatingPanel,
  cleanupOrderRatingPanel,
  injectRestaurantBadges,
  injectDishBadges,
  injectOrderCardRatings,
  injectPriceFilter,
  cleanupPriceFilter,
  injectGoogleBadges,
} from './injector'

const INJECTED_ATTR = 'data-hhr-injected'

function refreshOrderCardRatings() {
  // Remove existing summaries so they get re-rendered with fresh data
  document.querySelectorAll('[data-hhr-card-summary]').forEach(el => el.remove())
  injectOrderCardRatings()
}

function isOrdersPage(): boolean {
  return location.pathname.includes('/orders')
}

function isRestaurantPage(): boolean {
  return location.pathname === '/' || location.pathname.includes('/restaurant')
}

// --- Orders page: card ratings + modal detection ---
let ordersPageInitialized = false

function observeOrdersPage() {
  if (ordersPageInitialized) return
  ordersPageInitialized = true

  injectOrderCardRatings()

  // Re-inject when order list changes (pagination, filtering)
  // Use a debounce to avoid rapid-fire re-injections
  let cardDebounce: ReturnType<typeof setTimeout> | null = null
  const orderList = document.querySelector('[data-v-435ac1cc]')
  if (orderList) {
    const listObserver = new MutationObserver((mutations) => {
      // Ignore mutations caused by our own injections
      const isOwnMutation = mutations.every(m =>
        [...m.addedNodes, ...m.removedNodes].every(
          n => n instanceof HTMLElement && n.hasAttribute?.('data-hhr-card-summary')
        )
      )
      if (isOwnMutation) return

      if (cardDebounce) clearTimeout(cardDebounce)
      cardDebounce = setTimeout(() => injectOrderCardRatings(), 100)
    })
    listObserver.observe(orderList, { childList: true, subtree: true })
  }

  observeOrderModal()
}

function observeOrderModal() {
  const observer = new MutationObserver(() => {
    const overlay = document.querySelector(SELECTORS.orderDetailModal)
    if (!overlay) return

    const modalBoxMaybe = overlay.querySelector(SELECTORS.orderDetailModalBox) as HTMLElement | null
    if (!modalBoxMaybe) return
    if (modalBoxMaybe.getAttribute(INJECTED_ATTR) === 'true') return
    const modalBox: HTMLElement = modalBoxMaybe

    modalBox.setAttribute(INJECTED_ATTR, 'true')
    injectOrderRatingPanel(modalBox)

    function onModalClose() {
      cleanupOrderRatingPanel(modalBox)
      refreshOrderCardRatings()
    }

    // Handle close button — query with 'button.close' since we're already inside .v--modal-box
    const closeBtn = modalBox.querySelector('button.close')
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

    // Watch for overlay being removed OR hidden (Vue may do either)
    const removalObserver = new MutationObserver(() => {
      const gone = !document.contains(overlay)
      const hidden = overlay instanceof HTMLElement &&
        (overlay.style.display === 'none' || !overlay.offsetParent)
      if (gone || hidden) {
        removalObserver.disconnect()
        refreshOrderCardRatings()
      }
    })
    removalObserver.observe(document.body, { childList: true, subtree: true, attributes: true })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// --- Restaurant page: badge injection ---
let restaurantPageInitialized = false
let menuObserverAttached = false

function attachMenuObserver() {
  if (menuObserverAttached) return
  const menuEl = document.querySelector(SELECTORS.restaurantMenu)
  if (!menuEl) return

  menuObserverAttached = true

  let menuDebounce: ReturnType<typeof setTimeout> | null = null
  const menuObserver = new MutationObserver((mutations) => {
    const isOwnMutation = mutations.every(m =>
      [...m.addedNodes, ...m.removedNodes].every(
        n => n instanceof HTMLElement && (
          n.hasAttribute?.('data-hhr-badge') ||
          n.hasAttribute?.('data-hhr-google-badge') ||
          n.hasAttribute?.('data-hhr-dish-badge') ||
          n.hasAttribute?.('data-hhr-price-filter')
        )
      )
    )
    if (isOwnMutation) return

    if (menuDebounce) clearTimeout(menuDebounce)
    menuDebounce = setTimeout(() => {
      injectRestaurantBadges()
      injectGoogleBadges()
      injectDishBadges()
      injectPriceFilter()
    }, 100)
  })
  menuObserver.observe(menuEl, { childList: true, subtree: true })

  // Inject immediately for the current menu content
  injectDishBadges()
  injectPriceFilter()
}

function observeRestaurantPage() {
  if (restaurantPageInitialized) return
  restaurantPageInitialized = true

  injectRestaurantBadges()
  injectGoogleBadges()
  attachMenuObserver()

  // Observe body for #restaurantMenu to appear (user clicks "Order Lunch")
  let bodyDebounce: ReturnType<typeof setTimeout> | null = null
  const bodyObserver = new MutationObserver(() => {
    if (bodyDebounce) clearTimeout(bodyDebounce)
    bodyDebounce = setTimeout(() => {
      injectRestaurantBadges()
      if (document.querySelector(SELECTORS.restaurantMenu)) {
        attachMenuObserver()
        injectDishBadges()
        injectPriceFilter()
      }
    }, 100)
  })
  bodyObserver.observe(document.body, { childList: true, subtree: true })
}

// --- SPA route change detection ---
function observeRouteChanges() {
  let lastPath = location.pathname
  const routeObserver = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname
      ordersPageInitialized = false
      restaurantPageInitialized = false
      menuObserverAttached = false
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
