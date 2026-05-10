import './ui.css'

interface StatTileProps {
  label: string
  value: string
  size?: 'sm' | 'lg'
}

export function StatTile({ label, value, size = 'sm' }: StatTileProps) {
  return (
    <div className={`ui-stat-tile ui-stat-tile-${size}`}>
      <span className="ui-stat-tile-value">{value}</span>
      <span className="ui-stat-tile-label">{label}</span>
    </div>
  )
}
