import dotenv from 'dotenv';
import { EthereumService } from './services/EthereumService';
import { BlockManager } from './managers/BlockManager';
import { WebSocketServer } from './services/WebSocketServer';

// Load environment variables from .env file
dotenv.config();

class Application {
  private ethereumService: EthereumService;
  private blockManager: BlockManager;
  private wsServer: WebSocketServer;

  constructor() {
    // Get configuration from environment variables
    const ethereumNodeUrl = process.env.ETHEREUM_NODE_URL || '';
    const wsPort = parseInt(process.env.WS_PORT || '3000', 10);
    const numBlocksToCache = parseInt(process.env.NUM_BLOCKS_TO_CACHE || '50', 10);
    const maxNumBlocksToCache = parseInt(process.env.MAX_NUM_BLOCKS_TO_CACHE || '500', 10);

    // Validate configuration
    if (!ethereumNodeUrl) {
      throw new Error('ETHEREUM_NODE_URL environment variable is required');
    }

    // Initialize components
    this.blockManager = new BlockManager(maxNumBlocksToCache);
    this.ethereumService = new EthereumService(ethereumNodeUrl);
    this.wsServer = new WebSocketServer(wsPort, this.blockManager);

    // Setup event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // When EthereumService emits a new block, add it to the BlockManager
    this.ethereumService.on('newBlock', (block) => {
      console.log(`Application: Received new block ${block.number} from EthereumService, adding to BlockManager`);
      this.blockManager.addBlock(block);
    });

    // Set up periodic cache size logging
    const logInterval = parseInt(process.env.CACHE_LOG_INTERVAL || '300000', 10); // Default: 5 minutes
    if (logInterval > 0) {
      setInterval(() => {
        const cacheSize = this.blockManager.getCacheSize();
        const maxSize = this.blockManager.getMaxCacheSize();
        console.log(`[CACHE STATS] Current blocks in cache: ${cacheSize}/${maxSize} (${((cacheSize / maxSize) * 100).toFixed(2)}% of capacity)`);
      }, logInterval);
    }

    // Handle process termination signals
    process.on('SIGINT', this.shutdown.bind(this));
    process.on('SIGTERM', this.shutdown.bind(this));
  }

  async start(): Promise<void> {
    try {
      console.log('Starting Ethereum Block Tracker...');
      
      // Connect to Ethereum node
      const connected = await this.ethereumService.connect();
      if (!connected) {
        throw new Error('Failed to connect to Ethereum node');
      }

      // Backfill recent blocks
      console.log('Backfilling recent blocks...');
      const numBlocksToCache = parseInt(process.env.NUM_BLOCKS_TO_CACHE || '50', 10);
      const blocks = await this.ethereumService.backfillBlocks(numBlocksToCache);
      this.blockManager.addBlocks(blocks);
      console.log(`Backfilled ${blocks.length} blocks`);

      // Subscribe to new blocks
      await this.ethereumService.subscribeToNewBlocks();
      
      console.log(`WebSocket server running on port ${process.env.WS_PORT || 3000}`);
      console.log('Ethereum Block Tracker is ready!');
    } catch (error) {
      console.error('Failed to start application:', error);
      this.shutdown();
    }
  }

  async shutdown(): Promise<void> {
    console.log('Shutting down...');
    
    // Unsubscribe from block events
    this.ethereumService.unsubscribe();
    
    // Close WebSocket server
    this.wsServer.close();
    
    console.log('Shutdown complete');
    process.exit(0);
  }
}

// Create and start the application
const app = new Application();
app.start().catch((error) => {
  console.error('Application start error:', error);
  process.exit(1);
});
