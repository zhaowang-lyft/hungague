/**
 * Chrome Console Snippet — Order History Page
 *
 * Run this in the browser console on the HungerHub orders page
 * (https://uncatering.hungerhub.com/orders)
 *
 * Extracts all unique restaurant names from your order history
 * and copies them as a JSON array to your clipboard.
 *
 * Note: Only grabs names from currently loaded cards.
 * Scroll to load more orders first if needed.
 */
(() => {
  const names = [...document.querySelectorAll('p.order-restaurant-name')]
    .map(el => el.textContent.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()

  console.table(names)
  copy(JSON.stringify(names, null, 2))
  console.log(`Copied ${names.length} restaurant names to clipboard.`)
})()
