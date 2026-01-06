import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { JsonPanel } from '../components/JsonPanel'
import { useApi } from '../api/useApi'

export function ChatPage() {
  const api = useApi()

  const [message, setMessage] = useState('')
  const [platform, setPlatform] = useState('web')

  const decision = useMutation({
    mutationFn: () =>
      api.decisionHub({
        input_text: message,
        platform,
        device_context: 'desktop',
        voice_input: false,
      }),
  })

  return (
    <div className="grid">
      <Card title="Chat (Decision Hub)">
        <div className="stack">
          <Field label="Message">
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
            />
          </Field>

          <Field label="Platform">
            <select
              className="select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="web">web</option>
              <option value="whatsapp">whatsapp</option>
              <option value="email">email</option>
            </select>
          </Field>

          {decision.isError && (
            <Alert variant="danger" title="Request failed">
              {decision.error.message}
            </Alert>
          )}

          <Button
            onClick={() => decision.mutate()}
            loading={decision.isPending}
            disabled={!message.trim()}
          >
            Send
          </Button>
        </div>
      </Card>

      <Card title="Decision Output">
        {decision.isPending && <p className="muted">Processing…</p>}
        {decision.data ? (
          <div className="stack">
            <p>{decision.data.message}</p>
            <details>
              <summary>Debug JSON</summary>
              <JsonPanel value={decision.data} />
            </details>
          </div>
        ) : (
          <p className="muted">No response yet.</p>
        )}
      </Card>
    </div>
  )
}
