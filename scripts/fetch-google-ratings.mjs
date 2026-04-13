#!/usr/bin/env node
/**
 * One-off script to fetch Google Places ratings for restaurants.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key node scripts/fetch-google-ratings.mjs
 *
 * Or set the key in the GOOGLE_PLACES_API_KEY constant below.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Configuration ────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

/** Load .env file if present */
const envPath = join(ROOT, '.env')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([^#=]+?)\s*=\s*(.*)\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]
    }
  }
}

/** Google Places API key. Loaded from .env or environment. */
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || ''

/** Office location (lat, lng) — used for distance calculation. */
const OFFICE_LAT = 43.6500 // TODO: replace with your office latitude
const OFFICE_LNG = -79.3810 // TODO: replace with your office longitude
const OFFICE_SEARCH_HINT = 'near 357 Bay Street, Toronto, ON'

/**
 * Restaurant names to look up.
 * Update this list as new restaurants appear on HungerHub.
 */
const RESTAURANTS = [
  'AAamazing Salad',
  'Alis West Indian',
  'Aloette Go',
  'Atelier Pasta',
  'Au Pain Dorè',
  'Banh Mi Vietsub',
  'Basil Box',
  'Bbq Chicken',
  'Big Smoke Burger',
  'Black Camel',
  'Bold Bites Co.',
  'Bread and Bowl',
  'Cafe Montaigne',
  'Cafe Plenty',
  'Casa Tropical',
  'Casa di Giorgio',
  'Cheffrys Artisanal Bistro',
  "Chen Chen's Nashville Hot Chicken",
  'Chiang Mai Thai Kitchen',
  'Danforth Dragon',
  'Dirty Birria',
  'Doughbox Wood Fired Pizza and Pasta',
  'Eat Canteen',
  'EatBKK',
  'Fast Fresh Foods',
  'Flaming Stove',
  'Flock',
  'Fox On John',
  'Freshii',
  'Friday Burger Company Lunch',
  'Goat Coffee Co',
  'Gus Tacos',
  'Gyuki',
  'Hakka Wok Hei',
  'ImPerfect Fresh Eats',
  'Imm Thai Kitchen',
  'Jimmy the Greek',
  'Kadak',
  'Kawa Sushi',
  'Knuckle Sandwich',
  'Koh Samui',
  'Koha Pacific Kitchen',
  'Krystos Modern Greek',
  'Kupfert & Kim Lunch',
  'Liberty Eats',
  'Liberty Village Market & Cafe',
  'Light Cafe',
  'Loaded Pierogi',
  'Market Street Catch',
  'Mean Bao',
  'Megumi Mazesoba',
  'MiMi Vietnamese Restaurant',
  'Migente Cocina',
  'Mooring Eats',
  'Naan Kabob',
  'NaiNai Indonesian',
  'New Yorker Deli Lunch',
  'OEB Breakfast Co.',
  'Pokito',
  'Pomarosa',
  "Randy's Roti",
  'Rustle and Still Cafe',
  'Saigon Sandwiches',
  'Salus Fresh Foods',
  'Sambucas On Church',
  'Scotty Bons',
  'Shawarma Moose',
  'Storm Crow Manor',
  'Sukho Thai',
  'Sultans Mediterranean Grill',
  'Sushi Shop',
  'Tacos Moras',
  'Thai Room',
  'The Biryaniwalla',
  'The Burgernator',
  'The Real Jerk',
  'Uno Mustachio',
  'Wat Ah Jerk',
  'DoDoner',
  'Poke Eats',
  'Le Gourmand Cafe',
  "Mandy's Salads ",
  'Blue Claw',
  'Sunshine Wholesome Market',
  'Bevi Birra',
  'IQ Food Co Lunch',
  'Soulas Greek',
  'Burgers n Fries Forever',
  'Cured Catering',
  "Hooky's",
  'Hanoi Bites',
  "Belly Busters",
  "Rise and Dine Eatery",
  "Vildas",
  "Souk Tabule",
  "IQ Food Co"
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const OUTPUT_PATH = join(ROOT, 'src', 'data', 'restaurants.json')

/** Haversine distance in km between two lat/lng points. */
function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Sleep for ms milliseconds (to avoid rate-limiting). */
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

/**
 * Search Google Places Text Search API for a restaurant.
 * Returns the top result or null.
 */
async function searchPlace(name) {
  const query = encodeURIComponent(`${name} restaurant ${OFFICE_SEARCH_HINT}`)
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&key=${GOOGLE_PLACES_API_KEY}`

  const res = await fetch(url)
  if (!res.ok) {
    console.error(`  HTTP ${res.status} for "${name}"`)
    return null
  }

  const data = await res.json()
  if (data.status !== 'OK' || !data.results?.length) {
    console.error(`  Places API status: ${data.status} for "${name}"`)
    return null
  }

  return data.results[0]
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!GOOGLE_PLACES_API_KEY) {
    console.error('Error: Set GOOGLE_PLACES_API_KEY env var or edit the script.')
    process.exit(1)
  }

  // Load existing data to avoid re-querying known restaurants
  let existing = {}
  if (existsSync(OUTPUT_PATH)) {
    try {
      existing = JSON.parse(readFileSync(OUTPUT_PATH, 'utf-8'))
    } catch {
      // Ignore parse errors — will re-fetch everything
    }
  }

  const toFetch = RESTAURANTS.filter(name => !existing[name])
  const forceRefresh = process.argv.includes('--force')

  if (forceRefresh) {
    console.log(`Force refresh: fetching all ${RESTAURANTS.length} restaurants...\n`)
  } else if (toFetch.length === 0) {
    console.log(`All ${RESTAURANTS.length} restaurants already in ${OUTPUT_PATH}. Use --force to re-fetch all.`)
    return
  } else {
    console.log(`${Object.keys(existing).length} restaurants already cached, fetching ${toFetch.length} new...\n`)
  }

  const fetchList = forceRefresh ? RESTAURANTS : toFetch
  const results = forceRefresh ? {} : { ...existing }

  for (const name of fetchList) {
    process.stdout.write(`  ${name}... `)

    const place = await searchPlace(name)
    if (!place) {
      console.log('SKIPPED')
      continue
    }

    const lat = place.geometry?.location?.lat
    const lng = place.geometry?.location?.lng
    const distanceKm = lat && lng ? haversineKm(OFFICE_LAT, OFFICE_LNG, lat, lng) : null

    results[name] = {
      googleRating: place.rating ?? null,
      reviewCount: place.user_ratings_total ?? 0,
      googleMapsUrl: place.place_id
        ? `https://www.google.com/maps/place/?q=place_id:${place.place_id}`
        : null,
      distanceKm: distanceKm !== null ? Math.round(distanceKm * 100) / 100 : null,
      address: place.formatted_address ?? null,
    }

    console.log(
      `${place.rating ?? '?'}/5 (${place.user_ratings_total ?? 0} reviews)` +
        (distanceKm !== null ? ` — ${distanceKm.toFixed(2)} km` : ''),
    )

    // Small delay to be polite to the API
    await sleep(200)
  }

  // Sort by distance (closest first), then write
  const sorted = Object.fromEntries(
    Object.entries(results).sort(([, a], [, b]) => (a.distanceKm ?? 99) - (b.distanceKm ?? 99)),
  )

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, JSON.stringify(sorted, null, 2) + '\n')

  console.log(`\nWrote ${Object.keys(sorted).length} restaurants to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
