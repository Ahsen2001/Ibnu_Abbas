import Skeleton from './Skeleton'

type TableSkeletonProps = {
  columns: number
  rows?: number
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return Array.from({ length: rows }, (_, rowIndex) => (
    <tr key={`skeleton-row-${rowIndex}`}>
      {Array.from({ length: columns }, (_, columnIndex) => (
        <td className="px-4 py-4" key={`skeleton-cell-${rowIndex}-${columnIndex}`}>
          <Skeleton className={columnIndex === 0 ? 'h-10 w-full max-w-[220px]' : 'h-5 w-full'} />
        </td>
      ))}
    </tr>
  ))
}

export default TableSkeleton
