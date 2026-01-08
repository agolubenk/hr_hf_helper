'use client'

import { Box, Text } from "@radix-ui/themes"
import { useState, ReactNode } from "react"

interface FloatingLabelInputProps {
  id: string
  label: string
  type?: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  icon?: ReactNode
  disabled?: boolean
}

export default function FloatingLabelInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  icon,
  disabled = false,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false)

  const isFloating = isFocused || value.length > 0

  return (
    <Box style={{ position: 'relative', width: '100%' }}>
      {icon && (
        <Box
          style={{
            position: 'absolute',
            left: '12px',
            top: isFloating ? '20px' : '50%',
            transform: isFloating ? 'none' : 'translateY(-50%)',
            zIndex: 2,
            color: disabled ? 'var(--gray-10)' : (isFocused ? 'var(--accent-9)' : 'var(--gray-11)'),
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.2s ease-in-out',
            pointerEvents: 'none',
          }}
        >
          {icon}
        </Box>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        placeholder={isFloating ? placeholder : ''}
        style={{
          width: '100%',
          paddingTop: isFloating ? '20px' : '12px',
          paddingBottom: isFloating ? '8px' : '12px',
          paddingLeft: icon ? '44px' : '12px',
          paddingRight: '12px',
          fontSize: '15px',
          lineHeight: '20px',
          borderRadius: '6px',
          border: '1px solid var(--gray-a6)',
          backgroundColor: disabled ? 'var(--gray-a3)' : 'var(--color-panel)',
          color: disabled ? 'var(--gray-10)' : 'var(--gray-12)',
          outline: 'none',
          transition: 'all 0.2s ease-in-out',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'text',
          opacity: disabled ? 0.7 : 1,
        }}
        onFocus={(e) => {
          if (!disabled) {
            setIsFocused(true)
            e.currentTarget.style.borderColor = 'var(--accent-9)'
            e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent-9)'
          }
        }}
        onBlur={(e) => {
          if (!disabled) {
            setIsFocused(false)
            e.currentTarget.style.borderColor = 'var(--gray-a6)'
            e.currentTarget.style.boxShadow = 'none'
          }
        }}
      />
      <Text
        as="label"
        htmlFor={id}
        size={isFloating ? "1" : "3"}
        style={{
          position: 'absolute',
          left: icon ? '44px' : '12px',
          top: isFloating ? '8px' : '50%',
          transform: isFloating ? 'translateY(0)' : 'translateY(-50%)',
          color: isFocused ? 'var(--accent-9)' : 'var(--gray-11)',
          pointerEvents: 'none',
          transition: 'all 0.2s ease-in-out',
          backgroundColor: isFloating ? 'var(--color-panel)' : 'transparent',
          padding: isFloating ? '0 4px' : '0',
          zIndex: 1,
          fontWeight: isFloating ? 500 : 400,
        }}
      >
        {label}
        {required && <span style={{ color: 'var(--red-9)' }}> *</span>}
      </Text>
    </Box>
  )
}
