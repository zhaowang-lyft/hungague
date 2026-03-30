export const SELECTORS = {
  // Orders page - order detail modal
  orderDetailModal: '.v--modal-overlay',
  orderDetailModalBox: '.v--modal-box',
  modalCloseButton: '.v--modal-box button.close',

  // Inside the modal
  modalRestaurantName: '.v--modal-box h1',
  // Order date: <h2>Order Date:</h2> <span>2026-03-13</span>
  // No class on the span; we find the h2 with "Order Date:" text and grab nextElementSibling
  modalOrderDateLabel: '.v--modal-box h2',

  // Item rows — nested table structure:
  // outer tbody > tr > td[colspan=3] > table.no-border-table > tr (first tr has the dish)
  modalItemTable: '.v--modal-box table.table-custom',
  // Dish name lives in: table.no-border-table td div.col-12 p > p
  modalItemName: 'table.no-border-table td div.col-12 p',

  // Restaurant page - each restaurant card
  restaurantCards: '#all-cards-container [data-v-203efe32]',
  restaurantCardName: '[data-v-203efe32] h5.restaurant-title',

  // Menu section
  restaurantMenu: '#restaurantMenu',
  menuItemTitle: '[data-v-4bb605de] .categoryItem--title p',
  menuItem: 'li[data-v-4bb605de]',
  menuItemPrice: '.price-container.item-price strong',

  // Orders page - order cards (list)
  // Note: data-v-* changed from 8831b7ec to d117c654; using class-only selector for resilience
  orderCard: '.card.mb-3',
  orderCardDate: 'h5.order-date',
  orderCardRestaurantName: 'p.order-restaurant-name',
} as const
