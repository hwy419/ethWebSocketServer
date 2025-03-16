export interface TransactionCounts {
  legacy: number;
  eip1559: number;
  blob: number;
}

export interface GasSums {
  legacy: string;
  eip1559: string;
  blob: string;
  total: string;
}

export interface BlockMetricsData {
  averageTxValue: string;
  highestTxValue: string;
  lowestTxValue: string;
  transactionCounts: TransactionCounts;
  gasSums: GasSums;
  highestGasPrice: string;
  lowestGasPrice: string;
  averageGasPrice: string;
} 