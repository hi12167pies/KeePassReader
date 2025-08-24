import { readFileSync } from "fs"
import { readKeepass } from "./keepassReader"
import { CompressionAlgorithm, EncryptionAlgorithm, KDF_PARAMETER_UUID, KDFMethod, KDFParameterAES, KDFParameterArgon2 } from "./types"
import { bufferToBigInt, valueToKey } from "./util"

const database = readKeepass(readFileSync("test.kdbx"), Buffer.from("test", "utf-8"))
const { headers } = database

// Example log
console.log("--- Raw Headers ---")
console.log(headers)
console.log("--- Decoded Information ---")
console.log("Encryption: ", valueToKey(EncryptionAlgorithm, headers.encryptionAlgorithm))
console.log("Compression: ", valueToKey(CompressionAlgorithm, headers.compression))

const kdfMethod = bufferToBigInt(headers.kdfParameters?.get(KDF_PARAMETER_UUID) as Buffer, false)
console.log("KDF Method: ", valueToKey(KDFMethod, kdfMethod))

if (kdfMethod == KDFMethod.AES_KDF) {
  console.log("KDF Salt", headers.kdfParameters?.get(KDFParameterAES.Salt))
  console.log("KDF Rounds", headers.kdfParameters?.get(KDFParameterAES.Rounds))
}

if (kdfMethod == KDFMethod.Argon2 || kdfMethod == KDFMethod.Argon2id) {
  console.log("KDF Version", headers.kdfParameters?.get(KDFParameterArgon2.Version))
  console.log("KDF Salt", headers.kdfParameters?.get(KDFParameterArgon2.Salt))
  console.log("KDF Iterations", headers.kdfParameters?.get(KDFParameterArgon2.Iterations))
  console.log("KDF Memory", headers.kdfParameters?.get(KDFParameterArgon2.Memory))
  console.log("KDF Parallelism", headers.kdfParameters?.get(KDFParameterArgon2.Parallelism))
}