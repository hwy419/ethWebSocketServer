export function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

export function truncateHash(hash: string, length: number = 6): string {
  if (!hash) return '';
  return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
}

export function formatEthValue(value: string | number, decimals: number = 18): string {
  if (!value) return '0 ETH';
  
  // Convert to string if it's a number
  const valueStr = typeof value === 'number' ? value.toString() : value;
  
  // Convert from wei to ETH
  const ethValue = parseInt(valueStr, 10) / Math.pow(10, decimals);
  
  // Format the ETH value with appropriate precision
  if (ethValue === 0) return '0 ETH';
  if (ethValue < 0.001) return '<0.001 ETH';
  if (ethValue < 1) return ethValue.toFixed(3) + ' ETH';
  return ethValue.toFixed(2) + ' ETH';
}

export function calculateGasUsagePercentage(gasUsed: number, gasLimit: number): number {
  if (!gasLimit || gasLimit === 0) return 0;
  return (gasUsed / gasLimit) * 100;
}

export function formatNumber(num: number): string {
  return num.toLocaleString();
} 