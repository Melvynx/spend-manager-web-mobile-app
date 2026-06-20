import { useEffect, useState } from 'react'

/**
 * iOS-style donut (ring): segments with soft ends, thin white gaps between
 * categories, progressive draw-in animation, and a free central slot (`children`).
 *
 * data: [{ key, value, color }]
 */
export default function DonutChart({
  data = [],
  size = 176,
  strokeWidth = 22,
  gapDegrees = 3,
  children,
}) {
  const [shown, setShown] = useState(false)

  // Triggers the draw-in after the first render.
  useEffect(() => {
    const raf = requestAnimationFrame(() => setShown(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  const total = data.reduce((sum, d) => sum + (d.value > 0 ? d.value : 0), 0)
  const radius = 50 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const multi = data.filter((d) => d.value > 0).length > 1
  const gap = multi ? gapDegrees : 0

  const segments = []
  let cursor = 0 // cumulative angle in degrees
  for (const d of data) {
    if (!(d.value > 0)) continue
    const sweep = (d.value / total) * 360
    const visible = Math.max(sweep - gap, 0.0001)
    const arc = (visible / 360) * circumference
    segments.push({
      key: d.key,
      color: d.color,
      arc,
      // -90° to start at the top, +gap/2 to center the gap.
      rotation: cursor + gap / 2 - 90,
    })
    cursor += sweep
  }

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="block text-gray-100 dark:text-white/10"
      >
        {/* Subtle background track (adapts to the theme via currentColor) */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
        {segments.map((s, i) => (
          <circle
            key={s.key}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={s.color}
            strokeWidth={strokeWidth}
            strokeLinecap="butt"
            strokeDasharray={`${s.arc} ${circumference}`}
            strokeDashoffset={shown ? 0 : s.arc}
            transform={`rotate(${s.rotation} 50 50)`}
            style={{
              transition: 'stroke-dashoffset 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
              transitionDelay: `${i * 0.07}s`,
            }}
          />
        ))}
      </svg>
      {children != null && (
        <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
          {children}
        </div>
      )}
    </div>
  )
}
