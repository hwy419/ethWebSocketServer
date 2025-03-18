"use client"

import React, { useState } from "react"
import { DashboardLayout } from "./components/ui/DashboardLayout"
import { BlockColumn } from "./components/BlockRow"
import { TransactionTreemap } from "./components/TransactionTreemap"
import { useEthereumBlocks } from "./hooks/useEthereumBlocks"
import { ColorSchemeSelector } from "./components/ColorSchemeSelector"
import type { ColorScheme } from "./components/BlockRow"

const colorSchemes: ColorScheme[] = [
  {
    id: "default",
    name: "Default",
    primary: "#3b82f6",
    secondary: "#6366f1",
    accent: "#8b5cf6",
    text: "#1e293b",
    textDark: "#f8fafc",
  },
  {
    id: "emerald",
    name: "Emerald",
    primary: "#10b981",
    secondary: "#059669",
    accent: "#047857",
    text: "#064e3b",
    textDark: "#ecfdf5",
  },
  {
    id: "amber",
    name: "Amber",
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#b45309",
    text: "#78350f",
    textDark: "#fffbeb",
  },
  {
    id: "rose",
    name: "Rose",
    primary: "#f43f5e",
    secondary: "#e11d48",
    accent: "#be123c",
    text: "#881337",
    textDark: "#fff1f2",
  },
  {
    id: "slate",
    name: "Slate",
    primary: "#64748b",
    secondary: "#475569",
    accent: "#334155",
    text: "#0f172a",
    textDark: "#f8fafc",
  },
]

export default function Home() {
  const [selectedBlockNumber, setSelectedBlockNumber] = useState<number | null>(null)
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>("default")
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false)
  
  const { 
    blocks, 
    isConnected, 
    isConnecting, 
    error, 
    reconnect
  } = useEthereumBlocks()
  
  // Find the currently selected block
  const selectedBlock = selectedBlockNumber 
    ? blocks.find((block) => parseInt(block.number) === selectedBlockNumber) || null
    : null
  
  return (
    <DashboardLayout
      isDark={isDarkMode}
      onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
    >
      <div className="flex flex-col gap-6">
        {/* Connection status banner */}
        {!isConnected && (
          <div className={`flex items-center justify-between rounded-lg p-4 ${
            error ? "bg-red-100 dark:bg-red-900/20" : "bg-blue-100 dark:bg-blue-900/20"
          }`}>
            <div>
              <h3 className="font-medium">
                {error 
                  ? "Connection Error" 
                  : isConnecting 
                    ? "Connecting to Ethereum WebSocket..."
                    : "Not Connected"
                }
              </h3>
              <p className="text-sm opacity-80">
                {error 
                  ? error.message || "Failed to connect to Ethereum WebSocket" 
                  : "Waiting for connection to the Ethereum network"
                }
              </p>
            </div>
            <button
              onClick={reconnect}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Reconnect
            </button>
          </div>
        )}
      
        {/* Main content */}
        <div>
          {/* Header area */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Ethereum Block Explorer</h1>
              <p className="text-sm opacity-70">
                Real-time monitoring of Ethereum blocks and transactions
              </p>
            </div>
            
            <ColorSchemeSelector
              colorSchemes={colorSchemes}
              selectedScheme={selectedColorScheme}
              onSelectScheme={setSelectedColorScheme}
              isDark={isDarkMode}
            />
          </div>
          
          {/* Two-column layout for blocks and treemap */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6" style={{ minHeight: "calc(100vh - 200px)" }}>
            {/* Blocks column - takes 1/4 of the width on large screens */}
            <div className="lg:col-span-1 h-[500px] lg:h-full overflow-hidden">
              <BlockColumn 
                blocks={blocks}
                selectedBlockNumber={selectedBlockNumber}
                onSelectBlock={(blockNumber) => setSelectedBlockNumber(blockNumber)}
                colorScheme={colorSchemes.find(s => s.id === selectedColorScheme) || colorSchemes[0]}
                isDark={isDarkMode}
              />
            </div>
            
            {/* Transactions visualization - takes 3/4 of the width on large screens */}
            <div className="lg:col-span-3">
              <TransactionTreemap 
                block={selectedBlock}
                colorScheme={colorSchemes.find(s => s.id === selectedColorScheme) || colorSchemes[0]}
                isDark={isDarkMode}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 