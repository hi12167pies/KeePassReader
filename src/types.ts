
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
  encryptionAlgorithm?: bigint
  compression?: number,
  masterSeed?: Buffer,
  encryptionIV?: Buffer,
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

export const KDF_PARAMETER_UUID = "$UUID"

export const KDFMethod = {
  AES_KDF: 0xC9D9F39A628A4460BF740D08C18A4FEAn,
  Argon2: 0xEF636DDF8C29444B91F7A9A403E30A0Cn,
  Argon2id: 0x9E298B1956DB4773B23DFC3EC6F0A1E6n,
}

export enum KDFParameterAES {
  Salt = "S",
  Rounds = "R"
}

export enum KDFParameterArgon2 {
  Version = "V",
  Salt = "S",
  Iterations = "I",
  Memory = "M",
  Parallelism = "P"
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