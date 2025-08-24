import { VariantDictTypes, VariantDictValue } from "./types"

export class Reader {
  private index: number = 0

  public constructor(
    public buffer: Buffer
  ) {}

  public readByte(): number {
    const value = this.buffer.readUint8(this.index)
    this.index += 1
    return value
  }

  public readUInt16(): number {
    const value = this.buffer.readUint16LE(this.index)
    this.index += 2
    return value
  }

  public readUInt32(): number {
    const value = this.buffer.readUint32LE(this.index)
    this.index += 4
    return value
  }

  public readUInt64(): bigint {
    const value = this.buffer.readBigUint64BE(this.index)
    this.index += 8
    return value
  }

  public readInt32(): number {
    const value = this.buffer.readInt32LE(this.index)
    this.index += 4
    return value
  }

  public readInt64(): bigint {
    const value = this.buffer.readBigInt64BE(this.index)
    this.index += 8
    return value
  }

  public readBoolean(): boolean {
    return this.readByte() == 1
  }

  public readUUID(): bigint {
    const high = this.buffer.readBigUInt64BE(this.index)
    this.index += 8

    const low = this.buffer.readBigUInt64BE(this.index)
    this.index += 8

    return (high << 64n) + low
  }

  public readBytes(amount: number): Buffer {
    const buffer = this.buffer.subarray(this.index, this.index + amount)
    this.index += amount
    return buffer
  }
  
  public readString(length: number) {
    return this.readBytes(length).toString("utf-8")
  }

  public skipBytes(amount: number) {
    this.index += amount
  }

  public readVariantDict(): Map<string, VariantDictValue> {
    const map = new Map()

    // TODO: Actually verify the version
    const version = this.readUInt16()

    let type

    while ((type = this.readByte()) != 0) {
      const nameSize = this.readUInt32()
      const name = this.readString(nameSize)

      const valueSize = this.readUInt32()
      let value: VariantDictValue | undefined

      switch (type) {
        case VariantDictTypes.UInt32:
          value = this.readUInt32()
          break
        case VariantDictTypes.UInt64:
          value = this.readUInt64()
          break
        case VariantDictTypes.Boolean:
          value = this.readBoolean()
          break
        case VariantDictTypes.Int32:
          value = this.readInt32()
          break
        case VariantDictTypes.Int64:
          value = this.readInt64()
          break
        case VariantDictTypes.String:
          value = this.readString(valueSize)
          break
        case VariantDictTypes.ByteArray:
          value = this.readBytes(valueSize)
          break
        default:
          throw new Error("Unsupported variant dict type " + type)
      }

      if (value == undefined) {
        throw new Error("Value of variant dict is undefined, unsupport type?")
      }

      map.set(name, value)
    }

    return map
  }
}