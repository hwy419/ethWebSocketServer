# Ethereum Block Tracker

A robust, real-time Ethereum blockchain monitoring service that tracks new blocks and delivers instant updates to connected clients via WebSockets. This application establishes a persistent connection to the Ethereum network through QuickNode, subscribes to new block events, and maintains an in-memory cache of the 50 most recent blocks with complete transaction data.

## Overview

The Ethereum Block Tracker serves as a reliable middleware between your applications and the Ethereum blockchain, eliminating the complexity of directly managing blockchain connections while providing low-latency access to the latest network activity.

![Ethereum Block Tracker Architecture](https://placeholder-for-architecture-diagram.com)

## Key Features

- **Real-time Block Monitoring**: Receive instant notifications when new blocks are mined on the Ethereum blockchain
- **Complete Transaction Data**: Access comprehensive block data including transactions, receipts, and post-Cancun fields (blob gas, withdrawals)
- **Efficient Memory Management**: Maintains a thread-safe, in-memory cache of the 50 most recent blocks
- **Resilient Connection Handling**: Automatically handles node disconnections with intelligent reconnection strategies
- **Chain Reorganization Detection**: Properly identifies and propagates blockchain reorganizations to clients
- **WebSocket Subscription System**: Allows clients to subscribe to specific blockchain events and data
- **Customizable Data Filters**: Clients can specify exactly which block data they need, reducing bandwidth
- **Historical Block Backfilling**: Automatically loads recent historical blocks on startup
- **Optimized Performance**: Uses efficient data structures for O(1) lookups by block hash and number

## Technology Stack

- **Node.js**: Core runtime environment
- **web3.js**: Ethereum JavaScript API for blockchain interaction
- **WebSockets**: For real-time, bidirectional communication with clients
- **QuickNode**: Enterprise-grade Ethereum node provider for reliable blockchain access

## Use Cases

- **DApp Developers**: Monitor transaction confirmations and blockchain state in real-time
- **DEX and Trading Applications**: Get immediate updates on blockchain changes for time-sensitive operations
- **NFT Platforms**: Track minting events and ownership transfers as they occur
- **Data Analytics Services**: Collect real-time on-chain data for analysis and visualization
- **Educational Tools**: Demonstrate blockchain operations with live data
- **Blockchain Explorers**: Power user-facing block exploration tools

## Data Capabilities

The service provides rich block data including:

- Block headers (number, hash, parentHash, timestamp)
- Gas information (gasLimit, gasUsed, baseFeePerGas)
- Post-Cancun features (blobGasUsed, excessBlobGas)
- Merkle roots (transactionsRoot, receiptsRoot, stateRoot)
- Validator withdrawals with recipient details
- Complete transaction objects with:
  - Transaction metadata (hash, nonce, type)
  - Sender and recipient addresses
  - Value transfers and contract interactions
  - Gas parameters including EIP-1559 fields
  - Signature components

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- A QuickNode Ethereum endpoint API key
- WebSocket client library for your frontend/application

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ethereum-block-tracker.git

# Install dependencies
cd ethereum-block-tracker
npm install

# Configure environment
cp .env.example .env
# Edit .env with your QuickNode API key and other settings

# Start the server
npm start
```

## Client Integration

Connect to the WebSocket server and subscribe to block updates:

```javascript
const socket = new WebSocket('ws://your-server-address:port');

socket.onopen = () => {
  // Subscribe to all blocks with transactions
  socket.send(JSON.stringify({
    type: 'subscribe',
    topic: 'all_blocks',
    options: {
      includeTransactions: true
    }
  }));
};

socket.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  if (message.type === 'NEW_BLOCK') {
    console.log(`New block received: ${message.data.number}`);
    // Process block data
  }
};
```

## Testing with Postman

You can use Postman to test the WebSocket server:

1. Open Postman and create a new WebSocket request
2. Set the URL to `ws://localhost:3000` (or your configured port)
3. Connect to the WebSocket server by clicking "Connect"

### Sending Messages

1. Once connected, you can send subscription messages in the "Message" panel:
   ```json
   {
     "type": "SUBSCRIBE",
     "data": {
       "topic": "all_blocks",
       "options": {
         "includeTransactions": true,
         "filterFields": ["hash", "number", "timestamp", "miner", "metrics"]
       }
     }
   }
   ```

2. To unsubscribe:
   ```json
   {
     "type": "UNSUBSCRIBE",
     "data": {
       "topic": "all_blocks"
     }
   }
   ```

### Configuring Maximum Payload Size

Ethereum blocks can be large, especially when including transactions. To handle this in Postman:

1. Go to Settings (Settings Tab - underneath the Request address URL)
2. Configure 'Maximum Message Size' to 0

This setting is crucial because Ethereum blocks with many transactions can exceed Postman's default message size limits, resulting in connection errors or truncated data.

## Future Extensions

The system is designed to be modular and extensible, with potential expansions including:

- Advanced filtering capabilities for specific transaction types or addresses
- Persistent storage for historical block data
- Real-time analytics on blockchain metrics
- Web-based dashboard for visual monitoring
- Smart contract event monitoring and notification
- Support for multiple blockchain networks

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Ethereum Foundation for the blockchain protocol
- QuickNode for reliable node infrastructure
- web3.js contributors for the Ethereum JavaScript API

---

*Ethereum Block Tracker: Your window into the blockchain, one block at a time.* 