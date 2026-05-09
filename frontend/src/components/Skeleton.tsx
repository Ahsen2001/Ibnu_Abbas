type SkeletonProps = {
  className?: string
}

function Skeleton({ className = '' }: SkeletonProps) {
  return <div className={`skeleton ${className}`.trim()} />
}

export default Skeleton
