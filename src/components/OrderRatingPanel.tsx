import { useState, useEffect } from 'preact/hooks'
import { RatingWidget } from './RatingWidget'
import { getOrder, saveOrder, deleteOrder } from '../storage/orders'
import { makeOrderKey } from '../utils/keys'
import type { DishRating, OrderRecord } from '../storage/schema'

interface Props {
  restaurantName: string
  orderDate: string
  dishNames: string[]
}

const MAX_COMMENT_LENGTH = 280

export function OrderRatingPanel({ restaurantName, orderDate, dishNames }: Props) {
  const key = makeOrderKey(restaurantName, orderDate)
  const [items, setItems] = useState<Record<string, DishRating>>({})
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    getOrder(key).then(existing => {
      if (existing) {
        setItems(existing.items)
      } else {
        const initial: Record<string, DishRating> = {}
        for (const name of dishNames) {
          initial[name] = { rating: 0, comment: '' }
        }
        setItems(initial)
      }
    })
  }, [key])

  function updateRating(dish: string, rating: number) {
    setItems(prev => ({
      ...prev,
      [dish]: { ...prev[dish], rating },
    }))
  }

  function updateComment(dish: string, comment: string) {
    if (comment.length > MAX_COMMENT_LENGTH) return
    setItems(prev => ({
      ...prev,
      [dish]: { ...prev[dish], comment },
    }))
  }

  async function handleSave() {
    setSaving(true)
    setMessage('')
    try {
      const record: OrderRecord = {
        restaurantName,
        orderedAt: orderDate,
        ratedAt: new Date().toISOString(),
        items,
      }
      await saveOrder(key, record)
      setMessage('Saved!')
    } catch (e) {
      setMessage('Error saving. Storage might be full.')
    } finally {
      setSaving(false)
    }
  }

  async function handleClear() {
    setSaving(true)
    setMessage('')
    try {
      await deleteOrder(key)
      const initial: Record<string, DishRating> = {}
      for (const name of dishNames) {
        initial[name] = { rating: 0, comment: '' }
      }
      setItems(initial)
      setMessage('Cleared.')
    } catch {
      setMessage('Error clearing.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      class="hhr-order-rating-panel"
      style={{
        marginTop: '24px',
        padding: '16px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
      }}
    >
      <h3 style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>Rate Your Order</h3>
      {Object.entries(items).map(([dish, dishRating]) => (
        <div key={dish} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <span style={{ fontWeight: 500, fontSize: '14px', minWidth: '120px' }}>{dish}</span>
            <RatingWidget value={dishRating.rating} onChange={v => updateRating(dish, v)} />
          </div>
          <textarea
            value={dishRating.comment}
            onInput={e => updateComment(dish, (e.target as HTMLTextAreaElement).value)}
            placeholder="Add a comment (optional)..."
            maxLength={MAX_COMMENT_LENGTH}
            style={{
              width: '100%',
              minHeight: '40px',
              padding: '6px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <div style={{ fontSize: '11px', color: '#999', textAlign: 'right' }}>
            {dishRating.comment.length}/{MAX_COMMENT_LENGTH}
          </div>
        </div>
      ))}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '6px 16px',
            backgroundColor: '#369be9',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleClear}
          disabled={saving}
          style={{
            padding: '6px 16px',
            backgroundColor: '#fff',
            color: '#666',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Clear
        </button>
        {message && (
          <span style={{ fontSize: '13px', color: message.startsWith('Error') ? '#d32f2f' : '#4caf50' }}>
            {message}
          </span>
        )}
      </div>
    </div>
  )
}
