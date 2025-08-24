
export enum HeaderId {
  EndOfHeaders = 0,
  EncryptionAlgorithm = 2,
  CompressionAlgorithm = 3,
  MasterSeed = 4,
  EncryptionIV = 7,
  KDFParameters = 11,
  CustomData = 12
}

export type Headers = {
  encryptionUUID?: bigint
  compression?: number,
  masterSeed?: Buffer,
  encrpytionIV?: Buffer,
  kdfParameters?: Map<string, VariantDictValue>,
  customData?: Map<string, VariantDictValue>,
}

export const EncryptionAlgorithm = {
  AES256: 0x31C1F2E6BF714350BE5805216AFC5AFFn,
  ChaCha20: 0xD6038A2B8B6F4CB5A524339A31DBB59An
}

export enum CompressionAlgorithm {
  None = 0,
  GZIP = 1
}

export type VariantDictValue = number | bigint | boolean | string | Buffer 

export enum VariantDictTypes {
  UInt32 = 0x04,
  UInt64 = 0x05,
  Boolean = 0x08,
  Int32 = 0x0C,
  Int64 = 0x0D,
  String = 0x18,
  ByteArray = 0x42
}
