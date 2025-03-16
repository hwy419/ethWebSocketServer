import { BlockManager } from '../src/managers/BlockManager';
import { BlockData, TransactionData } from '../src/interfaces/Block';
import { BlockMetrics } from '../src/utils/BlockMetrics';

// Example transaction data
const createExampleTransactions = (): TransactionData[] => {
  return [
    {
      hash: '0x123',
      nonce: '1',
      blockHash: '0xabc',
      blockNumber: '100',
      transactionIndex: '0',
      from: '0xsender1',
      to: '0xrecipient1',
      value: '1000000000000000000', // 1 ETH
      input: '0x',
      gas: '21000',
      gasPrice: '20000000000', // 20 Gwei
      type: '0', // Legacy
      chainId: '1',
      v: '0x1b',
      r: '0x...',
      s: '0x...'
    },
    {
      hash: '0x456',
      nonce: '5',
      blockHash: '0xabc',
      blockNumber: '100',
      transactionIndex: '1',
      from: '0xsender2',
      to: '0xrecipient2',
      value: '500000000000000000', // 0.5 ETH
      input: '0x',
      gas: '21000',
      gasPrice: '', // No gas price for EIP-1559
      maxFeePerGas: '30000000000', // 30 Gwei
      maxPriorityFeePerGas: '2000000000', // 2 Gwei
      type: '2', // EIP-1559
      chainId: '1',
      v: '0x0',
      r: '0x...',
      s: '0x...'
    },
    {
      hash: '0x789',
      nonce: '10',
      blockHash: '0xabc',
      blockNumber: '100',
      transactionIndex: '2',
      from: '0xsender3',
      to: '0xrecipient3',
      value: '200000000000000000', // 0.2 ETH
      input: '0x',
      gas: '21000',
      gasPrice: '', // No gas price for blob tx
      maxFeePerGas: '25000000000', // 25 Gwei
      maxPriorityFeePerGas: '1500000000', // 1.5 Gwei
      maxFeePerBlobGas: '10000000', // 0.01 Gwei
      blobVersionedHashes: ['0xblob1', '0xblob2'],
      type: '3', // Blob transaction (EIP-4844)
      chainId: '1',
      v: '0x0',
      r: '0x...',
      s: '0x...'
    }
  ];
};

// Create an example block
const createExampleBlock = (): BlockData => {
  return {
    number: '100',
    hash: '0xabc',
    parentHash: '0xdef',
    timestamp: '1689342000',
    miner: '0xminer',
    difficulty: '1',
    totalDifficulty: '1000',
    size: '1000',
    gasLimit: '30000000',
    gasUsed: '63000',
    baseFeePerGas: '15000000000', // 15 Gwei
    transactionsRoot: '0xtxroot',
    receiptsRoot: '0xreceiptsroot',
    stateRoot: '0xstateroot',
    transactions: createExampleTransactions()
  };
};

// Main example function
const runExample = () => {
  console.log('Block Metrics Example');
  console.log('--------------------');

  // Create an example block
  const block = createExampleBlock();

  // Calculate metrics directly
  const metrics = BlockMetrics.calculateMetrics(block.transactions);
  console.log('Direct calculation of metrics:');
  console.log(JSON.stringify(metrics, null, 2));

  // Use BlockManager to calculate metrics
  const blockManager = new BlockManager();
  blockManager.addBlock(block);
  
  // Get the block with metrics
  const storedBlock = blockManager.getBlockByNumber('100');
  console.log('\nMetrics from BlockManager:');
  console.log(JSON.stringify(storedBlock?.metrics, null, 2));

  // Metrics explanation
  console.log('\nMetrics explanation:');
  console.log(`- Average Transaction Value: ${Number(metrics.averageTxValue) / 1e18} ETH`);
  console.log(`- Transaction Types: ${metrics.transactionCounts.legacy} Legacy, ${metrics.transactionCounts.eip1559} EIP-1559, ${metrics.transactionCounts.blob} Blob`);
  console.log(`- Highest Gas Price: ${Number(metrics.highestGasPrice) / 1e9} Gwei`);
  console.log(`- Lowest Gas Price: ${Number(metrics.lowestGasPrice) / 1e9} Gwei`);
  console.log(`- Average Gas Price: ${Number(metrics.averageGasPrice) / 1e9} Gwei`);
};

// Run the example
runExample(); 