import { useState } from 'preact/hooks'

interface Props {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
}

const STAR_PATH = 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14 2 9.27l6.91-1.01L12 2z'

function Star({ fill }: { fill: number }) {
  const id = `star-grad-${Math.random().toString(36).slice(2, 8)}`
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stop-color="#f5a623" />
          <stop offset={`${fill * 100}%`} stop-color="#ddd" />
        </linearGradient>
      </defs>
      <path d={STAR_PATH} fill={`url(#${id})`} />
    </svg>
  )
}

export function RatingWidget({ value, onChange, readonly = false }: Props) {
  const [hoverValue, setHoverValue] = useState<number | null>(null)
  const displayValue = hoverValue ?? value

  function handleMouseMove(e: MouseEvent, starIndex: number) {
    if (readonly) return
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const half = x < rect.width / 2
    setHoverValue(starIndex + (half ? 0.5 : 1))
  }

  function handleClick(e: MouseEvent, starIndex: number) {
    if (readonly || !onChange) return
    const target = e.currentTarget as HTMLElement
    const rect = target.getBoundingClientRect()
    const x = e.clientX - rect.left
    const half = x < rect.width / 2
    const newValue = starIndex + (half ? 0.5 : 1)
    onChange(newValue === value ? 0 : newValue)
  }

  return (
    <div
      class="hhr-rating-widget"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        cursor: readonly ? 'default' : 'pointer',
        userSelect: 'none',
      }}
      onMouseLeave={() => !readonly && setHoverValue(null)}
    >
      {[0, 1, 2, 3, 4].map(i => {
        const fill = Math.min(1, Math.max(0, displayValue - i))
        return (
          <span
            key={i}
            style={{ display: 'inline-block', width: '24px', height: '24px' }}
            onMouseMove={(e: MouseEvent) => handleMouseMove(e, i)}
            onClick={(e: MouseEvent) => handleClick(e, i)}
          >
            <Star fill={fill} />
          </span>
        )
      })}
      {!readonly && (
        <span style={{ fontSize: '14px', lineHeight: '24px', marginLeft: '4px', color: '#666' }}>
          {value > 0 ? value.toFixed(1) : ''}
        </span>
      )}
    </div>
  )
}
