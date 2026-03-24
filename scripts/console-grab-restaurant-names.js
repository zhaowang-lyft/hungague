/**
 * Chrome Console Snippet — Restaurant Page
 *
 * Run this in the browser console on the HungerHub restaurant/ordering page
 * (https://uncatering.hungerhub.com/restaurants?...)
 *
 * Extracts all restaurant names from the card titles and copies them
 * as a JSON array to your clipboard.
 */
(() => {
  const names = [...document.querySelectorAll('h5.restaurant-title')]
    .map(el => el.textContent.trim())
    .filter(Boolean)
    .filter((v, i, a) => a.indexOf(v) === i)
    .sort()

  console.table(names)
  copy(JSON.stringify(names, null, 2))
  console.log(`Copied ${names.length} restaurant names to clipboard.`)
})()
