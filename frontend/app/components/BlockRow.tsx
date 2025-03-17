"use client"

import React from "react"
import type { BlockWithStats } from "../hooks/useEthereumBlocks"
import { formatTimestamp, truncateHash } from "../lib/utils"
import { Blocks, Clock, FileText } from "lucide-react"

interface BlockCardProps {
  block: BlockWithStats
  isSelected: boolean
  onClick: () => void
  isDark: boolean
  colorScheme: ColorScheme
}

// Color schemes for blocks
export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

function BlockCard({ block, isSelected, onClick, isDark, colorScheme }: BlockCardProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex h-36 w-64 shrink-0 select-none flex-col justify-between
        rounded-xl border-2 backdrop-blur-sm px-4 py-3 transition-all duration-300
        cursor-pointer
        ${isSelected ? 'ring-2 ring-offset-2' : ''}
      `}
      style={{
        backgroundColor: colorScheme.background,
        borderColor: isSelected ? colorScheme.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        color: colorScheme.text,
        boxShadow: isSelected ? `0 0 15px ${colorScheme.primary}80` : 'none'
      }}
    >
      <div className="flex items-center gap-2">
        <span className="relative inline-block rounded-full p-1" style={{ backgroundColor: `${colorScheme.primary}40` }}>
          <Blocks className="size-4" style={{ color: colorScheme.primary }} />
        </span>
        <p className="text-lg font-medium" style={{ color: colorScheme.primary }}>
          Block #{parseInt(block.number).toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Clock className="size-4 opacity-60" />
        <p className="text-sm opacity-60">{formatTimestamp(block.timestamp)}</p>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="size-4 opacity-60" />
        <p className="text-sm">{block.transactionCount} transactions</p>
      </div>
      <div className="flex items-center gap-2">
        <p className="text-xs opacity-60">Hash: {truncateHash(block.hash)}</p>
      </div>
    </div>
  )
}

interface BlockRowProps {
  blocks: BlockWithStats[]
  selectedBlockNumber: string | null
  onBlockSelect: (block: BlockWithStats) => void
  isDark: boolean
  colorScheme: ColorScheme
}

export function BlockRow({ 
  blocks, 
  selectedBlockNumber, 
  onBlockSelect, 
  isDark, 
  colorScheme 
}: BlockRowProps): React.ReactElement {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to right, ${isDark ? '#111827' : '#ffffff'} 0%, transparent 100%)` 
        }} 
      />
      <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none" 
        style={{ 
          background: `linear-gradient(to left, ${isDark ? '#111827' : '#ffffff'} 0%, transparent 100%)` 
        }} 
      />
      <div className="flex gap-4 p-6 overflow-x-auto pb-4" style={{ scrollBehavior: 'smooth' }}>
        {blocks.map((block) => (
          <BlockCard
            key={block.hash}
            block={block}
            isSelected={selectedBlockNumber === block.number}
            onClick={() => onBlockSelect(block)}
            isDark={isDark}
            colorScheme={colorScheme}
          />
        ))}
        {blocks.length === 0 && (
          <div className="flex h-36 w-full items-center justify-center opacity-60">
            <p>No blocks available. Connecting to WebSocket...</p>
          </div>
        )}
      </div>
    </div>
  )
} 