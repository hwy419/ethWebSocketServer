export interface WithdrawalData {
  index: string;
  validatorIndex: string;
  address: string;
  amount: string;
}

export interface TransactionData {
  hash: string;
  nonce: string;
  blockHash: string;
  blockNumber: string;
  transactionIndex: string;
  from: string;
  to: string | null;
  value: string;
  input: string;
  gas: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  type: string;
  chainId: string;
  accessList?: any[];
  v: string;
  r: string;
  s: string;
  blobVersionedHashes?: string[];
  maxFeePerBlobGas?: string;
}

export interface BlockData {
  number: string;
  hash: string;
  parentHash: string;
  timestamp: string;
  miner: string;
  difficulty: string;
  totalDifficulty: string;
  size: string;
  gasLimit: string;
  gasUsed: string;
  baseFeePerGas: string;
  blobGasUsed?: string;
  excessBlobGas?: string;
  transactionsRoot: string;
  receiptsRoot: string;
  stateRoot: string;
  withdrawals?: WithdrawalData[];
  withdrawalsRoot?: string;
  transactions: TransactionData[];
  metrics?: {
    averageTxValue: string;
    transactionCounts: {
      legacy: number;
      eip1559: number;
      blob: number;
    };
    highestGasPrice: string;
    lowestGasPrice: string;
    averageGasPrice: string;
  };
} 