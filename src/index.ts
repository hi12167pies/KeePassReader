import { readFileSync } from "fs"
import { readKeypass } from "./keypassReader"
import { CompressionAlgorithm, EncryptionAlgorithm } from "./types"
import { valueToKey } from "./util"

const database = readKeypass(readFileSync("test.kdbx"), "test")
const { headers } = database

console.log("--- Raw Headers ---")
console.log(headers)
console.log("--- Decoded Headers ---")
console.log("Encryption :", valueToKey(EncryptionAlgorithm, headers.encryptionUUID))
console.log("Compression: ", valueToKey(CompressionAlgorithm, headers.compression))
