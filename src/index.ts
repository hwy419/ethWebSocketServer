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

    // Validate configuration
    if (!ethereumNodeUrl) {
      throw new Error('ETHEREUM_NODE_URL environment variable is required');
    }

    // Initialize components
    this.blockManager = new BlockManager(numBlocksToCache);
    this.ethereumService = new EthereumService(ethereumNodeUrl);
    this.wsServer = new WebSocketServer(wsPort, this.blockManager);

    // Setup event handlers
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    // When EthereumService emits a new block, add it to the BlockManager
    this.ethereumService.on('newBlock', (block) => {
      this.blockManager.addBlock(block);
    });

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
