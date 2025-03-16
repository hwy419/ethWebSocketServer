import { Server, WebSocket } from 'ws';
import { EventEmitter } from 'events';
import { 
  MessageType, 
  Subscription, 
  WebSocketMessage,
  ErrorMessage
} from '../interfaces/WebSocketMessage';
import { BlockData } from '../interfaces/Block';
import { BlockManager } from '../managers/BlockManager';
import { serializeBigInt } from '../utils/serializer';

interface Client {
  id: string;
  socket: WebSocket;
  subscriptions: Subscription[];
  isAlive: boolean;
}

export class WebSocketServer extends EventEmitter {
  private server: Server;
  private clients: Map<string, Client> = new Map();
  private blockManager: BlockManager;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(port: number, blockManager: BlockManager) {
    super();
    this.blockManager = blockManager;
    this.server = new Server({ port });
    this.setupServer();
    this.setupBlockManagerListeners();
  }

  private setupServer(): void {
    this.server.on('connection', this.handleConnection.bind(this));
    this.server.on('error', (error) => {
      console.error('WebSocket server error:', error);
    });

    // Set up ping interval to detect dead clients
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client) => {
        if (!client.isAlive) {
          // Client didn't respond to ping, terminate connection
          client.socket.terminate();
          this.clients.delete(client.id);
          return;
        }

        client.isAlive = false;
        client.socket.ping();
      });
    }, 30000); // Check every 30 seconds
  }

  private setupBlockManagerListeners(): void {
    // Listen for new blocks
    this.blockManager.on('newBlock', (block: BlockData) => {
      this.broadcastNewBlock(block);
    });

    // Listen for block reorganizations
    this.blockManager.on('blockReorganization', (data: { oldBlock: BlockData, newBlock: BlockData }) => {
      this.broadcastBlockReorganization(data);
    });
  }

  private handleConnection(socket: WebSocket): void {
    const clientId = this.generateClientId();
    
    const client: Client = {
      id: clientId,
      socket,
      subscriptions: [],
      isAlive: true
    };

    // Add client to map
    this.clients.set(clientId, client);

    // Setup event handlers for the client
    socket.on('message', (message) => this.handleMessage(client, message));
    
    socket.on('pong', () => {
      client.isAlive = true;
    });

    socket.on('close', () => {
      this.clients.delete(clientId);
      console.log(`Client ${clientId} disconnected`);
    });

    socket.on('error', (error) => {
      console.error(`Client ${clientId} error:`, error);
      this.clients.delete(clientId);
    });

    // Send initial blocks to the client
    this.sendInitialBlocks(client);
  }

  private handleMessage(client: Client, data: any): void {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case MessageType.SUBSCRIBE:
          this.handleSubscribe(client, message.data);
          break;
        case MessageType.UNSUBSCRIBE:
          this.handleUnsubscribe(client, message.data);
          break;
        default:
          this.sendErrorToClient(client, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error('Error handling client message:', error);
      this.sendErrorToClient(client, 'Failed to parse message');
    }
  }

  private handleSubscribe(client: Client, subscription: Subscription): void {
    if (!subscription || !subscription.topic) {
      this.sendErrorToClient(client, 'Invalid subscription format');
      return;
    }

    // Add subscription
    client.subscriptions.push(subscription);
    console.log(`Client ${client.id} subscribed to ${subscription.topic}`);

    // Send current data based on subscription
    if (subscription.topic === 'all_blocks') {
      const blocks = this.blockManager.filterBlocks(
        subscription.options?.filterFields,
        subscription.options?.includeTransactions
      );
      
      this.sendToClient(client, {
        type: MessageType.INITIAL_BLOCKS,
        data: blocks,
        timestamp: Date.now()
      });
    }
  }

  private handleUnsubscribe(client: Client, subscription: { topic: string }): void {
    if (!subscription || !subscription.topic) {
      this.sendErrorToClient(client, 'Invalid unsubscribe format');
      return;
    }

    // Remove subscription
    client.subscriptions = client.subscriptions.filter(
      (sub) => sub.topic !== subscription.topic
    );
    
    console.log(`Client ${client.id} unsubscribed from ${subscription.topic}`);
  }

  private sendInitialBlocks(client: Client): void {
    const blocks = this.blockManager.getRecentBlocks();
    
    this.sendToClient(client, {
      type: MessageType.INITIAL_BLOCKS,
      data: blocks,
      timestamp: Date.now()
    });
  }

  private broadcastNewBlock(block: BlockData): void {
    this.clients.forEach((client) => {
      // Check if client is subscribed to blocks
      const subscription = client.subscriptions.find(sub => sub.topic === 'all_blocks');
      
      if (subscription) {
        // Apply any filters from the subscription
        let blockToSend = block;
        
        if (subscription.options) {
          const { filterFields, includeTransactions } = subscription.options;
          
          // Filter transactions if needed
          if (includeTransactions === false) {
            const { transactions, ...blockWithoutTx } = block;
            blockToSend = {
              ...blockWithoutTx,
              transactions: transactions.map(tx => ({ hash: tx.hash }))
            } as BlockData;
          }
          
          // Filter fields if specified
          if (filterFields && filterFields.length > 0) {
            const filteredBlock: any = {};
            filterFields.forEach(field => {
              if (field in block) {
                filteredBlock[field] = (block as any)[field];
              }
            });
            blockToSend = filteredBlock as BlockData;
          }
        }
        
        this.sendToClient(client, {
          type: MessageType.NEW_BLOCK,
          data: blockToSend,
          timestamp: Date.now()
        });
      }
    });
  }

  private broadcastBlockReorganization(data: { oldBlock: BlockData, newBlock: BlockData }): void {
    this.clients.forEach((client) => {
      // Check if client is subscribed to blocks
      const subscription = client.subscriptions.find(sub => sub.topic === 'all_blocks');
      
      if (subscription) {
        this.sendToClient(client, {
          type: MessageType.NEW_BLOCK,
          data: {
            reorg: true,
            old: data.oldBlock,
            new: data.newBlock
          },
          timestamp: Date.now()
        });
      }
    });
  }

  private sendToClient(client: Client, message: WebSocketMessage): void {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(serializeBigInt(message));
    }
  }

  private sendErrorToClient(client: Client, errorMessage: string): void {
    const message: ErrorMessage = {
      type: MessageType.ERROR,
      error: errorMessage,
      timestamp: Date.now()
    };
    
    this.sendToClient(client, message);
  }

  private generateClientId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  public close(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    
    this.server.close((err) => {
      if (err) {
        console.error('Error closing WebSocket server:', err);
      } else {
        console.log('WebSocket server closed');
      }
    });
  }
} 