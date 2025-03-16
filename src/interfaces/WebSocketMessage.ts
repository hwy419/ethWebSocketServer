export enum MessageType {
  NEW_BLOCK = 'NEW_BLOCK',
  INITIAL_BLOCKS = 'INITIAL_BLOCKS',
  SUBSCRIBE = 'SUBSCRIBE',
  UNSUBSCRIBE = 'UNSUBSCRIBE',
  ERROR = 'ERROR'
}

export interface SubscriptionOptions {
  includeTransactions?: boolean;
  filterFields?: string[];
}

export interface Subscription {
  topic: string;
  options?: SubscriptionOptions;
}

export interface WebSocketMessage<T = any> {
  type: MessageType;
  data?: T;
  timestamp: number;
}

export interface ErrorMessage extends WebSocketMessage {
  type: MessageType.ERROR;
  error: string;
} 