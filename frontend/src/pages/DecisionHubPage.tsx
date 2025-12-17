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

export function DecisionHubPage() {
  const api = useApi()
  const [inputText, setInputText] = useState('Schedule a meeting tomorrow with Alex')
  const [platform, setPlatform] = useState('web')
  const [deviceContext, setDeviceContext] = useState('desktop')
  const [voiceInput, setVoiceInput] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)

  const [stateJson, setStateJson] = useState('{"mood":"focused","time":"morning"}')
  const [actionsJson, setActionsJson] = useState('["respond","bhiv_core","summarize"]')

  const parsedState = useMemo(() => {
    try {
      return stateJson.trim() ? JSON.parse(stateJson) : {}
    } catch {
      return null
    }
  }, [stateJson])

  const parsedActions = useMemo(() => {
    try {
      const v = actionsJson.trim() ? JSON.parse(actionsJson) : []
      return Array.isArray(v) ? v : null
    } catch {
      return null
    }
  }, [actionsJson])

  const decision = useMutation({
    mutationFn: () =>
      api.decisionHub({
        input_text: inputText,
        platform,
        device_context: deviceContext,
        voice_input: voiceInput,
        audio_file: audioFile,
      }),
  })

  const rl = useMutation({
    mutationFn: () => {
      if (!parsedState) throw new Error('state must be valid JSON object')
      if (!parsedActions) throw new Error('actions must be valid JSON array')
      return api.rlAction({ state: parsedState, actions: parsedActions })
    },
  })

  const canUpload = useMemo(() => voiceInput, [voiceInput])

  return (
    <div className="grid">
      <Card title="Decision Hub (/api/decision_hub)">
        <div className="stack">
          <Field label="input_text">
            <Textarea rows={4} value={inputText} onChange={(e) => setInputText(e.target.value)} />
          </Field>
          <div className="grid2">
            <Field label="platform">
              <Input value={platform} onChange={(e) => setPlatform(e.target.value)} />
            </Field>
            <Field label="device_context">
              <Input value={deviceContext} onChange={(e) => setDeviceContext(e.target.value)} />
            </Field>
          </div>
          <label className="check">
            <input type="checkbox" checked={voiceInput} onChange={(e) => setVoiceInput(e.target.checked)} />
            <span>voice_input (enables optional audio upload)</span>
          </label>
          <input type="file" disabled={!canUpload} accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
          <Button onClick={() => decision.mutate()} loading={decision.isPending}>
            Make decision
          </Button>
          {decision.isError ? <Alert variant="danger">{getErrorMessage(decision.error)}</Alert> : null}
        </div>
      </Card>
      <Card title="Output">
        {decision.data ? <JsonPanel value={decision.data} /> : <p className="muted">No output yet.</p>}
      </Card>

      <Card title="RL Action Selector (/api/rl_action)">
        <div className="stack">
          <Field label="state (JSON)" hint={parsedState === null ? <span className="danger">Invalid JSON</span> : 'Any shape'}>
            <Textarea rows={4} value={stateJson} onChange={(e) => setStateJson(e.target.value)} />
          </Field>
          <Field label="actions (JSON array)" hint={parsedActions === null ? <span className="danger">Must be a JSON array</span> : 'Example: ["respond","bhiv_core"]'}>
            <Textarea rows={3} value={actionsJson} onChange={(e) => setActionsJson(e.target.value)} />
          </Field>
          <Button variant="secondary" onClick={() => rl.mutate()} loading={rl.isPending}>
            Select action
          </Button>
          {rl.isError ? <Alert variant="danger">{getErrorMessage(rl.error)}</Alert> : null}
          {rl.data ? <JsonPanel value={rl.data} /> : <p className="muted">No RL output yet.</p>}
        </div>
      </Card>
    </div>
  )
}

