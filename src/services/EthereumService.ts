import Web3 from 'web3';
import { EventEmitter } from 'events';
import { BlockData } from '../interfaces/Block';
import type { NewHeadsSubscription } from 'web3-eth';

export class EthereumService extends EventEmitter {
  private web3: Web3;
  private isConnected: boolean = false;
  private connectionRetries: number = 0;
  private maxRetries: number = 10;
  private retryDelay: number = 1000;
  private subscription: NewHeadsSubscription | null = null;

  constructor(ethereumNodeUrl: string) {
    super();
    this.web3 = new Web3(ethereumNodeUrl);
  }

  async connect(): Promise<boolean> {
    try {
      const isListening = await this.web3.eth.net.isListening();
      
      if (isListening) {
        console.log('Connected to Ethereum node');
        this.isConnected = true;
        this.connectionRetries = 0;
        return true;
      } else {
        throw new Error('Ethereum node not listening');
      }
    } catch (error) {
      console.error('Failed to connect to Ethereum node:', error);
      this.isConnected = false;
      
      if (this.connectionRetries < this.maxRetries) {
        this.connectionRetries++;
        const backoff = this.retryDelay * Math.pow(2, this.connectionRetries - 1);
        console.log(`Retrying connection in ${backoff}ms (attempt ${this.connectionRetries}/${this.maxRetries})`);
        
        setTimeout(() => {
          this.connect();
        }, backoff);
      } else {
        console.error(`Failed to connect after ${this.maxRetries} attempts`);
      }
      
      return false;
    }
  }

  async subscribeToNewBlocks(): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    try {
      // Subscribe to new block headers
      const subscription = await this.web3.eth.subscribe('newBlockHeaders');
      
      subscription.on('data', async (blockHeader: any) => {
        try {
          console.log(`EthereumService: Received new block header for block ${blockHeader.number}`);
          // Fetch the full block data including transactions
          const block = await this.getBlockByNumber(blockHeader.number);
          if (block) {
            console.log(`EthereumService: Emitting new block ${block.number}`);
            this.emit('newBlock', block);
          } else {
            console.error(`EthereumService: Failed to get full block data for block ${blockHeader.number}`);
          }
        } catch (error) {
          console.error('Error fetching full block data:', error);
        }
      });
      
      subscription.on('error', (error: Error) => {
        console.error('Block subscription error:', error);
        this.subscription = null;
        // Try to resubscribe
        setTimeout(() => this.subscribeToNewBlocks(), 5000);
      });
      
      this.subscription = subscription;
      console.log('Subscribed to new blocks');
    } catch (error) {
      console.error('Failed to subscribe to blocks:', error);
      // Try to resubscribe
      setTimeout(() => this.subscribeToNewBlocks(), 5000);
    }
  }

  async getBlockByNumber(blockNumber: string | number): Promise<BlockData | null> {
    try {
      // Get full block with transactions
      const block = await this.web3.eth.getBlock(blockNumber, true);
      
      // Convert the block to a safe format for JSON serialization
      const safeBlock = this.convertBlockToSafeFormat(block);
      
      return safeBlock as BlockData;
    } catch (error) {
      console.error(`Error fetching block ${blockNumber}:`, error);
      return null;
    }
  }

  /**
   * Converts block data to a format safe for JSON serialization
   * by converting BigInt values to strings
   */
  private convertBlockToSafeFormat(block: any): any {
    if (!block) return null;

    // Create a new object with the same properties as block
    const safeBlock: any = {};

    // Convert all properties to safe formats
    for (const [key, value] of Object.entries(block)) {
      if (typeof value === 'bigint') {
        // Convert BigInt to string
        safeBlock[key] = value.toString();
      } else if (Array.isArray(value)) {
        // Handle arrays (like transactions)
        safeBlock[key] = value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return this.convertBlockToSafeFormat(item);
          }
          return typeof item === 'bigint' ? item.toString() : item;
        });
      } else if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        safeBlock[key] = this.convertBlockToSafeFormat(value);
      } else {
        // Pass through other values
        safeBlock[key] = value;
      }
    }

    return safeBlock;
  }

  async getLatestBlockNumber(): Promise<number> {
    try {
      const blockNumber = await this.web3.eth.getBlockNumber();
      return Number(blockNumber); // Convert bigint to number
    } catch (error) {
      console.error('Error fetching latest block number:', error);
      throw error;
    }
  }

  async backfillBlocks(count: number): Promise<BlockData[]> {
    try {
      const latestBlockNumber = await this.getLatestBlockNumber();
      const blocks: BlockData[] = [];
      
      // Get the last 'count' blocks
      for (let i = 0; i < count; i++) {
        const blockNumber = latestBlockNumber - i;
        if (blockNumber >= 0) {
          const block = await this.getBlockByNumber(blockNumber);
          if (block) {
            blocks.push(block);
          }
        }
      }
      
      return blocks;
    } catch (error) {
      console.error('Error backfilling blocks:', error);
      return [];
    }
  }

  unsubscribe(): void {
    if (this.subscription) {
      try {
        this.subscription.unsubscribe();
        console.log('Unsubscribed from blocks');
      } catch (error) {
        console.error('Error unsubscribing from blocks:', error);
      }
      this.subscription = null;
    }
  }
} 