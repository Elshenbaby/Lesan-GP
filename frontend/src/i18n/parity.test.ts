import { resources } from '.'

// Arabic has more plural forms than English, so compare keys without the plural suffix.
const PLURAL = /_(zero|one|two|few|many|other)$/

function keys(obj: object, prefix = ''): Set<string> {
  const out = new Set<string>()
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object') keys(v, path).forEach((p) => out.add(p))
    else out.add(path.replace(PLURAL, ''))
  }
  return out
}

describe('translations', () => {
  it.each(Object.keys(resources.en))('ar and en have the same keys in %s', (ns) => {
    const en = keys(resources.en[ns as keyof typeof resources.en])
    const ar = keys(resources.ar[ns as keyof typeof resources.ar])
    expect([...en].filter((k) => !ar.has(k))).toEqual([])
    expect([...ar].filter((k) => !en.has(k))).toEqual([])
  })
})
