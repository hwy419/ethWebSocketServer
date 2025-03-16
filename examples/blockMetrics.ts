import WebSocket from 'ws';
import dotenv from 'dotenv';
import { BlockData, TransactionData } from '../src/interfaces/Block';
import { BlockMetricsData } from '../src/interfaces/BlockMetrics';
import { MessageType, Subscription } from '../src/interfaces/WebSocketMessage';

// Load environment variables
dotenv.config();

// Helper function to format wei to ETH
const weiToEth = (wei: string): string => {
  return (Number(wei) / 1e18).toString();
};

// Helper function to format wei to Gwei
const weiToGwei = (wei: string): string => {
  return (Number(wei) / 1e9).toString();
};

// Helper to print metrics to console
const printMetrics = (block: BlockData): void => {
  if (!block || !block.metrics) {
    console.log('No metrics available for this block');
    return;
  }
  
  const metrics = block.metrics as BlockMetricsData;
  
  console.log(`\n======= BLOCK ${block.number} METRICS =======`);
  console.log(`Block hash: ${block.hash}`);
  console.log(`Block timestamp: ${new Date(parseInt(block.timestamp) * 1000).toLocaleString()}`);
  console.log(`Transactions count: ${block.transactions.length}`);
  
  // Transaction value metrics
  console.log('\nTransaction Value Metrics:');
  console.log(`- Average Transaction Value: ${weiToEth(metrics.averageTxValue)} ETH`);
  console.log(`- Highest Transaction Value: ${weiToEth(metrics.highestTxValue)} ETH`);
  console.log(`- Lowest Transaction Value: ${weiToEth(metrics.lowestTxValue)} ETH`);
  
  // Transaction type counts
  console.log('\nTransaction Type Counts:');
  console.log(`- Legacy: ${metrics.transactionCounts.legacy}`);
  console.log(`- EIP-1559: ${metrics.transactionCounts.eip1559}`);
  console.log(`- Blob: ${metrics.transactionCounts.blob}`);
  
  // Gas sums by transaction type
  console.log('\nGas Sums by Transaction Type:');
  console.log(`- Legacy: ${metrics.gasSums.legacy} gas units`);
  console.log(`- EIP-1559: ${metrics.gasSums.eip1559} gas units`);
  console.log(`- Blob: ${metrics.gasSums.blob} gas units`);
  console.log(`- Total: ${metrics.gasSums.total} gas units`);
  
  // Gas price metrics
  console.log('\nGas Price Metrics:');
  console.log(`- Highest Gas Price: ${weiToGwei(metrics.highestGasPrice)} Gwei`);
  console.log(`- Lowest Gas Price: ${weiToGwei(metrics.lowestGasPrice)} Gwei`);
  console.log(`- Average Gas Price: ${weiToGwei(metrics.averageGasPrice)} Gwei`);
  console.log('\n========================================\n');
};

// Main function to connect to WebSocket and process real-time block data
const connectToBlockStream = () => {
  // Get WebSocket server URL from environment variables or use default
  const wsUrl = process.env.WS_URL || 'ws://localhost:3000';
  
  console.log(`Connecting to WebSocket server at ${wsUrl}...`);
  
  // Create WebSocket connection
  const ws = new WebSocket(wsUrl);
  
  // Connection opened
  ws.on('open', () => {
    console.log('Connected to WebSocket server');
    console.log('Waiting for real-time block data...');
    
    // Subscribe to all blocks with full transactions
    ws.send(JSON.stringify({
      type: MessageType.SUBSCRIBE,
      data: {
        topic: 'all_blocks',
        options: {
          includeTransactions: true
        }
      }
    }));
  });
  
  // Listen for messages
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      // Handle different message types
      switch (message.type) {
        case 'INITIAL_BLOCKS':
          console.log(`Received ${message.data.length} initial blocks`);
          // Print the most recent block's metrics
          if (message.data.length > 0) {
            const latestBlock = message.data[0] as BlockData;
            console.log(`Latest block in cache: ${latestBlock.number}`);
            printMetrics(latestBlock);
          }
          break;
          
        case 'NEW_BLOCK':
          // New block received
          const block = message.data as BlockData;
          console.log(`\nReceived new block: ${block.number}`);
          printMetrics(block);
          break;
          
        case 'ERROR':
          console.error(`WebSocket error: ${message.error || message.data}`);
          break;
          
        default:
          console.log(`Received unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });
  
  // Handle WebSocket errors
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
  
  // Handle WebSocket close
  ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
    // Try to reconnect after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      connectToBlockStream();
    }, 5000);
  });
  
  // Handle CTRL+C to exit gracefully
  process.on('SIGINT', () => {
    console.log('Closing WebSocket connection...');
    ws.close();
    process.exit(0);
  });
};

// Run the example
console.log('Block Metrics Real-time Example');
console.log('-------------------------------');
connectToBlockStream(); 