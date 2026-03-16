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
      <span style={{ color: '#f5a623' }}>&#9733;</span>
      <span>{avg.toFixed(1)}</span>
      {comment && (
        <span style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          — {comment}
        </span>
      )}
    </span>
  )
}
