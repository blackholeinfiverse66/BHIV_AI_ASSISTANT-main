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

export function NluPage() {
  const api = useApi()

  const [text, setText] = useState('Remind me to call John tomorrow at 3pm')
  const [intent, setIntent] = useState('task')
  const [entitiesJson, setEntitiesJson] = useState('{"text":"Call John"}')
  const [contextJson, setContextJson] = useState('{}')

  const parsedEntities = useMemo(() => {
    try {
      return entitiesJson.trim() ? JSON.parse(entitiesJson) : {}
    } catch {
      return null
    }
  }, [entitiesJson])

  const parsedContext = useMemo(() => {
    try {
      return contextJson.trim() ? JSON.parse(contextJson) : {}
    } catch {
      return null
    }
  }, [contextJson])

  const summarize = useMutation({
    mutationFn: () => api.summarize({ text }),
  })

  const detectIntent = useMutation({
    mutationFn: () => api.intent({ text }),
  })

  const classifyTask = useMutation({
    mutationFn: () => {
      if (!parsedEntities || !parsedContext) {
        throw new Error('Entities/Context must be valid JSON')
      }

      return api.classifyTask({
        intent,
        entities: parsedEntities,
        context: parsedContext,
        text,
      })
    },
  })

  return (
    <div className="grid">
      <Card title="Input">
        <div className="stack">
          <Field label="Text">
            <Textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </Field>

          <div className="row row--wrap">
            <Button
              variant="secondary"
              onClick={() => summarize.mutate()}
              loading={summarize.isPending}
            >
              Summarize
            </Button>

            <Button
              variant="secondary"
              onClick={() => detectIntent.mutate()}
              loading={detectIntent.isPending}
            >
              Intent
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Task classification (/api/task)">
        <div className="stack">
          <Field label="Intent">
            <Input
              value={intent}
              onChange={(e) => setIntent(e.target.value)}
            />
          </Field>

          <Field
            label="Entities (JSON)"
            hint={
              parsedEntities === null ? (
                <span className="danger">Invalid JSON</span>
              ) : null
            }
          >
            <Textarea
              rows={4}
              value={entitiesJson}
              onChange={(e) => setEntitiesJson(e.target.value)}
            />
          </Field>

          <Field
            label="Context (JSON)"
            hint={
              parsedContext === null ? (
                <span className="danger">Invalid JSON</span>
              ) : null
            }
          >
            <Textarea
              rows={3}
              value={contextJson}
              onChange={(e) => setContextJson(e.target.value)}
            />
          </Field>

          {classifyTask.isError && (
            <Alert variant="danger" title="Classification failed">
              {(classifyTask.error as Error).message}
            </Alert>
          )}

          <Button
            onClick={() => classifyTask.mutate()}
            loading={classifyTask.isPending}
          >
            Build task
          </Button>
        </div>
      </Card>

      <Card title="Outputs">
        <div className="stack">
          {summarize.data && <JsonPanel value={summarize.data} />}
          {detectIntent.data && <JsonPanel value={detectIntent.data} />}
          {classifyTask.data && <JsonPanel value={classifyTask.data} />}

          {!summarize.data && !detectIntent.data && !classifyTask.data && (
            <p className="muted">Run a flow to see output.</p>
          )}
        </div>
      </Card>
    </div>
  )
}
