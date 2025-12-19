import React, { useMemo } from 'react'
import './FilterViz.css'

const CompressorViz = ({ threshold = -24, ratio = 4, makeup = 0 }) => {
  // Compute input-output curve in dB: for input < threshold, output = input; for input >= threshold, output = threshold + (input - threshold)/ratio
  const data = useMemo(() => {
    const inDb = []
    for (let i = -60; i <= 12; i += 1) inDb.push(i)
    const points = inDb.map((x) => {
      if (x < threshold) return { x, y: x }
      const y = threshold + (x - threshold) / Math.max(1, ratio)
      return { x, y: y + (makeup || 0) }
    })
    return points
  }, [threshold, ratio, makeup])

  const width = 240
  const height = 96
  const minX = -60
  const maxX = 12
  const toX = (x) => ((x - minX) / (maxX - minX)) * width
  const minY = -80
  const maxY = 12
  const toY = (y) => height - ((y - minY) / (maxY - minY)) * height

  const path = data.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.x).toFixed(2)} ${toY(p.y).toFixed(2)}`).join(' ')

  return (
    <div className="filter-viz" aria-hidden="true">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <rect x="0" y="0" width={width} height={height} fill="rgba(0,0,0,0.02)" rx="6" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        {/* IO curve */}
        <path d={path} fill="none" stroke="rgba(255,107,107,0.95)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {/* threshold marker */}
        <line x1={toX(threshold)} x2={toX(threshold)} y1="0" y2={height} stroke="rgba(255,165,0,0.6)" strokeDasharray="3 3" />
      </svg>
    </div>
  )
}

export default CompressorViz
