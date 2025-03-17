"use client"

import React from "react"
import type { BlockWithStats, Transaction } from "../hooks/useEthereumBlocks"
import type { ColorScheme } from "./BlockRow"
import { formatEthValue } from "./utils/formatters"

// Custom treemap visualization for transactions
interface TreemapProps {
  block: BlockWithStats | null
  isDark: boolean
  colorScheme: ColorScheme
}

interface TreemapItem {
  id: string
  label: string
  value: number
  color: string
}

type TransactionType = 'Transfer' | 'Contract' | 'TokenTransfer' | 'Unknown'

function getTransactionType(tx: Transaction): TransactionType {
  if (tx.to === null || tx.to === '') return 'Contract'
  if (tx.input && tx.input !== '0x') return 'TokenTransfer'
  return 'Transfer'
}

export function TransactionTreemap({ block, isDark, colorScheme }: TreemapProps): React.ReactElement {
  if (!block || !block.transactions || block.transactions.length === 0) {
    return (
      <div className="rounded-lg border p-6 text-center"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.7)' : 'rgba(255, 255, 255, 0.7)',
        }}>
        <p className="opacity-60">Select a block to view transaction details</p>
      </div>
    )
  }

  // Group transactions by type
  const txByType: Record<TransactionType, Transaction[]> = {
    'Transfer': [],
    'Contract': [],
    'TokenTransfer': [],
    'Unknown': []
  }
  
  block.transactions.forEach(tx => {
    const type = getTransactionType(tx)
    txByType[type].push(tx)
  })

  // Calculate the sum of values for each type
  const txValueByType: Record<TransactionType, number> = {
    'Transfer': 0,
    'Contract': 0,
    'TokenTransfer': 0,
    'Unknown': 0
  }
  
  Object.entries(txByType).forEach(([type, txs]) => {
    txValueByType[type as TransactionType] = txs.reduce((sum, tx) => sum + parseInt(tx.value || '0'), 0)
  })

  // Prepare treemap items with proper colors
  const treemapItems: TreemapItem[] = [
    {
      id: 'Transfer',
      label: `Transfers (${txByType['Transfer'].length})`,
      value: txValueByType['Transfer'],
      color: colorScheme.primary
    },
    {
      id: 'Contract',
      label: `Contract Deployments (${txByType['Contract'].length})`,
      value: txValueByType['Contract'],
      color: colorScheme.secondary
    },
    {
      id: 'TokenTransfer',
      label: `Token Transfers (${txByType['TokenTransfer'].length})`,
      value: txValueByType['TokenTransfer'],
      color: colorScheme.accent
    }
  ].filter(item => item.value > 0)

  // Simple custom treemap implementation
  const totalValue = treemapItems.reduce((sum, item) => sum + item.value, 0) || 1
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Block #{parseInt(block.number).toLocaleString()} Transactions
        </h2>
        <div className="text-sm opacity-70">
          {block.transactions.length} transactions
        </div>
      </div>
      
      <div className="h-[400px] rounded-lg overflow-hidden relative border"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
          backgroundColor: isDark ? 'rgba(17, 24, 39, 0.3)' : 'rgba(255, 255, 255, 0.3)'
        }}>
        <div className="flex flex-wrap w-full h-full">
          {treemapItems.map((item) => {
            const width = `${(item.value / totalValue) * 100}%`
            
            return (
              <div key={item.id} className="h-full flex flex-col justify-center items-center overflow-hidden p-4"
                style={{ 
                  width,
                  backgroundColor: `${item.color}30`,
                  borderRight: `2px solid ${isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.6)'}`
                }}
              >
                <div className="text-center flex flex-col gap-2">
                  <div className="font-medium" style={{ color: item.color }}>{item.label}</div>
                  <div className="text-sm opacity-80">{formatEthValue(item.value)}</div>
                </div>
              </div>
            )
          })}
          
          {treemapItems.length === 0 && (
            <div className="flex h-full w-full items-center justify-center">
              <p className="opacity-60">No transaction value to display</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div className="rounded-lg p-4"
          style={{ backgroundColor: `${colorScheme.primary}20` }}
        >
          <div className="font-medium" style={{ color: colorScheme.primary }}>
            Regular Transfers
          </div>
          <div className="text-2xl font-bold mt-1">
            {txByType['Transfer'].length}
          </div>
          <div className="text-sm mt-2 opacity-70">
            Value: {formatEthValue(txValueByType['Transfer'])}
          </div>
        </div>
        
        <div className="rounded-lg p-4"
          style={{ backgroundColor: `${colorScheme.secondary}20` }}
        >
          <div className="font-medium" style={{ color: colorScheme.secondary }}>
            Contract Deployments
          </div>
          <div className="text-2xl font-bold mt-1">
            {txByType['Contract'].length}
          </div>
          <div className="text-sm mt-2 opacity-70">
            Value: {formatEthValue(txValueByType['Contract'])}
          </div>
        </div>
        
        <div className="rounded-lg p-4"
          style={{ backgroundColor: `${colorScheme.accent}20` }}
        >
          <div className="font-medium" style={{ color: colorScheme.accent }}>
            Token Transfers
          </div>
          <div className="text-2xl font-bold mt-1">
            {txByType['TokenTransfer'].length}
          </div>
          <div className="text-sm mt-2 opacity-70">
            Value: {formatEthValue(txValueByType['TokenTransfer'])}
          </div>
        </div>
      </div>
    </div>
  )
} 