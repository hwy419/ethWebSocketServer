# Ethereum Block Tracker WebSocket Server

A robust server that tracks Ethereum blocks and shares updates with connected clients via WebSockets.

## Features

- 🔄 Real-time tracking of new Ethereum blocks
- 📡 WebSocket API for clients to subscribe to block updates
- 🏪 In-memory caching of recent blocks
- 🔎 Support for filtering block data based on client preferences
- 📊 Rich block metrics for transaction analysis
- ⚡ Chain reorganization detection and notification
- 🛡️ Error handling and automatic reconnection

## Prerequisites

- Node.js v16+
- npm or yarn
- Access to an Ethereum API endpoint (e.g., Quicknode, Infura, Alchemy)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/ethWebSocketServer.git
   cd ethWebSocketServer
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with your configuration:
   ```
   # Ethereum Node Connection
   ETHEREUM_NODE_URL=your_ethereum_endpoint_url
   
   # WebSocket Server Configuration
   WS_PORT=3000
   
   # Application Configuration
   NUM_BLOCKS_TO_CACHE=50
   ```

## Usage

### Development

Start the server in development mode with hot reloading:

```
npm run dev
```

### Production

Build and start the server in production mode:

```
npm run build
npm start
```

### Running the Example Client

An example client implementation is included to test connectivity:

```
npm run client
```

### Block Metrics Example

To explore the block metrics functionality:

```
cd examples
npx ts-node blockMetrics.ts
```

## WebSocket API

Clients can connect to the WebSocket server at `ws://localhost:3000` (or whatever port you configure).

### Messages

#### Client to Server

1. **Subscribe to all blocks**
   ```json
   {
     "type": "SUBSCRIBE",
     "data": {
       "topic": "all_blocks",
       "options": {
         "includeTransactions": true,
         "filterFields": ["hash", "number", "timestamp", "metrics"]
       }
     }
   }
   ```

2. **Unsubscribe from all blocks**
   ```json
   {
     "type": "UNSUBSCRIBE",
     "data": {
       "topic": "all_blocks"
     }
   }
   ```

#### Server to Client

1. **Initial Blocks**
   ```json
   {
     "type": "INITIAL_BLOCKS",
     "data": [/* Array of block objects */],
     "timestamp": 1681234567890
   }
   ```

2. **New Block**
   ```json
   {
     "type": "NEW_BLOCK",
     "data": {
       "hash": "0x...",
       "number": "1234567",
       "timestamp": "1681234567",
       "metrics": {
         "averageTxValue": "125000000000000000",
         "highestTxValue": "1000000000000000000",
         "lowestTxValue": "100000000000000",
         "transactionCounts": {
           "legacy": 5,
           "eip1559": 42,
           "blob": 3
         },
         "gasSums": {
           "legacy": "105000",
           "eip1559": "2100000",
           "blob": "600000",
           "total": "2805000"
         },
         "highestGasPrice": "25000000000",
         "lowestGasPrice": "12000000000",
         "averageGasPrice": "18500000000"
       },
       // Other block fields...
     },
     "timestamp": 1681234567890
   }
   ```

3. **Error**
   ```json
   {
     "type": "ERROR",
     "error": "Error message",
     "timestamp": 1681234567890
   }
   ```

## Block Metrics

Each block now includes a `metrics` object with the following properties:

| Metric | Description | Units |
|--------|-------------|-------|
| `averageTxValue` | Average value of all transactions in the block | Wei (string) |
| `highestTxValue` | Highest transaction value in the block | Wei (string) |
| `lowestTxValue` | Lowest non-zero transaction value in the block | Wei (string) |
| `transactionCounts` | Number of each transaction type | Object |
| `transactionCounts.legacy` | Number of legacy transactions | Number |
| `transactionCounts.eip1559` | Number of EIP-1559 transactions | Number |
| `transactionCounts.blob` | Number of blob transactions (EIP-4844) | Number |
| `gasSums` | Sum of gas limits by transaction type | Object |
| `gasSums.legacy` | Total gas for legacy transactions | String |
| `gasSums.eip1559` | Total gas for EIP-1559 transactions | String |
| `gasSums.blob` | Total gas for blob transactions | String |
| `gasSums.total` | Total gas for all transactions | String |
| `highestGasPrice` | Highest gas price of any transaction | Wei (string) |
| `lowestGasPrice` | Lowest gas price of any transaction | Wei (string) |
| `averageGasPrice` | Average gas price across all transactions | Wei (string) |

## Architecture

The system is built with a modular architecture:

- **EthereumService**: Handles blockchain connection and event subscription
- **BlockManager**: Maintains the in-memory block cache and emits events
- **WebSocketServer**: Manages client connections and message handling
- **BlockMetrics**: Calculates transaction metrics for each block
- **Application**: Coordinates all components and handles lifecycle

## Troubleshooting

### Connection Issues

- Ensure your Ethereum node URL in the `.env` file is valid and accessible
- Check that you're using the correct port specified in your `.env` file
- Make sure your firewall allows WebSocket connections on the configured port

### Large Block Handling

For handling large blocks with many transactions:

1. Increase the `WS_PORT` number in your `.env` if necessary
2. Consider reducing the number of blocks cached with `NUM_BLOCKS_TO_CACHE` 
3. Use selective filtering in your subscription to include only needed fields

### Client-Side Considerations

When implementing a client:

- Configure appropriate WebSocket buffer sizes for large blocks
- Implement reconnection logic for handling disconnections
- Use selective field filtering to reduce payload size

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
2. Configure 'Maximum Message Size' to 0.

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 