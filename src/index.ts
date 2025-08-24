import { readFileSync } from "fs"
import { readKeepass } from "./keepassReader"
import { CompressionAlgorithm, EncryptionAlgorithm } from "./types"
import { valueToKey } from "./util"

const database = readKeepass(readFileSync("test.kdbx"), "test")
const { headers } = database

console.log("--- Raw Headers ---")
console.log(headers)
console.log("--- Decoded Headers ---")
console.log("Encryption :", valueToKey(EncryptionAlgorithm, headers.encryptionUUID))
console.log("Compression: ", valueToKey(CompressionAlgorithm, headers.compression))
