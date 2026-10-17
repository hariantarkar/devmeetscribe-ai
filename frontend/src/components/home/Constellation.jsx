import { useMemo } from 'react'

function seeded(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function buildNetwork(seed, count, width, height, maxDistance) {
  const random = seeded(seed)
  const nodes = Array.from({ length: count }, () => ({
    x: Math.round(random() * width),
    y: Math.round(random() * height),
    r: 1 + random() * 2.2,
  }))
  const links = []
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const distance = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y)
      if (distance < maxDistance && links.length < count * 2) links.push([nodes[i], nodes[j]])
    }
  }
  return { nodes, links }
}

/** A faint network of dots and lines. Decorative only. */
export default function Constellation({ seed = 7, count = 46, width = 1440, height = 900, maxDistance = 230, className = '' }) {
  const { nodes, links } = useMemo(() => buildNetwork(seed, count, width, height, maxDistance), [seed, count, width, height, maxDistance])
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="white" strokeOpacity="0.14" strokeWidth="1">
        {links.map(([a, b], i) => (
          <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
        ))}
      </g>
      <g fill="white" fillOpacity="0.55">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={n.r} />
        ))}
      </g>
    </svg>
  )
}
