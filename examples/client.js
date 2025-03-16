const WebSocket = require('ws');

// Configuration
const WS_URL = 'ws://localhost:3000';

// Create WebSocket connection
const ws = new WebSocket(WS_URL);

// Connection opened
ws.on('open', function() {
  console.log('Connected to Ethereum Block Tracker');
  
  // Subscribe to all blocks
  const subscribeMessage = {
    type: 'SUBSCRIBE',
    data: {
      topic: 'all_blocks',
      options: {
        includeTransactions: true,
        filterFields: ['hash', 'number', 'timestamp', 'miner']
      }
    }
  };
  
  ws.send(JSON.stringify(subscribeMessage));
  console.log('Subscribed to block updates');
});

// Listen for messages
ws.on('message', function(data) {
  try {
    const message = JSON.parse(data);
    
    switch (message.type) {
      case 'INITIAL_BLOCKS':
        console.log(`Received ${message.data.length} initial blocks`);
        
        // Print the latest block
        if (message.data.length > 0) {
          console.log('Latest block:', {
            number: message.data[0].number,
            hash: message.data[0].hash,
            timestamp: message.data[0].timestamp,
            txCount: message.data[0].transactions ? message.data[0].transactions.length : 0
          });
        }
        break;
        
      case 'NEW_BLOCK':
        console.log('New block:', {
          number: message.data.number,
          hash: message.data.hash,
          timestamp: message.data.timestamp,
          txCount: message.data.transactions ? message.data.transactions.length : 0
        });
        break;
        
      case 'ERROR':
        console.error('Error from server:', message.error);
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  } catch (error) {
    console.error('Error parsing message:', error);
    console.log('Raw message:', data.toString());
  }
});

// Handle errors
ws.on('error', function(error) {
  console.error('WebSocket error:', error);
});

// Connection closed
ws.on('close', function() {
  console.log('Connection closed');
});

// Handle process termination
process.on('SIGINT', function() {
  console.log('Disconnecting...');
  
  // Unsubscribe before closing
  const unsubscribeMessage = {
    type: 'UNSUBSCRIBE',
    data: {
      topic: 'all_blocks'
    }
  };
  
  ws.send(JSON.stringify(unsubscribeMessage));
  
  // Close connection
  setTimeout(() => {
    ws.close();
    process.exit(0);
  }, 1000);
}); 