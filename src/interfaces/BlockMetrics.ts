export interface TransactionCounts {
  legacy: number;
  eip1559: number;
  blob: number;
}

export interface BlockMetricsData {
  averageTxValue: string;
  transactionCounts: TransactionCounts;
  highestGasPrice: string;
  lowestGasPrice: string;
  averageGasPrice: string;
} 