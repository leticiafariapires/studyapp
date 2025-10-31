"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface SimpleSwitchProps extends React.HTMLAttributes<HTMLButtonElement> {
  id?: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  className?: string
  disabled?: boolean
}

export function SimpleSwitch({
  checked = false,
  onCheckedChange,
  className,
  disabled = false,
  ...props
}: SimpleSwitchProps) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const toggle = () => {
    if (!disabled) {
      const newChecked = !isChecked
      setIsChecked(newChecked)
      onCheckedChange(newChecked)
    }
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isChecked}
      disabled={disabled}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
        isChecked ? "bg-primary" : "bg-gray-200 dark:bg-gray-700",
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
        className
      )}
      onClick={toggle}
      {...props}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform",
          isChecked ? "translate-x-6" : "translate-x-0.5"
        )}
      />
    </button>
  )
}
