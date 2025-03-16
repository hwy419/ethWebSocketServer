import { EventEmitter } from 'events';
import { BlockData } from '../interfaces/Block';
import { BlockMetrics } from '../utils/BlockMetrics';

export class BlockManager extends EventEmitter {
  private recentBlocks: BlockData[] = [];
  private blocksByHash: Map<string, BlockData> = new Map();
  private blocksByNumber: Map<string, BlockData> = new Map();
  private maxCacheSize: number;

  constructor(maxCacheSize: number = 500) {
    super();
    this.maxCacheSize = maxCacheSize;
    console.log(`BlockManager initialized with max cache size: ${this.maxCacheSize}`);
  }

  // Add a getter for the max cache size
  getMaxCacheSize(): number {
    return this.maxCacheSize;
  }

  // Add a method to get the current cache size
  getCacheSize(): number {
    return this.recentBlocks.length;
  }

  getRecentBlocks(): BlockData[] {
    return [...this.recentBlocks];
  }

  getBlockByHash(hash: string): BlockData | undefined {
    return this.blocksByHash.get(hash);
  }

  getBlockByNumber(number: string): BlockData | undefined {
    return this.blocksByNumber.get(number);
  }

  addBlock(block: BlockData): void {
    // Calculate metrics for the block
    block.metrics = BlockMetrics.calculateMetrics(block.transactions);

    // Check if this is a new block or a replacement (chain reorg)
    const existingBlockByNumber = this.blocksByNumber.get(block.number);
    const isReorg = existingBlockByNumber && existingBlockByNumber.hash !== block.hash;

    // Add to maps
    this.blocksByHash.set(block.hash, block);
    this.blocksByNumber.set(block.number, block);

    // If the block is new (not already in our cache)
    if (!existingBlockByNumber) {
      // Add to the front of the array
      this.recentBlocks.unshift(block);
      console.log(`BlockManager: Added block ${block.number}. Current cache size: ${this.recentBlocks.length}/${this.maxCacheSize}`);

      // If we've exceeded max cache size, remove the oldest
      if (this.recentBlocks.length > this.maxCacheSize) {
        const removedBlock = this.recentBlocks.pop();
        if (removedBlock) {
          console.log(`BlockManager: Cache limit reached. Removing oldest block ${removedBlock.number}. New cache size: ${this.recentBlocks.length}/${this.maxCacheSize}`);
          // Check if the block is still referenced by a different number
          // (this would be rare, but we should clean up properly)
          const currentByHash = this.blocksByHash.get(removedBlock.hash);
          if (currentByHash && currentByHash.number === removedBlock.number) {
            this.blocksByHash.delete(removedBlock.hash);
          }
        }
      }

      // Emit new block event
      console.log(`BlockManager: Emitting newBlock event for block ${block.number}`);
      this.emit('newBlock', block);
    } else if (isReorg) {
      // Handle chain reorganization
      // Find the block in the array and replace it
      const index = this.recentBlocks.findIndex(b => b.number === block.number);
      if (index !== -1) {
        this.recentBlocks[index] = block;
      }

      // Emit reorg event
      console.log(`BlockManager: Emitting blockReorganization event for block ${block.number}`);
      this.emit('blockReorganization', {
        oldBlock: existingBlockByNumber,
        newBlock: block
      });
    } else {
      console.log(`BlockManager: Block ${block.number} already exists with same hash, no event emitted`);
    }
  }

  addBlocks(blocks: BlockData[]): void {
    // Sort blocks by number in descending order (newest first)
    const sortedBlocks = [...blocks].sort((a, b) => 
      parseInt(b.number) - parseInt(a.number)
    );

    // Add each block
    for (const block of sortedBlocks) {
      this.addBlock(block);
    }
    
    // Log the final cache size after adding blocks
    console.log(`BlockManager: Finished adding ${blocks.length} blocks. Total blocks in cache: ${this.recentBlocks.length}/${this.maxCacheSize}`);
  }

  clear(): void {
    this.recentBlocks = [];
    this.blocksByHash.clear();
    this.blocksByNumber.clear();
    console.log('BlockManager: Cache cleared');
  }

  // Filter blocks based on criteria
  filterBlocks(filterFields?: string[], includeTransactions: boolean = true): BlockData[] {
    let filteredBlocks = this.recentBlocks;
    
    if (!includeTransactions) {
      filteredBlocks = filteredBlocks.map(block => {
        const { transactions, ...blockWithoutTransactions } = block;
        return {
          ...blockWithoutTransactions,
          transactions: transactions.map(tx => ({ hash: tx.hash }))
        } as BlockData;
      });
    }
    
    if (filterFields && filterFields.length > 0) {
      filteredBlocks = filteredBlocks.map(block => {
        const filteredBlock: any = {};
        filterFields.forEach(field => {
          if (field in block) {
            filteredBlock[field] = (block as any)[field];
          }
        });
        return filteredBlock as BlockData;
      });
    }
    
    return filteredBlocks;
  }
} 