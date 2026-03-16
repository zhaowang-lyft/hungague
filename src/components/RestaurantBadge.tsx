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
      <svg viewBox="0 0 24 24" width="14" height="14" style={{ flexShrink: 0 }}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f5a623" /></svg>
      {avgRating.toFixed(1)}
      <span style={{ color: '#888', fontWeight: 400 }}>({orderCount} order{orderCount !== 1 ? 's' : ''})</span>
    </span>
  )
}
