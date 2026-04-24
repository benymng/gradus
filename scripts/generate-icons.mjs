import { execSync } from 'child_process'
import { mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')
const svgSrc = join(publicDir, 'app-icon.svg')

mkdirSync(join(publicDir, 'icons'), { recursive: true })

const sizes = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512]

for (const size of sizes) {
  const out = join(publicDir, 'icons', `icon-${size}x${size}.png`)
  execSync(`rsvg-convert -w ${size} -h ${size} "${svgSrc}" -o "${out}"`)
  console.log(`✓ icon-${size}x${size}.png`)
}

// apple-touch-icon for iOS home screen (180×180 is the standard for modern iPhones)
execSync(`rsvg-convert -w 180 -h 180 "${svgSrc}" -o "${join(publicDir, 'apple-touch-icon.png')}"`)
console.log('✓ apple-touch-icon.png')
