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
  const [sessionId, setSessionId] = useState('default_session')

  const mutation = useMutation<any>({
    mutationFn: () => api.summarize({ text: message }),
  })

  return (
    <div className="grid">
      <Card title="Chat">
        <div className="stack">
          <Field label="Message">
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message…"
            />
          </Field>

          <Field label="Session ID">
            <input
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
            />
          </Field>

          {mutation.isError ? (
            <Alert variant="danger" title="Request failed">
              {mutation.error instanceof Error
                ? mutation.error.message
                : 'Request failed'}
            </Alert>
          ) : null}

          <div className="row">
            <Button onClick={() => mutation.mutate()} loading={mutation.isPending}>
              Send
            </Button>
            <Button variant="ghost" type="button" onClick={() => mutation.reset()}>
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Response">
        {mutation.isPending ? <p className="muted">Sending…</p> : null}
        {mutation.data ? (
          <JsonPanel value={mutation.data} />
        ) : (
          <p className="muted">No response yet.</p>
        )}
      </Card>
    </div>
  )
}
