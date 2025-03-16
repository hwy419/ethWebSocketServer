import { TransactionData } from '../interfaces/Block';
import { BlockMetricsData, TransactionCounts, GasSums } from '../interfaces/BlockMetrics';

export class BlockMetrics {
  /**
   * Calculate metrics for a block
   * @param transactions List of transactions in the block
   * @returns BlockMetricsData object with calculated metrics
   */
  static calculateMetrics(transactions: TransactionData[]): BlockMetricsData {
    if (transactions.length === 0) {
      return {
        averageTxValue: '0',
        highestTxValue: '0',
        lowestTxValue: '0',
        transactionCounts: {
          legacy: 0,
          eip1559: 0,
          blob: 0
        },
        gasSums: {
          legacy: '0',
          eip1559: '0',
          blob: '0',
          total: '0'
        },
        highestGasPrice: '0',
        lowestGasPrice: '0',
        averageGasPrice: '0'
      };
    }

    let totalValue = BigInt(0);
    let totalGasPrice = BigInt(0);
    
    // Initialize transaction counts
    const transactionCounts: TransactionCounts = {
      legacy: 0,
      eip1559: 0,
      blob: 0
    };
    
    // Initialize gas sums
    let gasSumLegacy = BigInt(0);
    let gasSumEIP1559 = BigInt(0);
    let gasSumBlob = BigInt(0);
    
    // Initialize gas price metrics
    let highestGasPrice = BigInt(0);
    let lowestGasPrice = BigInt(Number.MAX_SAFE_INTEGER);
    
    // Initialize transaction value metrics
    let highestTxValue = BigInt(0);
    let lowestTxValue = BigInt(Number.MAX_SAFE_INTEGER);
    
    // First pass: find non-zero values to calculate lowest
    let nonZeroValues: bigint[] = [];
    transactions.forEach(tx => {
      const txValue = BigInt(tx.value || '0');
      if (txValue > 0) {
        nonZeroValues.push(txValue);
      }
    });
    
    // Sort non-zero values to find the lowest
    if (nonZeroValues.length > 0) {
      nonZeroValues.sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
      lowestTxValue = nonZeroValues[0];
    }
    
    transactions.forEach(tx => {
      // Calculate value metrics
      const txValue = BigInt(tx.value || '0');
      totalValue += txValue;
      
      // Update highest transaction value
      if (txValue > highestTxValue) {
        highestTxValue = txValue;
      }
      
      // Calculate gas used (from gas field)
      const gasAmount = BigInt(tx.gas || '0');
      
      // Count transaction types and sum gas
      if (tx.type === '2') {
        transactionCounts.eip1559++;
        gasSumEIP1559 += gasAmount;
      } else if (tx.type === '3') {
        transactionCounts.blob++;
        gasSumBlob += gasAmount;
      } else {
        transactionCounts.legacy++;
        gasSumLegacy += gasAmount;
      }
      
      // Calculate gas price metrics
      const gasPrice = this.getEffectiveGasPrice(tx);
      
      if (gasPrice > highestGasPrice) {
        highestGasPrice = gasPrice;
      }
      
      if (gasPrice < lowestGasPrice && gasPrice > 0) {
        lowestGasPrice = gasPrice;
      }
      
      totalGasPrice += gasPrice;
    });

    // If lowestGasPrice is still the initial value, set it to 0
    if (lowestGasPrice === BigInt(Number.MAX_SAFE_INTEGER)) {
      lowestGasPrice = BigInt(0);
    }
    
    // If lowestTxValue is still the initial value, set it to 0
    if (lowestTxValue === BigInt(Number.MAX_SAFE_INTEGER)) {
      lowestTxValue = BigInt(0);
    }
    
    // Calculate total gas sum
    const totalGasSum = gasSumLegacy + gasSumEIP1559 + gasSumBlob;
    
    // Calculate averages
    const averageValue = transactions.length > 0 
      ? totalValue / BigInt(transactions.length) 
      : BigInt(0);
    
    const averageGasPrice = transactions.length > 0 
      ? totalGasPrice / BigInt(transactions.length) 
      : BigInt(0);
    
    return {
      averageTxValue: averageValue.toString(),
      highestTxValue: highestTxValue.toString(),
      lowestTxValue: lowestTxValue.toString(),
      transactionCounts,
      gasSums: {
        legacy: gasSumLegacy.toString(),
        eip1559: gasSumEIP1559.toString(),
        blob: gasSumBlob.toString(),
        total: totalGasSum.toString()
      },
      highestGasPrice: highestGasPrice.toString(),
      lowestGasPrice: lowestGasPrice.toString(),
      averageGasPrice: averageGasPrice.toString()
    };
  }
  
  /**
   * Get the effective gas price from a transaction
   * @param tx Transaction data
   * @returns Effective gas price as BigInt
   */
  private static getEffectiveGasPrice(tx: TransactionData): bigint {
    // For legacy transactions
    if (tx.gasPrice) {
      return BigInt(tx.gasPrice);
    }
    
    // For EIP-1559 transactions
    if (tx.maxFeePerGas) {
      // In practice, we might want a more sophisticated calculation
      // For simplicity, we use maxFeePerGas
      return BigInt(tx.maxFeePerGas);
    }
    
    return BigInt(0);
  }
} 