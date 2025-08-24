import { createCipheriv, createHash } from "node:crypto"

// This method is mostly (all) ChatGPT
export function aesKDF(key: Buffer, seed: Buffer, rounds: number) {
  if (key.length !== 32) {
    throw new Error("Key must be 32 bytes (AES-256).")
  }

  // Start with 16, empty bytes
  let data: Buffer = Buffer.alloc(16, 0)

  const aes = (input: Buffer): Buffer => {
    const cipher = createCipheriv("aes-256-ecb", key, null)
    cipher.setAutoPadding(false)
    return Buffer.concat([
      cipher.update(input),
      cipher.final()
    ])
  }

  for (let i = 0; i < rounds; i++) {
    data = aes(data) // AES-ECB(key, data)
  }

  // Mix with seed
  const result = Buffer.alloc(32)
  seed.copy(result, 0)
  data.copy(result, 16)

  return result
}

export function sha256Hash(data: string | Buffer) {
  return createHash("sha256")
    .update(data)
    .digest()
}

export function sha512Hash(data: string | Buffer) {
  return createHash("sha512")
    .update(data)
    .digest()
}