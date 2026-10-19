/**
 * Generates a short WAV that sounds like a breathy "sss" so the waveform and play
 * buttons have something real to render in mock mode.
 */
export function synthesizeSibilantWav(seed: string, seconds = 1.2, sampleRate = 16_000): ArrayBuffer {
  let s = [...seed].reduce((a, c) => a * 31 + c.charCodeAt(0), 7) >>> 0
  const rand = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 0xffffffff) * 2 - 1

  const n = Math.floor(seconds * sampleRate)
  const samples = new Int16Array(n)
  let prev = 0
  const vowelAt = 0.45 + (s % 20) / 100
  for (let i = 0; i < n; i++) {
    const t = i / n
    const env = Math.sin(Math.PI * Math.min(1, t * 1.15)) ** 0.6
    const noise = rand()
    const hp = noise - prev * 0.85 // crude high-pass -> hiss
    prev = noise
    const vowel = t > vowelAt ? Math.sin((2 * Math.PI * 180 * i) / sampleRate) * 0.5 : 0
    samples[i] = Math.max(-1, Math.min(1, (t < vowelAt ? hp * 0.6 : vowel * 0.8 + hp * 0.1) * env)) * 0x5fff
  }

  const buffer = new ArrayBuffer(44 + samples.byteLength)
  const v = new DataView(buffer)
  const str = (o: number, x: string) => [...x].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)))
  str(0, 'RIFF')
  v.setUint32(4, 36 + samples.byteLength, true)
  str(8, 'WAVE')
  str(12, 'fmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, sampleRate, true)
  v.setUint32(28, sampleRate * 2, true)
  v.setUint16(32, 2, true)
  v.setUint16(34, 16, true)
  str(36, 'data')
  v.setUint32(40, samples.byteLength, true)
  new Int16Array(buffer, 44).set(samples)
  return buffer
}
