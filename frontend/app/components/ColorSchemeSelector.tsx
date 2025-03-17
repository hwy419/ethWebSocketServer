"use client"

import React, { useState } from "react"
import { Check } from "lucide-react"
import type { ColorScheme } from "./BlockRow"

interface ColorSchemeSelectorProps {
  colorSchemes: ColorScheme[]
  selectedScheme: string
  onSelectScheme: (schemeId: string) => void
  isDark: boolean
}

export function ColorSchemeSelector({ 
  colorSchemes, 
  selectedScheme, 
  onSelectScheme,
  isDark
}: ColorSchemeSelectorProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  
  const currentScheme = colorSchemes.find(scheme => scheme.id === selectedScheme) || colorSchemes[0]
  
  return (
    <div className="relative">
      <button
        className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.3)' : 'rgba(255, 255, 255, 0.3)',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex gap-1">
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: currentScheme.primary }} />
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: currentScheme.secondary }} />
          <div className="h-4 w-4 rounded-full" style={{ backgroundColor: currentScheme.accent }} />
        </div>
        <span>{currentScheme.name}</span>
      </button>
      
      {isOpen && (
        <div 
          className="absolute z-50 mt-1 w-64 rounded-md border shadow-lg"
          style={{ 
            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)',
          }}
        >
          <div className="p-1">
            <div className="p-2 text-sm font-medium">Color Schemes</div>
            <div className="h-px w-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
            <div className="mt-1 space-y-1 p-1">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors"
                  style={{ 
                    backgroundColor: selectedScheme === scheme.id 
                      ? (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') 
                      : 'transparent',
                    color: scheme.text
                  }}
                  onClick={() => {
                    onSelectScheme(scheme.id)
                    setIsOpen(false)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: scheme.primary }} />
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: scheme.secondary }} />
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: scheme.accent }} />
                    </div>
                    <span>{scheme.name}</span>
                  </div>
                  {selectedScheme === scheme.id && (
                    <Check className="h-4 w-4" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
} 