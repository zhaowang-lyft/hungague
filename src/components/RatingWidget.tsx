import { useState } from 'preact/hooks'

interface Props {
  value: number
  onChange?: (v: number) => void
  readonly?: boolean
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
            style={{
              position: 'relative',
              display: 'inline-block',
              width: '24px',
              height: '24px',
              fontSize: '24px',
              lineHeight: '24px',
            }}
            onMouseMove={(e: MouseEvent) => handleMouseMove(e, i)}
            onClick={(e: MouseEvent) => handleClick(e, i)}
          >
            <span style={{ color: '#ddd', position: 'absolute', left: 0, top: 0 }}>&#9733;</span>
            <span
              style={{
                color: '#f5a623',
                position: 'absolute',
                left: 0,
                top: 0,
                overflow: 'hidden',
                width: `${fill * 100}%`,
              }}
            >
              &#9733;
            </span>
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
