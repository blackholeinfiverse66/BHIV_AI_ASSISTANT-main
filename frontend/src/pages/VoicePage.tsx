import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { JsonPanel } from '../components/JsonPanel'
import { apiPost } from '../lib/api.js'

function base64ToBlob(b64: string, mime: string) {
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))
  return new Blob([bytes], { type: mime })
}

export function VoicePage() {
  const [file, setFile] = useState<File | null>(null)
  const [ttsText, setTtsText] = useState('Hello from BHIV text-to-speech')
  const [voice, setVoice] = useState<'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'>('alloy')

  const stt = useMutation<any>({
    mutationFn: () => {
      if (!file) throw new Error('Pick an audio file')
      const fd = new FormData()
      fd.append('file', file)
      return apiPost('/voice_stt', fd)
    },
  })

  const tts = useMutation<any>({
    mutationFn: () => apiPost('/voice_tts', { text: ttsText, voice, save_cache: true }),
  })

  const audioUrl = useMemo(() => {
    if (!tts.data?.audio_base64) return null
    const blob = base64ToBlob(tts.data.audio_base64, 'audio/mpeg')
    return URL.createObjectURL(blob)
  }, [tts.data])

  return (
    <div className="grid">
      <Card title="Speech-to-text (/api/voice_stt)">
        <div className="stack">
          <input
            type="file"
            accept="audio/wav,audio/mpeg,audio/mp4,audio/x-m4a"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <Button variant="secondary" onClick={() => stt.mutate()} loading={stt.isPending} disabled={!file}>
            Transcribe
          </Button>
          {stt.isError ? <Alert variant="danger">{stt.error.message}</Alert> : null}
          {stt.data ? <JsonPanel value={stt.data} /> : <p className="muted">Upload a file to transcribe (mock STT).</p>}
        </div>
      </Card>

      <Card title="Text-to-speech (/api/voice_tts)" actions={audioUrl ? <a className="pill" href={audioUrl} download="tts.mp3">Download mp3</a> : null}>
        <div className="stack">
          <Field label="Text">
            <Textarea rows={4} value={ttsText} onChange={(e) => setTtsText(e.target.value)} />
          </Field>
          <Field label="Voice">
            <select className="select" value={voice} onChange={(e) => setVoice(e.target.value as any)}>
              <option value="alloy">alloy</option>
              <option value="echo">echo</option>
              <option value="fable">fable</option>
              <option value="onyx">onyx</option>
              <option value="nova">nova</option>
              <option value="shimmer">shimmer</option>
            </select>
          </Field>
          <Button onClick={() => tts.mutate()} loading={tts.isPending}>
            Generate
          </Button>
          {tts.isError ? <Alert variant="danger">{tts.error.message}</Alert> : null}
          {tts.data ? <JsonPanel value={{ ...(tts.data as any), audio_base64: `[base64 ${(tts.data as any).audio_base64.length} chars]` }} /> : null}
          {audioUrl ? <audio controls src={audioUrl} /> : <p className="muted">Generate audio to play it here.</p>}
        </div>
      </Card>
    </div>
  )
}

