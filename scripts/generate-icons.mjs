import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  CRC_TABLE[n] = c
}

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type)
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const crcBuf = Buffer.concat([typeBytes, data])
  const crcBytes = Buffer.alloc(4)
  crcBytes.writeUInt32BE(crc32(crcBuf))
  return Buffer.concat([len, typeBytes, data, crcBytes])
}

function createSolidPNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // RGB

  const raw = Buffer.alloc(size * (1 + size * 3))
  for (let y = 0; y < size; y++) {
    const o = y * (1 + size * 3)
    raw[o] = 0
    for (let x = 0; x < size; x++) {
      raw[o + 1 + x * 3] = r
      raw[o + 1 + x * 3 + 1] = g
      raw[o + 1 + x * 3 + 2] = b
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 1 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

const publicDir = join(__dirname, '..', 'public')
mkdirSync(publicDir, { recursive: true })

// Violet: #7c3aed → rgb(124, 58, 237)
const [r, g, b] = [124, 58, 237]
writeFileSync(join(publicDir, 'icon-192.png'), createSolidPNG(192, r, g, b))
writeFileSync(join(publicDir, 'icon-512.png'), createSolidPNG(512, r, g, b))
writeFileSync(join(publicDir, 'apple-touch-icon.png'), createSolidPNG(180, r, g, b))
console.log('✓ Icons generated in public/')
