import './ui.css'

interface SkeletonProps {
  width?: string
  height?: string
}

export function Skeleton({ width = '100%', height = '1rem' }: SkeletonProps) {
  return <div className="ui-skeleton" style={{ width, height }} aria-hidden="true" />
}
