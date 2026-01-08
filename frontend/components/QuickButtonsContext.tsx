'use client'

import { createContext, useContext, ReactNode } from 'react'

export interface QuickButton {
  id: string
  name: string
  icon: string
  color: string
  type: 'link' | 'text' | 'datetime'
  value: string
  order: number
}

interface QuickButtonsContextType {
  buttons: QuickButton[]
}

const QuickButtonsContext = createContext<QuickButtonsContextType>({
  buttons: [],
})

export const useQuickButtons = () => useContext(QuickButtonsContext)

interface QuickButtonsProviderProps {
  children: ReactNode
  buttons: QuickButton[]
}

export function QuickButtonsProvider({ children, buttons }: QuickButtonsProviderProps) {
  return (
    <QuickButtonsContext.Provider value={{ buttons }}>
      {children}
    </QuickButtonsContext.Provider>
  )
}
