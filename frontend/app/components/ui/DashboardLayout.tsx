"use client"

import React, { useState, useEffect } from "react"
import { Moon, Sun, Menu, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  header?: React.ReactNode
  isDark?: boolean
  onToggleDarkMode?: () => void
}

export function DashboardLayout({ 
  children, 
  header, 
  isDark = false,
  onToggleDarkMode
}: DashboardLayoutProps): React.ReactElement {
  const [isSystemDark, setIsSystemDark] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Use provided dark mode state if available, otherwise use internal state
  const darkMode = isDark !== undefined ? isDark : isSystemDark
  const toggleDarkMode = onToggleDarkMode || (() => setIsSystemDark(!isSystemDark))

  // Apply theme changes to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    document.documentElement.classList.toggle('light', !darkMode)
  }, [darkMode])

  const cn = (...classes: string[]): string => {
    return classes.filter(Boolean).join(' ')
  }

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300",
      darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
    )}>
      <header className={cn(
        "sticky top-0 z-30 border-b backdrop-blur",
        darkMode ? "border-gray-800 bg-gray-900/95" : "border-gray-200 bg-white/95"
      )}>
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={cn(
                "md:hidden rounded-md p-2",
                darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-500 hover:bg-gray-100"
              )}
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <h1 className="text-lg font-semibold">Ethereum Block Tracker</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {header}
            <div
              className={cn(
                "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
                darkMode 
                  ? "bg-gray-800 border border-gray-700" 
                  : "bg-white border border-gray-200"
              )}
              onClick={toggleDarkMode}
              role="button"
              tabIndex={0}
            >
              <div className="flex justify-between items-center w-full">
                <div
                  className={cn(
                    "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                    darkMode 
                      ? "transform translate-x-0 bg-gray-700" 
                      : "transform translate-x-8 bg-gray-200"
                  )}
                >
                  {darkMode ? (
                    <Moon className="w-4 h-4 text-white" strokeWidth={1.5} />
                  ) : (
                    <Sun className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                  )}
                </div>
                <div
                  className={cn(
                    "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
                    darkMode 
                      ? "bg-transparent" 
                      : "transform -translate-x-8"
                  )}
                >
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-gray-500" strokeWidth={1.5} />
                  ) : (
                    <Moon className="w-4 h-4 text-gray-700" strokeWidth={1.5} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex relative">
        {/* Navigation sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-20 w-64 transform border-r transition-transform duration-300 pt-16",
          darkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}>
          <div className={cn(
            "flex h-16 items-center border-b px-4",
            darkMode ? "border-gray-800" : "border-gray-200"
          )}>
            <h2 className="text-lg font-semibold">Navigation</h2>
          </div>
          <nav className="space-y-1 px-2 py-4">
            <div className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              darkMode ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-900"
            )}>
              Blocks
            </div>
            <div className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            )}>
              Transactions
            </div>
            <div className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            )}>
              Analytics
            </div>
            <div className={cn(
              "rounded-md px-3 py-2 text-sm font-medium",
              darkMode ? "text-gray-400 hover:bg-gray-800" : "text-gray-700 hover:bg-gray-100"
            )}>
              Settings
            </div>
          </nav>
        </aside>

        {/* Main content area */}
        <main className={cn(
          "flex-1 p-4 md:p-6 transition-all duration-300",
          "md:ml-64" // Always apply left margin on medium screens and up
        )}>
          {children}
        </main>
      </div>
    </div>
  )
} 