"use client"

import React, { useEffect, useState } from "react"
import type { BlockWithStats } from "../hooks/useEthereumBlocks"
import { formatTimestamp } from "./utils/formatters"
import { Blocks, Clock, FileText, GitCommit, Hash, Loader2 } from "lucide-react"

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
  text: string
  textDark: string
}

function BlockCard({ block, isSelected, onClick, isDark, colorScheme }: BlockCardProps): React.ReactElement {
  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col shrink-0 select-none 
        rounded-lg border backdrop-blur-sm px-3 py-2 
        cursor-pointer mb-2 hover:brightness-105
        ${isSelected ? 'ring-2 ring-offset-1' : ''}
      `}
      style={{
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        borderColor: isSelected ? colorScheme.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        color: isDark ? colorScheme.textDark : colorScheme.text,
        boxShadow: isSelected ? `0 0 15px ${colorScheme.primary}40` : 'none'
      }}
    >
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative inline-block rounded-full p-1" style={{ backgroundColor: `${colorScheme.primary}30` }}>
            <Blocks className="h-4 w-4" style={{ color: colorScheme.primary }} />
          </span>
          <p className="text-md font-medium" style={{ color: colorScheme.primary }}>
            Block #{parseInt(block.number).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 opacity-60" />
          <p className="text-xs opacity-60">{formatTimestamp(parseInt(block.timestamp))}</p>
        </div>
      </div>
      
      {/* Transaction info */}
      <div className="flex justify-between mt-1.5 text-xs">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 opacity-60" />
          <span>{block.transactionCount} txs</span>
        </div>
        <div>Gas Used: {parseInt(block.gasUsed).toLocaleString()}</div>
      </div>
      
      {/* Hash info with full hashes */}
      <div className="mt-1.5 text-xs space-y-1 overflow-hidden">
        <div className="flex items-center gap-1 opacity-80">
          <Hash className="h-3 w-3 flex-shrink-0" />
          <span className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={block.hash}>
            {block.hash}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <GitCommit className="h-3 w-3 flex-shrink-0" />
          <span className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={block.parentHash}>
            {block.parentHash}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-70">
          <FileText className="h-3 w-3 flex-shrink-0" />
          <span className="font-mono text-xs whitespace-nowrap overflow-hidden text-ellipsis" title={block.transactionsRoot}>
            {block.transactionsRoot}
          </span>
        </div>
      </div>
    </div>
  )
}

interface PendingBlockCardProps {
  lastBlockNumber: number | null
  isDark: boolean
  colorScheme: ColorScheme
  onClick: () => void
  isSelected: boolean
}

function PendingBlockCard({ lastBlockNumber, isDark, colorScheme, onClick, isSelected }: PendingBlockCardProps): React.ReactElement {
  const [progress, setProgress] = useState(0);
  const [key, setKey] = useState(0);
  
  // Reset progress when a new block comes in
  useEffect(() => {
    setProgress(0);
    setKey(prev => prev + 1);
  }, [lastBlockNumber]);
  
  // Progress bar animation
  useEffect(() => {
    const duration = 12000; // 12 seconds
    const interval = 50; // Update every 50ms for smooth animation
    const steps = duration / interval;
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min((currentStep / steps) * 100, 100));
      
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [key]);
  
  const nextBlockNumber = lastBlockNumber ? lastBlockNumber + 1 : null;
  
  return (
    <div
      onClick={onClick}
      className={`
        relative flex flex-col shrink-0 select-none 
        rounded-lg border backdrop-blur-sm px-3 py-2 
        cursor-pointer mb-2 hover:brightness-105
        ${isSelected ? 'ring-2 ring-offset-1' : ''}
      `}
      style={{
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255, 255, 255, 0.5)',
        borderColor: isSelected ? colorScheme.primary : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        color: isDark ? colorScheme.textDark : colorScheme.text,
        boxShadow: isSelected ? `0 0 15px ${colorScheme.primary}40` : 'none'
      }}
    >
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative inline-block rounded-full p-1" style={{ backgroundColor: `${colorScheme.primary}30` }}>
            <Loader2 className="h-4 w-4 animate-spin" style={{ color: colorScheme.primary }} />
          </span>
          <p className="text-md font-medium" style={{ color: colorScheme.primary }}>
            Pending Block {nextBlockNumber ? `#${nextBlockNumber.toLocaleString()}` : ''}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 opacity-60" />
          <p className="text-xs opacity-60">~12s remaining</p>
        </div>
      </div>
      
      {/* Transaction info */}
      <div className="flex justify-between mt-1.5 text-xs">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 opacity-60" />
          <span>Assembling block from transaction pool...</span>
        </div>
      </div>
      
      {/* Progress bar instead of hash info */}
      <div className="mt-3 space-y-3">
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700">
          <div 
            className="h-full rounded-full"
            style={{ 
              width: `${progress}%`,
              backgroundColor: colorScheme.primary,
              transition: 'width 50ms linear'
            }}
          />
        </div>
        
        <div className="text-xs opacity-70 text-center">
          Next block in approximately {Math.ceil(12 * (1 - progress/100))} seconds
        </div>
      </div>
    </div>
  )
}

interface BlockColumnProps {
  blocks: BlockWithStats[]
  selectedBlockNumber: number | null
  onSelectBlock: (blockNumber: number) => void
  isDark: boolean
  colorScheme: ColorScheme
}

export function BlockColumn({ 
  blocks, 
  selectedBlockNumber, 
  onSelectBlock, 
  isDark, 
  colorScheme 
}: BlockColumnProps): React.ReactElement {
  // Calculate last block number for the pending block
  const lastBlockNumber = blocks.length > 0 ? parseInt(blocks[0].number) : null;
  const pendingBlockNumber = lastBlockNumber ? lastBlockNumber + 1 : null;
  
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <h3 className="font-medium text-sm mb-3 px-1">Latest Blocks</h3>
      
      <div className="overflow-y-auto pr-2 -mr-2" style={{ height: 'calc(100% - 2rem)' }}>
        <div className="blocks-container">
          {/* Pending Block */}
          {lastBlockNumber && (
            <PendingBlockCard 
              lastBlockNumber={lastBlockNumber}
              isDark={isDark}
              colorScheme={colorScheme}
              onClick={() => pendingBlockNumber && onSelectBlock(pendingBlockNumber)}
              isSelected={pendingBlockNumber !== null && selectedBlockNumber === pendingBlockNumber}
            />
          )}
          
          {/* Existing blocks */}
          {blocks.map((block) => (
            <div key={block.hash} className="block-item">
              <BlockCard
                block={block}
                isSelected={selectedBlockNumber === parseInt(block.number)}
                onClick={() => onSelectBlock(parseInt(block.number))}
                isDark={isDark}
                colorScheme={colorScheme}
              />
            </div>
          ))}
          
          {blocks.length === 0 && (
            <div className="flex h-36 w-full items-center justify-center opacity-60">
              <p>No blocks available. Connecting to WebSocket...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 