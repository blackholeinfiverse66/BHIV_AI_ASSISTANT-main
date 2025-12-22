import { Card } from '../components/Card'

export function DashboardPage() {
  return (
    <div className="grid">
      <Card title="Quick links">
        <ul className="list">
          <li>Use Chat for /api/summarize and /api/bhiv/run.</li>
          <li>Use Tasks to create and manage DB-backed tasks.</li>
          <li>Use NLU for summarize/intent/task classification.</li>
          <li>Use Voice for STT upload and TTS playback.</li>
        </ul>
      </Card>
      <Card title="What this UI covers">
        <p className="muted">
          This client wires every backend router exposed in FastAPI under <code>/api</code>, including multipart uploads and
          database-backed CRUD.
        </p>
      </Card>
    </div>
  )
}

