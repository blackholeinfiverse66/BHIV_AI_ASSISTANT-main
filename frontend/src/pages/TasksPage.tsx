import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Card } from '../components/Card'
import { Field } from '../components/Field'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { Spinner } from '../components/Spinner'
import { useApi } from '../api/useApi'
import { getErrorMessage, ApiError } from '../api/errors'
import type { Task, TaskListResponse, TaskResponse, TaskDeleteResponse } from '../api/types'

export function TasksPage() {
  const api = useApi()
  const qc = useQueryClient()
  const [description, setDescription] = useState('')

  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: () => api.listTasks(),
  })

  const createMutation = useMutation<TaskResponse, ApiError, void, { prev?: TaskListResponse }>({
    mutationFn: () => api.createTask({ description }),
    onMutate: async () => {
      const prev = qc.getQueryData<TaskListResponse>(['tasks'])
      const optimistic: Task = {
        id: -Date.now(),
        description,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      qc.setQueryData(['tasks'], (old: TaskListResponse | undefined) => old ? { ...old, data: [optimistic, ...old.data] } : { message: 'Optimistic', data: [optimistic], meta: {} })
      setDescription('')
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const deleteMutation = useMutation<TaskDeleteResponse, ApiError, number, { prev?: TaskListResponse }>({
    mutationFn: (id) => api.deleteTask(id),
    onMutate: async (id) => {
      const prev = qc.getQueryData<TaskListResponse>(['tasks'])
      qc.setQueryData(['tasks'], (old: TaskListResponse | undefined) => old ? { ...old, data: old.data.filter((t) => t.id !== id) } : old)
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(['tasks'], ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const sorted = useMemo(() => {
    const items = tasksQuery.data?.data || []
    return [...items].sort((a, b) => b.id - a.id)
  }, [tasksQuery.data])

  return (
    <div className="grid">
      <Card title="Create task">
        <div className="stack">
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., follow up with John"
            />
          </Field>

          {createMutation.isError ? (
            <Alert variant="danger" title="Create failed">
              {createMutation.error.message}
            </Alert>
          ) : null}

          <Button
            onClick={() => createMutation.mutate()}
            loading={createMutation.isPending}
            disabled={!description.trim()}
          >
            Create
          </Button>

          {createMutation.isSuccess ? (
            <Alert variant="success" title="Success">
              {createMutation.data.message}
            </Alert>
          ) : null}
        </div>
      </Card>

      <Card
        title="Tasks"
        actions={
          <Button
            variant="secondary"
            onClick={() => tasksQuery.refetch()}
            loading={tasksQuery.isFetching}
          >
            Refresh
          </Button>
        }
      >
        {tasksQuery.isLoading ? <Spinner /> : null}

        {tasksQuery.isError ? (
          <Alert variant="danger" title="Failed to load">
            {getErrorMessage(tasksQuery.error)}
          </Alert>
        ) : null}

        {!tasksQuery.isLoading && sorted.length === 0 ? (
          <p className="muted">No tasks yet.</p>
        ) : null}

        <div className="table">
          {sorted.map((t) => (
            <div key={t.id} className="table__row">
              <div className="table__main">
                <div className="table__title">
                  <Link to={`/tasks/${t.id}`}>{t.description}</Link>
                </div>
                <div className="table__meta">Status: {t.status}</div>
              </div>
              <div className="table__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteMutation.mutate(t.id)}
                  loading={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
