/**
 * Recursively converts BigInt values to strings in any data structure.
 * This is necessary because JSON.stringify cannot handle BigInt values.
 *
 * @param value The value to convert
 * @returns The converted value with all BigInt values as strings
 */
export const convertToString = (value: unknown): unknown => {
  // If the value is a bigint, convert it to a string
  if (typeof value === 'bigint') {
    return value.toString();
  }

  // If the value is an array, recursively convert each element to a string
  if (Array.isArray(value)) {
    return value.map(convertToString);
  }

  // If the value is an object, recursively convert each property to a string
  if (value !== null && typeof value === 'object') {
    const converted: Record<string, unknown> = {};
    for (const [key, nestedVal] of Object.entries(value)) {
      converted[key] = convertToString(nestedVal);
    }
    return converted;
  }

  return value;
};

/**
 * Stringifies a message of type unknown[].
 * This ensures that complex data structures with BigInt or BigInt[] values can be
 * properly serialized to avoid precision loss and JSON.stringify errors.
 *
 * @param message The message to stringify
 * @returns The stringified message
 */
export const stringifyMessage = (message: unknown): string => {
  return JSON.stringify(message, (_key, value) => convertToString(value));
};
