import { Link } from 'react-router-dom'
import { Card } from '../components/Card'

export function NotFoundPage() {
  return (
    <div className="centerPage">
      <Card title="Page not found" className="centerCard">
        <p className="muted">The page you requested does not exist.</p>
        <Link className="pill" to="/">
          Go to dashboard
        </Link>
      </Card>
    </div>
  )
}

