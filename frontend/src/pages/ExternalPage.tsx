import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { JsonPanel } from '../components/JsonPanel'
import { apiPost } from '../lib/api.js'

export function ExternalPage() {
  const [model, setModel] = useState('uniguru')
  const [prompt, setPrompt] = useState('Write a one sentence summary of BHIV.')

  const [app, setApp] = useState('notion')
  const [action, setAction] = useState('create_page')
  const [paramsJson, setParamsJson] = useState('{"title":"BHIV","content":"Hello"}')

  const parsedParams = useMemo(() => {
    try {
      return paramsJson.trim() ? JSON.parse(paramsJson) : {}
    } catch {
      return null
    }
  }, [paramsJson])

  const llm = useMutation<any>({ mutationFn: () => apiPost('/external_llm', { model, prompt }) })
  const appMutation = useMutation<any>({
    mutationFn: () => {
      if (!parsedParams) throw new Error('params must be valid JSON')
      return apiPost('/external_app', { app, action, params: parsedParams })
    },
  })

  return (
    <div className="grid">
      <Card title="External LLM (/api/external_llm)">
        <div className="stack">
          <div className="grid2">
            <Field label="model">
              <select className="select" value={model} onChange={(e) => setModel(e.target.value)}>
                <option value="uniguru">uniguru</option>
                <option value="chatgpt">chatgpt</option>
                <option value="groq">groq</option>
                <option value="gemini">gemini</option>
                <option value="mistral">mistral</option>
              </select>
            </Field>
          </div>
          <Field label="prompt">
            <Textarea rows={5} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          </Field>
          <Button variant="secondary" onClick={() => llm.mutate()} loading={llm.isPending}>
            Call LLM
          </Button>
          {llm.isError ? <Alert variant="danger">{llm.error.message}</Alert> : null}
          {llm.data ? <JsonPanel value={llm.data} /> : <p className="muted">No response yet.</p>}
        </div>
      </Card>

      <Card title="External app integration (/api/external_app)">
        <div className="stack">
          <div className="grid3">
            <Field label="app">
              <Input value={app} onChange={(e) => setApp(e.target.value)} placeholder="notion | googlesheets | trello | email | webhook" />
            </Field>
            <Field label="action">
              <Input value={action} onChange={(e) => setAction(e.target.value)} placeholder="action name" />
            </Field>
          </div>
          <Field label="params (JSON)" hint={parsedParams === null ? <span className="danger">Invalid JSON</span> : 'Depends on integration'}>
            <Textarea rows={6} value={paramsJson} onChange={(e) => setParamsJson(e.target.value)} />
          </Field>
          <Button onClick={() => appMutation.mutate()} loading={appMutation.isPending}>
            Run integration
          </Button>
          {appMutation.isError ? <Alert variant="danger">{appMutation.error.message}</Alert> : null}
          {appMutation.data ? <JsonPanel value={appMutation.data} /> : <p className="muted">No result yet.</p>}
        </div>
      </Card>
    </div>
  )
}

