import { Reader } from "./reader"
import { EncryptionAlgorithm, HeaderId, Headers } from "./types"

const SIGNATURE_1 = 0x9AA2D903
const SIGNATURE_2 = 0xB54BFB67

export function readKeepass(file: Buffer, key: string) {
  const reader = new Reader(file)

  const signature1 = reader.readUInt32()
  if (signature1 !== SIGNATURE_1) {
    throw new Error("Signature 1 of file header does not match")
  }

  const signature2 = reader.readUInt32()
  if (signature2 !== SIGNATURE_2) {
    throw new Error("Signature 2 of file header does not match")
  }

  const version = reader.readUInt32()

  // read headers
  const headers: Headers = {}

  let id
  while ((id = reader.readByte()) != 0) {
    const size = reader.readUInt32()
    const data = reader.readBytes(size)

    const headerReader = new Reader(data)

    if (id == HeaderId.EncryptionAlgorithm) {
      headers.encryptionUUID = headerReader.readUUID()
      continue
    }

    if (id == HeaderId.CompressionAlgorithm) {
      headers.compression = headerReader.readUInt32()
      continue
    }

    if (id == HeaderId.MasterSeed) {
      headers.masterSeed = headerReader.readBytes(32)
      continue
    }

    if (id == HeaderId.EncryptionIV) {
      let size = 0
      if (headers.encryptionUUID == EncryptionAlgorithm.AES256) {
        size = 16
      }
      if (headers.encryptionUUID == EncryptionAlgorithm.ChaCha20) {
        size = 12
      }
      headers.encrpytionIV = headerReader.readBytes(size)
      continue
    }
    
    if (id == HeaderId.KDFParameters) {
      headers.kdfParameters = headerReader.readVariantDict()
      continue
    }

    if (id == HeaderId.CustomData) {
      headers.customData = headerReader.readVariantDict()
      continue
    }


    throw new Error("Unhandled header id" + id)
  }

  const headerSHA256 = reader.readBytes(256 / 8)
  const hmacSHA256 = reader.readBytes(256 / 8)

  

  return {
    version,
    headers,
    headerSHA256,
    hmacSHA256
  }
}