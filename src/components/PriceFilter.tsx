import { useState } from 'preact/hooks'

interface Props {
  onFilterChange: (min: number | null, max: number | null) => void
}

export function PriceFilter({ onFilterChange }: Props) {
  const [min, setMin] = useState('')
  const [max, setMax] = useState('')

  function apply() {
    const minVal = min === '' ? null : parseFloat(min)
    const maxVal = max === '' ? null : parseFloat(max)
    onFilterChange(
      minVal !== null && !isNaN(minVal) ? minVal : null,
      maxVal !== null && !isNaN(maxVal) ? maxVal : null,
    )
  }

  function clear() {
    setMin('')
    setMax('')
    onFilterChange(null, null)
  }

  const inputStyle = {
    width: '70px',
    padding: '4px 8px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
  }

  const btnStyle = {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
  }

  return (
    <div
      class="hhr-price-filter"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        margin: '8px 0',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        fontSize: '13px',
        color: '#333',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontWeight: 600 }}>Price:</span>
      <span>$</span>
      <input
        type="number"
        placeholder="Min"
        value={min}
        onInput={(e) => setMin((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        style={inputStyle}
        min="0"
        step="0.01"
      />
      <span>—</span>
      <span>$</span>
      <input
        type="number"
        placeholder="Max"
        value={max}
        onInput={(e) => setMax((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
        style={inputStyle}
        min="0"
        step="0.01"
      />
      <button
        onClick={apply}
        style={{
          ...btnStyle,
          backgroundColor: '#f5a623',
          color: '#fff',
        }}
      >
        Filter
      </button>
      <button
        onClick={() => {
          setMin('')
          setMax('20')
          onFilterChange(null, 20)
        }}
        style={{
          ...btnStyle,
          backgroundColor: '#e8f5e9',
          color: '#2e7d32',
          border: '1px solid #a5d6a7',
        }}
      >
        Within Budget
      </button>
      {(min !== '' || max !== '') && (
        <button
          onClick={clear}
          style={{
            ...btnStyle,
            backgroundColor: '#eee',
            color: '#666',
          }}
        >
          Clear
        </button>
      )}
    </div>
  )
}
