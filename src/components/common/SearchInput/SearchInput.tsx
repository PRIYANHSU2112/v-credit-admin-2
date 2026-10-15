import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useDebounce } from '@/hooks/useDebounce'

interface SearchInputProps {
  placeholder?: string
  value?: string
  onChange: (value: string) => void
  debounceMs?: number
  className?: string
}

export function SearchInput({
  placeholder = 'Search by name, IMEI, phone, or key...',
  value: controlledValue,
  onChange,
  debounceMs = 350,
  className,
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || '')
  const debouncedValue = useDebounce(internalValue, debounceMs)

  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== internalValue) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  useEffect(() => {
    onChange(debouncedValue)
  }, [debouncedValue, onChange])

  const handleClear = () => {
    setInternalValue('')
    onChange('')
  }

  return (
    <div className="relative w-full max-w-md">
      <Input
        type="text"
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          internalValue ? (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null
        }
        className={className}
      />
    </div>
  )
}
