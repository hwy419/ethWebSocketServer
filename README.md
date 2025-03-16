# Ethereum Block Tracker WebSocket Server

A robust server that tracks Ethereum blocks and shares updates with connected clients via WebSockets.

## Features

- 🔄 Real-time tracking of new Ethereum blocks
- 📡 WebSocket API for clients to subscribe to block updates
- 🏪 In-memory caching of recent blocks
- 🔎 Support for filtering block data based on client preferences
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
   ETHEREUM_NODE_URL=your_quicknode_ethereum_endpoint_url
   
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
         "filterFields": ["hash", "number", "timestamp"]
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
     "data": {/* Block object */},
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

## Architecture

The system is built with a modular architecture:

- **EthereumService**: Handles blockchain connection and event subscription
- **BlockManager**: Maintains the in-memory block cache and emits events
- **WebSocketServer**: Manages client connections and message handling
- **Application**: Coordinates all components and handles lifecycle

## License

MIT

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

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
         "filterFields": ["hash", "number", "timestamp", "miner"]
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

### Troubleshooting Connection Issues

- If you're receiving incomplete data or connection errors, try increasing the maximum payload size
- Ensure your Ethereum node URL in the `.env` file is valid and accessible
- Check that you're using the correct port specified in your `.env` file

## Running the Example Client

An example client implementation is included to test connectivity:

```
npm run client
```

This will run the example client that connects to the WebSocket server and subscribes to block updates. 