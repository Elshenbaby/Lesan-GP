import { useCallback, useEffect, useRef, useState } from 'react'

export type RecorderStatus = 'idle' | 'requesting' | 'recording' | 'stopped' | 'denied' | 'unsupported'

interface Options {
  /** Auto-stop after this many ms (screening words are short). */
  maxDurationMs?: number
}

/**
 * Browser microphone recorder (MediaRecorder + Web Audio level meter).
 * Returns a Blob the API layer uploads as multipart form data.
 */
export function useRecorder({ maxDurationMs = 3500 }: Options = {}) {
  const [status, setStatus] = useState<RecorderStatus>(() =>
    typeof window !== 'undefined' && 'MediaRecorder' in window ? 'idle' : 'unsupported',
  )
  const [level, setLevel] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)

  const streamRef = useRef<MediaStream | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const rafRef = useRef<number>(0)
  const timeoutRef = useRef<number>(0)
  const resolveRef = useRef<((b: Blob | null) => void) | null>(null)

  const cleanup = useCallback(() => {
    cancelAnimationFrame(rafRef.current)
    clearTimeout(timeoutRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setLevel(0)
  }, [])

  useEffect(() => cleanup, [cleanup])

  const stop = useCallback(() => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
  }, [])

  /** Starts recording and resolves with the blob when stopped (manually or by timeout). */
  const record = useCallback(async (): Promise<Blob | null> => {
    if (status === 'unsupported') return null
    setStatus('requesting')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
      })
      streamRef.current = stream

      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const buf = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteTimeDomainData(buf)
        let sum = 0
        for (const v of buf) sum += ((v - 128) / 128) ** 2
        setLevel(Math.min(1, Math.sqrt(sum / buf.length) * 4))
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()

      const chunks: BlobPart[] = []
      const recorder = new MediaRecorder(stream)
      recorderRef.current = recorder
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data)

      return await new Promise<Blob | null>((resolve) => {
        resolveRef.current = resolve
        recorder.onstop = () => {
          const out = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' })
          setBlob(out)
          setStatus('stopped')
          cleanup()
          ctx.close()
          resolve(out)
        }
        recorder.start()
        setStatus('recording')
        timeoutRef.current = window.setTimeout(
          () => recorder.state === 'recording' && recorder.stop(),
          maxDurationMs,
        )
      })
    } catch {
      cleanup()
      setStatus('denied')
      return null
    }
  }, [cleanup, maxDurationMs, status])

  const reset = useCallback(() => {
    setBlob(null)
    setStatus((s) => (s === 'unsupported' || s === 'denied' ? s : 'idle'))
  }, [])

  return { status, level, blob, record, stop, reset, isRecording: status === 'recording' }
}
