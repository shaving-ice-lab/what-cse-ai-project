import { useState, useCallback } from 'react'
import { Search, X } from 'lucide-react'
import { useDebounceFn } from 'ahooks'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  debounceMs?: number
  className?: string
}

export default function SearchInput({
  placeholder = '搜索...',
  value: propValue,
  onChange,
  onSearch,
  debounceMs = 300,
  className = '',
}: SearchInputProps) {
  const [localValue, setLocalValue] = useState(propValue || '')
  const value = propValue !== undefined ? propValue : localValue

  const { run: debouncedSearch } = useDebounceFn(
    (val: string) => {
      onSearch?.(val)
    },
    { wait: debounceMs }
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setLocalValue(newValue)
      onChange?.(newValue)
      debouncedSearch(newValue)
    },
    [onChange, debouncedSearch]
  )

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange?.('')
    onSearch?.('')
  }, [onChange, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        onSearch?.(value)
      }
    },
    [onSearch, value]
  )

  return (
    <div className={`relative ${className}`}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  )
}
