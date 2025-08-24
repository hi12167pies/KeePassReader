export function valueToKey(object: any, value: any) {
  for (const key of Object.keys(object)) {
    if (object[key] === value) return key 
  }
  return null
}

/**
 * Convert a Buffer into a bigint
 * @param buf The buffer to convert
 * @param littleEndian Whether to interpret as little-endian (default: false = big-endian)
 */
// This method is ChatGPT
export function bufferToBigInt(buf: Buffer, littleEndian = false): bigint {
  let result = 0n;

  if (littleEndian) {
    // little endian: least significant byte first
    for (let i = buf.length - 1; i >= 0; i--) {
      result = (result << 8n) + BigInt(buf[i]);
    }
  } else {
    // big endian: most significant byte first
    for (let i = 0; i < buf.length; i++) {
      result = (result << 8n) + BigInt(buf[i]);
    }
  }

  return result;
}