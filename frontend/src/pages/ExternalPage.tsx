import { useMemo, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Textarea } from '../components/Textarea'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { JsonPanel } from '../components/JsonPanel'
import { useApi } from '../api/useApi'
import { getErrorMessage } from '../api/errors'

export function ExternalPage() {
  const api = useApi()
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

  const llm = useMutation({ mutationFn: () => api.externalLlm({ model, prompt }) })
  const appMutation = useMutation({
    mutationFn: () => {
      if (!parsedParams) throw new Error('params must be valid JSON')
      return api.externalApp({ app, action, params: parsedParams })
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
          {llm.isError ? <Alert variant="danger">{getErrorMessage(llm.error)}</Alert> : null}
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
          {appMutation.isError ? <Alert variant="danger">{getErrorMessage(appMutation.error)}</Alert> : null}
          {appMutation.data ? <JsonPanel value={appMutation.data} /> : <p className="muted">No result yet.</p>}
        </div>
      </Card>
    </div>
  )
}

