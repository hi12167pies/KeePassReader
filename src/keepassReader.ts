import { aesKDF, sha256Hash, sha512Hash } from "./crypto"
import { Reader } from "./reader"
import { EncryptionAlgorithm, HeaderId, Headers, KDF_PARAMETER_UUID, KDFMethod, KDFParameterAES } from "./types"
import { bufferToBigInt } from "./util"

const SIGNATURE_1 = 0x9AA2D903
const SIGNATURE_2 = 0xB54BFB67

export function readKeepass(file: Buffer, passphrase: Buffer) {
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
      headers.encryptionAlgorithm = headerReader.readUUID()
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
      if (headers.encryptionAlgorithm == EncryptionAlgorithm.AES256) {
        size = 16
      }
      if (headers.encryptionAlgorithm == EncryptionAlgorithm.ChaCha20) {
        size = 12
      }
      headers.encryptionIV = headerReader.readBytes(size)
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

  // TODO: Verify SHA256 here
  const headerSHA256 = reader.readBytes(32) // 32 bytes = 256 bits


  // Used later
  const hmacSHA256 = reader.readBytes(32)

  const passphraseHash = sha256Hash(passphrase)

  // This key is ussually the passphrase and other login methods joined. This only supported passphrase
  const compositeKey = sha256Hash(passphraseHash)
  
  let derivationKey: Buffer

  // Key derivation function
  if (headers.kdfParameters != undefined) {
    let kdfTypeBufer = headers.kdfParameters.get(KDF_PARAMETER_UUID) as Buffer
    if (kdfTypeBufer == undefined) {
      throw new Error("KDF Parmeters present, but no uuid supplied")
    }

    const kdfType = bufferToBigInt(kdfTypeBufer, false)

    switch (kdfType) {
      case KDFMethod.AES_KDF:
        derivationKey = aesKDF(
          compositeKey,
          // TODO: Properly check and validate these values TM
          headers.kdfParameters.get(KDFParameterAES.Salt) as Buffer,
          headers.kdfParameters.get(KDFParameterAES.Rounds) as number
        )
        break
      default:
        throw new Error("Unsupported KDF " + kdfTypeBufer)
    }
  } else {
    // There will be no derivation otherwise
    derivationKey = compositeKey
  }

  const masterSeed = headers.masterSeed

  if (masterSeed == undefined) {
    throw new Error("Master seed/salt is undefined")
  }

  let finalMasterKey: Buffer

  // ???
  let finalHMACKey: Buffer = sha512Hash(Buffer.concat([
    Buffer.from([ 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF ]),
    sha512Hash(Buffer.concat([
      masterSeed,
      derivationKey,
      Buffer.from([ 0x01 ])
    ]))
  ]))

  switch (headers.encryptionAlgorithm) {
    case EncryptionAlgorithm.AES256:
    case EncryptionAlgorithm.ChaCha20:
      finalMasterKey = sha256Hash(Buffer.concat([ masterSeed, derivationKey ]))
      break
    default:
      throw new Error("Unsupported encryption algorithm")
  }

  return {
    version,
    headers,

    headerSHA256,
    hmacSHA256,
    passphraseHash,
    compositeKey,
    derivationKey,
    finalMasterKey,
    finalHMACKey
  }
}

