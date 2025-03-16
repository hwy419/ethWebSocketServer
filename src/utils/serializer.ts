/**
 * Custom JSON serializer that handles BigInt values by converting them to strings
 */
export const serializeBigInt = (data: any): string => {
  return JSON.stringify(data, (_key, value) => {
    // Convert BigInt values to strings
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  });
};

/**
 * Parse JSON data
 */
export const parseJson = (data: string): any => {
  return JSON.parse(data);
}; 