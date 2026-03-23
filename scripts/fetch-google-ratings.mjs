#!/usr/bin/env node
/**
 * One-off script to fetch Google Places ratings for restaurants.
 *
 * Usage:
 *   GOOGLE_PLACES_API_KEY=your_key node scripts/fetch-google-ratings.mjs
 *
 * Or set the key in the GOOGLE_PLACES_API_KEY constant below.
 */

import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

// ── Configuration ────────────────────────────────────────────────────────────

/** Google Places API key. Set here or via GOOGLE_PLACES_API_KEY env var. */
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyBITc5uwpO7XwwqYAs1HefggjVhaWX_3Ac'

/** Office location (lat, lng) — used for distance calculation. */
const OFFICE_LAT = 43.6500 // TODO: replace with your office latitude
const OFFICE_LNG = -79.3810 // TODO: replace with your office longitude
const OFFICE_SEARCH_HINT = 'near 357 Bay Street, Toronto, ON'

/**
 * Restaurant names to look up.
 * Update this list as new restaurants appear on HungerHub.
 */
const RESTAURANTS = [
  'Atelier Pasta',
  'Fast Fresh Foods',
  'Gus Tacos',
  'Hakka Wok Hei',
  'Imm Thai Kitchen',
  'Jimmy the Greek',
  'OEB Breakfast Co.',
  'The Burgernator',
  'Sukho Thai',
  'Kawa Sushi'
]

// ── Helpers ──────────────────────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_PATH = join(__dirname, '..', 'src', 'data', 'restaurants.json')

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
  if (GOOGLE_PLACES_API_KEY === 'YOUR_API_KEY_HERE') {
    console.error('Error: Set GOOGLE_PLACES_API_KEY env var or edit the script.')
    process.exit(1)
  }

  console.log(`Fetching Google ratings for ${RESTAURANTS.length} restaurants...\n`)

  const results = {}

  for (const name of RESTAURANTS) {
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
