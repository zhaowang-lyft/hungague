interface Props {
  avgRating: number
  orderCount: number
}

export function RestaurantBadge({ avgRating, orderCount }: Props) {
  if (orderCount === 0 || avgRating === 0) return null

  return (
    <span
      class="hhr-restaurant-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: '#fff8e1',
        border: '1px solid #f5a623',
        fontSize: '13px',
        fontWeight: 600,
        color: '#333',
        marginLeft: '8px',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ color: '#f5a623' }}>&#9733;</span>
      {avgRating.toFixed(1)}
      <span style={{ color: '#888', fontWeight: 400 }}>({orderCount} order{orderCount !== 1 ? 's' : ''})</span>
    </span>
  )
}
