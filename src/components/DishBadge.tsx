import type { DishRating } from '../storage/schema'
import { getDishAvgRating, getDishLatestComment } from '../storage/ratings'

interface Props {
  ratings: DishRating[]
}

export function DishBadge({ ratings }: Props) {
  if (ratings.length === 0) return null

  const avg = getDishAvgRating(ratings)
  const comment = getDishLatestComment(ratings)

  return (
    <span
      class="hhr-dish-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '12px',
        color: '#666',
        marginLeft: '6px',
      }}
      title={comment || undefined}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" style={{ flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f5a623" /></svg>
      <span>{avg.toFixed(1)}</span>
      {comment && (
        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          — {comment}
        </span>
      )}
    </span>
  )
}
