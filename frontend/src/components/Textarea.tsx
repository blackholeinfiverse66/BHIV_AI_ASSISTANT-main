import type { TextareaHTMLAttributes } from 'react'
import { forwardRef } from 'react'
import clsx from 'clsx'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return <textarea ref={ref} {...props} className={clsx('textarea', className)} />
  }
)

Textarea.displayName = 'Textarea'

