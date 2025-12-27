import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import { useApi } from '../api/useApi'
import { getErrorMessage } from '../api/errors'

export function TaskDetailPage() {
  const api = useApi()
  const qc = useQueryClient()
  const params = useParams()
  const taskId = Number(params.taskId)

  const taskQuery = useQuery({
    queryKey: ['task', taskId],
    queryFn: () => api.getTask(taskId),
    enabled: Number.isFinite(taskId),
  })

  const current = taskQuery.data

  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'done'>('pending')

  useEffect(() => {
    if (!current) return
    setDescription(current.description)
    setStatus(current.status as 'pending' | 'in_progress' | 'done')
  }, [current])

  const saveMutation = useMutation({
    mutationFn: () => api.updateTask(taskId, { description, status }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['task', taskId] })
      await qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return (
    <div className="grid">
      <Card title="Task detail" actions={<Link className="pill" to="/tasks">Back</Link>}>
        {!Number.isFinite(taskId) ? <Alert variant="danger">Invalid task id.</Alert> : null}

        {taskQuery.isLoading ? <Spinner /> : null}

        {taskQuery.isError ? (
          <Alert variant="danger" title="Load failed">
            {getErrorMessage(taskQuery.error)}
          </Alert>
        ) : null}

        {current ? (
          <div className="stack">
            <Field label="Description">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>

            <Field label="Status">
              <select
                className="select"
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'pending' | 'in_progress' | 'done')
                }
              >
                <option value="pending">pending</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
              </select>
            </Field>

            {saveMutation.isError ? (
              <Alert variant="danger">
                {getErrorMessage(saveMutation.error)}
              </Alert>
            ) : null}

            <Button
              onClick={() => saveMutation.mutate()}
              loading={saveMutation.isPending}
              disabled={!description.trim()}
            >
              Save
            </Button>
          </div>
        ) : null}
      </Card>
    </div>
  )
}
