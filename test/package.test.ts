import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

const packageJson = JSON.parse(
  readFileSync(resolve(process.cwd(), 'package.json'), 'utf8'),
) as {
  exports: Record<string, unknown>
  sideEffects: string[]
  style?: string
}

describe('package metadata', () => {
  it('exports the engine stylesheet for bundlers', () => {
    expect(packageJson.exports['./styles.css']).toBe('./lib/styles.css')
    expect(packageJson.style).toBe('./lib/styles.css')
    expect(packageJson.sideEffects).toContain('./lib/styles.css')
  })

  it('ships a source stylesheet that can be copied into the library build', () => {
    expect(existsSync(resolve(process.cwd(), 'src/lib/styles.css'))).toBe(true)
  })
})
