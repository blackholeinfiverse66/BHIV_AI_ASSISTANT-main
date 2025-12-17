import type { ReactNode } from 'react'

export function JsonPanel({ value, footer }: { value: unknown; footer?: ReactNode }) {
  return (
    <div className="jsonPanel">
      <pre className="jsonPanel__pre">{JSON.stringify(value, null, 2)}</pre>
      {footer ? <div className="jsonPanel__footer">{footer}</div> : null}
    </div>
  )
}

