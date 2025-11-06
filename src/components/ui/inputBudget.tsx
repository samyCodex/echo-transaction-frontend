import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, value, onBlur, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState<string>("")

    // 🧠 Keep internal state synced with parent value
    React.useEffect(() => {
      if (value === undefined || value === null || Number.isNaN(value)) {
        setLocalValue("")
      } else if (typeof value === "number") {
        setLocalValue(value.toString())
      } else {
        setLocalValue(value as string)
      }
    }, [value])

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // If it's a number input, auto-format to 2 decimal places
      if (type === "number" && localValue !== "" && !isNaN(Number(localValue))) {
        const formatted = parseFloat(localValue).toFixed(2)
        setLocalValue(formatted)
      }

      // Call parent onBlur if provided
      onBlur?.(e)
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value)
      props.onChange?.(e)
    }

    return (
      <input
        ref={ref}
        type={type}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        {...props}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-white dark:bg-gray-800",
          "px-3 py-2 text-sm text-gray-900 dark:text-gray-100",
          "placeholder:text-gray-400 dark:placeholder:text-gray-500",
          "ring-offset-background focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
      />
    )
  }
)

Input.displayName = "Input"

export { Input }
