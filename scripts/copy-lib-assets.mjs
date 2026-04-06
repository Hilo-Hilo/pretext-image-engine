import { copyFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const repoRoot = resolve(currentDir, '..')
const source = resolve(repoRoot, 'src/lib/styles.css')
const destination = resolve(repoRoot, 'lib/styles.css')

mkdirSync(dirname(destination), { recursive: true })
copyFileSync(source, destination)
