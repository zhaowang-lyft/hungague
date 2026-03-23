interface Props {
  googleRating: number | null
  reviewCount: number
  googleMapsUrl: string | null
  distanceKm: number | null
}

export function GoogleRatingBadge({ googleRating, reviewCount, googleMapsUrl, distanceKm }: Props) {
  if (!googleRating) return null

  const content = (
    <span
      class="hhr-google-badge"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: '#e8f0fe',
        border: '1px solid #4285f4',
        fontSize: '12px',
        fontWeight: 600,
        color: '#333',
        marginLeft: '6px',
        whiteSpace: 'nowrap',
        cursor: googleMapsUrl ? 'pointer' : 'default',
        textDecoration: 'none',
      }}
      title={`Google: ${googleRating}/5 (${reviewCount} reviews)${distanceKm !== null ? ` — ${distanceKm} km away` : ''}`}
    >
      <svg viewBox="0 0 24 24" width="12" height="12" style={{ flexShrink: 0 }}>
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
      </svg>
      {googleRating.toFixed(1)}
      <span style={{ color: '#666', fontWeight: 400, fontSize: '11px' }}>
        ({reviewCount})
      </span>
      {distanceKm !== null && (
        <span style={{ color: '#666', fontWeight: 400, fontSize: '11px' }}>
          {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)}km`}
        </span>
      )}
    </span>
  )

  if (googleMapsUrl) {
    return (
      <a
        href={googleMapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{ textDecoration: 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </a>
    )
  }

  return content
}
