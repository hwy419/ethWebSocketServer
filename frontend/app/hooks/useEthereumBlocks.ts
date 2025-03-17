"use client"

import * as React from "react"

// Types based on the README.md and Project Plan
export interface Transaction {
  hash: string
  type: string 
  from: string
  to: string
  value: string
  gas: string
  gasPrice: string
  maxFeePerGas?: string
  maxPriorityFeePerGas?: string
  input?: string
}

export interface Block {
  number: string
  hash: string
  parentHash: string
  timestamp: string
  miner: string
  gasLimit: string
  gasUsed: string
  baseFeePerGas: string
  transactionsRoot: string
  transactions: Transaction[]
}

export interface BlockWithStats extends Block {
  transactionCount: number
  avgGasPrice: string
}

type WebSocketMessage = {
  type: string
  data: any
}

interface UseEthereumBlocksOptions {
  url?: string
  reconnectInterval?: number
  maxBlocks?: number
  onNewBlock?: (block: BlockWithStats) => void
}

export interface UseEthereumBlocksReturn {
  isConnected: boolean
  isConnecting: boolean
  latestBlock: BlockWithStats | null
  blocks: BlockWithStats[]
  connect: () => void
  disconnect: () => void
  reconnect: () => void
  error: Error | null
}

export function useEthereumBlocks({
  url = "ws://localhost:3000",
  reconnectInterval = 5000,
  maxBlocks = 50,
  onNewBlock,
}: UseEthereumBlocksOptions = {}): UseEthereumBlocksReturn {
  const [isConnected, setIsConnected] = React.useState(false)
  const [isConnecting, setIsConnecting] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)
  const [latestBlock, setLatestBlock] = React.useState<BlockWithStats | null>(null)
  const [blocks, setBlocks] = React.useState<BlockWithStats[]>([])
  
  const socketRef = React.useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  // Calculate block statistics
  const processBlock = React.useCallback((block: Block): BlockWithStats => {
    const transactionCount = block.transactions.length
    
    let totalGasPrice = 0
    block.transactions.forEach(tx => {
      totalGasPrice += parseInt(tx.gasPrice || "0")
    })
    
    const avgGasPrice = transactionCount > 0 
      ? (totalGasPrice / transactionCount).toString() 
      : "0"
    
    return {
      ...block,
      transactionCount,
      avgGasPrice
    }
  }, [])

  const connect = React.useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) return

    try {
      setIsConnecting(true)
      const socket = new WebSocket(url)
      socketRef.current = socket

      socket.onopen = () => {
        setIsConnected(true)
        setIsConnecting(false)
        setError(null)
        
        // Subscribe to all blocks with transactions
        socket.send(JSON.stringify({
          type: "SUBSCRIBE",
          data: {
            topic: "all_blocks",
            options: {
              includeTransactions: true
            }
          }
        }))
      }

      socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          
          if (message.type === "NEW_BLOCK") {
            const processedBlock = processBlock(message.data)
            
            setLatestBlock(processedBlock)
            setBlocks((prev: BlockWithStats[]) => [processedBlock, ...prev].slice(0, maxBlocks))
            
            if (onNewBlock) {
              onNewBlock(processedBlock)
            }
          } else if (message.type === "INITIAL_BLOCKS") {
            const processedBlocks = message.data.map(processBlock)
            setBlocks(processedBlocks)
            if (processedBlocks.length > 0) {
              setLatestBlock(processedBlocks[0])
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err)
        }
      }

      socket.onclose = () => {
        setIsConnected(false)
        setIsConnecting(false)
        
        // Attempt to reconnect
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current)
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, reconnectInterval)
      }

      socket.onerror = (err) => {
        setError(new Error("WebSocket error"))
        setIsConnecting(false)
        socket.close()
      }
    } catch (err) {
      setIsConnecting(false)
      setError(err instanceof Error ? err : new Error("Failed to connect"))
    }
  }, [url, reconnectInterval, maxBlocks, onNewBlock, processBlock])

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.close()
      socketRef.current = null
    }
    
    setIsConnected(false)
    setIsConnecting(false)
  }, [])

  const reconnect = React.useCallback(() => {
    disconnect()
    setTimeout(() => {
      connect()
    }, 500)
  }, [disconnect, connect])

  // Connect on mount
  React.useEffect(() => {
    connect()
    return () => {
      disconnect()
    }
  }, [connect, disconnect])

  return {
    isConnected,
    isConnecting,
    latestBlock,
    blocks,
    connect,
    disconnect,
    reconnect,
    error
  }
} 