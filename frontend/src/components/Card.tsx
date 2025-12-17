import type { PropsWithChildren, ReactNode } from 'react'
import clsx from 'clsx'

export function Card({ title, actions, children, className }: PropsWithChildren<{ title?: ReactNode; actions?: ReactNode; className?: string }>) {
  return (
    <section className={clsx('card', className)}>
      {(title || actions) && (
        <header className="card__header">
          {title ? <h2 className="card__title">{title}</h2> : <span />}
          {actions ? <div className="card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="card__body">{children}</div>
    </section>
  )
}

