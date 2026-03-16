import type { OrderRecord } from './schema'

const STORAGE_KEY = 'orders'

export async function getAllOrders(): Promise<Record<string, OrderRecord>> {
  const result = await chrome.storage.sync.get(STORAGE_KEY)
  return (result[STORAGE_KEY] as Record<string, OrderRecord>) ?? {}
}

export async function getOrder(key: string): Promise<OrderRecord | null> {
  const all = await getAllOrders()
  return all[key] ?? null
}

export async function saveOrder(key: string, record: OrderRecord): Promise<void> {
  const all = await getAllOrders()
  all[key] = record
  await chrome.storage.sync.set({ [STORAGE_KEY]: all })
}

export async function deleteOrder(key: string): Promise<void> {
  const all = await getAllOrders()
  delete all[key]
  await chrome.storage.sync.set({ [STORAGE_KEY]: all })
}
