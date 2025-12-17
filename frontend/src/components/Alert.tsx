import type { ReactNode } from 'react'
import clsx from 'clsx'

export function Alert({ variant = 'info', title, children }: { variant?: 'info' | 'danger' | 'success' | 'warn'; title?: string; children: ReactNode }) {
  return (
    <div className={clsx('alert', `alert--${variant}`)} role={variant === 'danger' ? 'alert' : 'status'}>
      {title ? <div className="alert__title">{title}</div> : null}
      <div className="alert__body">{children}</div>
    </div>
  )
}

