type CategoryFilterProps = {
  value: string
  categories: Array<{ label: string; value: string }>
  onChange: (value: string) => void
}

function CategoryFilter({ value, categories, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          className={category.value === value ? 'btn-primary min-h-9 px-3' : 'btn-secondary min-h-9 px-3'}
          key={category.value}
          onClick={() => onChange(category.value)}
          type="button"
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
