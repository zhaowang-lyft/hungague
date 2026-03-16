interface DishSummary {
  name: string
  rating: number
  comment: string
}

interface Props {
  dishes: DishSummary[]
  avgRating: number
}

export function OrderCardSummary({ dishes, avgRating }: Props) {
  if (dishes.length === 0) return null

  return (
    <div
      class="hhr-order-card-summary"
      style={{
        marginTop: '8px',
        padding: '8px 12px',
        backgroundColor: '#fff8e1',
        borderRadius: '6px',
        border: '1px solid #f5e6b8',
        fontSize: '13px',
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: '4px', color: '#333' }}>
        <span style={{ color: '#f5a623' }}>&#9733;</span> {avgRating.toFixed(1)} avg
      </div>
      {dishes.map(d => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '2px' }}>
          <span style={{ color: '#f5a623', fontSize: '12px' }}>&#9733; {d.rating.toFixed(1)}</span>
          <span style={{ fontWeight: 500 }}>{d.name}</span>
          {d.comment && (
            <span style={{ color: '#888', fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '250px' }}>
              — {d.comment}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
