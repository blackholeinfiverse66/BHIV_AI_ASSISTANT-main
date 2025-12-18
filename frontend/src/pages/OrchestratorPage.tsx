import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { apiPost } from '../lib/api.js'

export function OrchestratorPage() {
  const [message, setMessage] = useState('')
  const [platform, setPlatform] = useState('whatsapp')
  const [result, setResult] = useState<any>(null)

  const orchestrate = useMutation({
    mutationFn: async () => {
      // STEP 1 — Summarize
      const summarizeRes = await apiPost('/api/summarize', {
        user_id: 'demo',
        platform,
        message_id: `m-${Date.now()}`,
        message_text: message,
        timestamp: new Date().toISOString(),
      })

      // STEP 2 — Decision Hub
      const decisionRes = await apiPost('/api/decision_hub', summarizeRes)

      // STEP 3 — Orchestrate
      const orchestrateRes = await apiPost('/orchestrate', {
        task_id: summarizeRes.task_id,
      })

      return {
        summary: summarizeRes.summary,
        intent: decisionRes.intent,
        urgency: decisionRes.urgency,
        routedTo: orchestrateRes.routed_to,
        finalStatus: orchestrateRes.status,
        fallbackUsed: orchestrateRes.fallback_used,
        traceId: orchestrateRes.trace_id,
      }
    },
    onSuccess: (data) => {
      setResult(data)
    },
  })

  return (
    <div className="grid">
      <Card title="Orchestrator Input">
        <div className="stack">
          <Field label="Message">
            <Textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your message..."
            />
          </Field>
          <Field label="Platform">
            <select
              className="select"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="instagram">Instagram</option>
            </select>
          </Field>
          {orchestrate.isError && (
            <Alert variant="danger">
              {orchestrate.error.message || 'Orchestration failed'}
            </Alert>
          )}
          <Button
            onClick={() => orchestrate.mutate()}
            loading={orchestrate.isPending}
            disabled={!message.trim()}
          >
            Submit
          </Button>
        </div>
      </Card>

      <Card title="Orchestrator Output">
        {orchestrate.isPending ? (
          <p className="muted">Processing...</p>
        ) : result ? (
          <div className="stack">
            <div className="grid2">
              <Field label="Summary">
                <p>{result.summary}</p>
              </Field>
              <Field label="Intent">
                <p>{result.intent}</p>
              </Field>
              <Field label="Urgency">
                <p>{result.urgency}</p>
              </Field>
              <Field label="Routed to">
                <p>{result.routedTo}</p>
              </Field>
              <Field label="Final Status">
                <p>{result.finalStatus}</p>
              </Field>
              <Field label="Trace ID">
                <p>{result.traceId}</p>
              </Field>
            </div>
            {result.fallbackUsed && (
              <Alert variant="warn">Fallback used</Alert>
            )}
          </div>
        ) : (
          <p className="muted">Submit a message to see the orchestration result.</p>
        )}
      </Card>
    </div>
  )
}