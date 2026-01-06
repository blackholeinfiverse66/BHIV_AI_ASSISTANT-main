import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Textarea } from '../components/Textarea'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { JsonPanel } from '../components/JsonPanel'
import { useApi } from '../api/useApi'

function linesToArray(v: string) {
  return v
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
}

export function EmbeddingsPage() {
  const api = useApi()

  const [userId, setUserId] = useState('default_user')
  const [sessionId, setSessionId] = useState('default_session')
  const [platform, setPlatform] = useState('web')
  const [texts, setTexts] = useState('Hello world\nSecond message')
  const [texts1, setTexts1] = useState('Hello world')
  const [texts2, setTexts2] = useState('Hello there')

  const embed = useMutation<any>({
    mutationFn: () =>
      api.embed({
        texts: linesToArray(texts),
        user_id: userId,
        session_id: sessionId,
        platform,
      }),
  })

  const similarity = useMutation<any>({
    mutationFn: () =>
      api.similarity({
        texts1: linesToArray(texts1),
        texts2: linesToArray(texts2),
        user_id: userId,
        session_id: sessionId,
        platform,
      }),
  })

  const dims = useMemo(() => {
    const e = (embed.data as any)?.embeddings?.[0]
    return e ? e.length : null
  }, [embed.data])

  return (
    <div className="grid">
      <Card title="Options">
        <div className="grid2">
          <Field label="user_id">
            <Input value={userId} onChange={(e) => setUserId(e.target.value)} />
          </Field>
          <Field label="session_id">
            <Input value={sessionId} onChange={(e) => setSessionId(e.target.value)} />
          </Field>
          <Field label="platform">
            <Input value={platform} onChange={(e) => setPlatform(e.target.value)} />
          </Field>
        </div>
      </Card>

      <Card
        title="Generate embeddings (/api/embed)"
        actions={
          <Button variant="secondary" onClick={() => embed.mutate()} loading={embed.isPending}>
            Run
          </Button>
        }
      >
        <Field label="Texts (one per line)">
          <Textarea rows={6} value={texts} onChange={(e) => setTexts(e.target.value)} />
        </Field>

        {embed.isError ? (
          <Alert variant="danger">
            {embed.error instanceof Error ? embed.error.message : 'Embed failed'}
          </Alert>
        ) : null}

        {embed.data ? (
          <div className="stack">
            <p>{embed.data.message}</p>
            <details>
              <summary>Debug JSON</summary>
              <JsonPanel
                value={{
                  ...(embed.data as any),
                  _meta: { count: (embed.data as any).data.embeddings.length, dims },
                }}
              />
            </details>
          </div>
        ) : (
          <p className="muted">No embeddings yet.</p>
        )}
      </Card>

      <Card
        title="Compute similarity (/api/embed/similarity)"
        actions={
          <Button variant="secondary" onClick={() => similarity.mutate()} loading={similarity.isPending}>
            Run
          </Button>
        }
      >
        <div className="grid2">
          <Field label="texts1 (one per line)">
            <Textarea rows={4} value={texts1} onChange={(e) => setTexts1(e.target.value)} />
          </Field>
          <Field label="texts2 (one per line)">
            <Textarea rows={4} value={texts2} onChange={(e) => setTexts2(e.target.value)} />
          </Field>
        </div>

        {similarity.isError ? (
          <Alert variant="danger">
            {similarity.error instanceof Error ? similarity.error.message : 'Similarity failed'}
          </Alert>
        ) : null}

        {similarity.data ? (
          <div className="stack">
            <p>{similarity.data.message}</p>
            <details><summary>Debug JSON</summary><JsonPanel value={similarity.data} /></details>
          </div>
        ) : <p className="muted">No result yet.</p>}
      </Card>
    </div>
  )
}
